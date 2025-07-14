import { hash } from "bcryptjs";
import { env } from "../../../config/env.js";
import { RequestContext } from "../../../middleware/context.js";
import jwt from "jsonwebtoken";
import { HttpResponse } from "../../../utils/service-response.js";
import { ROLE } from "../../../config/constants.js";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../error-handler/index.js";
import { AuthProvider } from "@/types/model/i-user-model.js";
import User from "../../../models/user.model.js";
import { EmailService } from "../../../services/email.service.js";
import * as crypto from "crypto";

const generateAccessToken = (userId: string, role: ROLE) =>
  jwt.sign({ userId, role, tokenType: "access" }, env.JWT_SECRET, {
    expiresIn: "1d",
  });

export const AuthController = {
  register: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { body, files } = context;
        const { username, email, password } = body;

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
          throw new ConflictError("Email already registered", {
            field: "email",
            value: email,
          });
        }

        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
          throw new ConflictError("Username already taken", {
            field: "username",
            value: username,
          });
        }

        let profileImageUrl = null;
        if (files && files.length > 0) {
          const profileImage = files[0];
          profileImageUrl = profileImage.publicUrl;
        }

        const userData = {
          username,
          email,
          password,
          role: ROLE.USER,
          provider: AuthProvider.LOCAL,
          profileImage: profileImageUrl,
        };

        const { user, token } =
          await User.createWithEmailVerification(userData);

        // const accessToken = generateAccessToken(user.id, user.role);
        // const refreshToken = user.generateRefreshToken();

        await user.save({ transaction });

        await EmailService.sendVerificationEmail(
          user.email,
          user.username,
          token
        ).then((sent) => {
          // console.log("Email sent status:", sent);
          if (!sent) {
            console.error("Failed to send verification email");
          }
        });

        return {
          user: user.toSafeObject(),
          // tokens: {
          //   accessToken,
          //   refreshToken,
          // },
          message:
            "Registration successful. Please check your email to verify your account.",
        };
      });

      return HttpResponse.send(context.res, result, 201);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  login: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { email, password } = context.body;

        const user = await User.findByEmailWithPassword(email);
        if (!user) throw new NotFoundError("Invalid credentials");
        if (user.isAccountLocked()) {
          throw new AuthenticationError("Account locked. Try again later.");
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
          await user.incrementLoginAttempts();
          throw new AuthenticationError("Invalid credentials");
        }

        await user.resetLoginAttempts();
        user.lastLogin = new Date();
        user.lastActive = new Date();

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = user.generateRefreshToken();

        await user.save({ transaction });

        await EmailService.sendLoginNotification(
          user.email,
          user.username
        ).then((sent) => {
          // console.log("Email sent status:", sent);
          if (!sent) {
            console.error("Failed to send verification email");
          }
        });

        return {
          user: user.toSafeObject(),
          tokens: {
            accessToken,
            refreshToken,
          },
          message: "Login successful",
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  refreshToken: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { refreshToken } = context.body;
        if (!refreshToken) throw new ValidationError("Refresh token required");

        const user = await User.findByRefreshToken(refreshToken);
        if (!user) throw new AuthenticationError("Invalid refresh token");

        if (!user.isRefreshTokenValid()) {
          throw new AuthenticationError("Refresh token expired");
        }

        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = user.generateRefreshToken();

        user.lastActive = new Date();
        await user.save({ transaction });

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  logout: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const userId = context.user?.id;
        // console.log("user id in logout : ", userId);

        const user = await User.findByPk(userId);
        if (user) {
          user.setDataValue("refreshToken", null);
          user.setDataValue("refreshTokenExpires", null);
          await user.save({ transaction });
        }

        return {
          message: "Logout successful",
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  verifyEmail: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { token } = context.params;
        // console.log("Verification token received:", token);

        const user = await User.scope("withTokens").findOne({
          where: { emailVerificationToken: token },
          transaction,
          rejectOnEmpty: false,
        });

        if (!user) {
          throw new ValidationError("Invalid verification token");
        }

        // console.log("User found:", user.id);
        // console.log("Token expires at:", user.emailVerificationTokenExpires);

        if (
          !user.emailVerificationTokenExpires ||
          user.emailVerificationTokenExpires < new Date()
        ) {
          throw new ValidationError("Token expired or invalid");
        }

        await user.update(
          {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpires: null,
          },
          { transaction }
        );

        return {
          message: "Email verified successfully",
          user: user.toSafeObject(),
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error: any) {
      console.error("Verification failed:", {
        error: error.message,
        stack: error.stack,
        time: new Date(),
      });
      throw error;
    }
  },

  requestPasswordReset: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { email } = context.body;

        const user = await User.findByEmail(email);
        if (!user) {
          // Still return success to prevent email enumeration attacks
          return {
            message:
              "If the email exists, a password reset link has been sent.",
          };
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save({ transaction });

        await EmailService.sendPasswordResetEmail(
          user.email,
          user.username,
          resetToken
        ).then((sent) => {
          // console.log("please check your email : ");
          if (!sent) {
            console.error("Failed to send password reset email");
          }
        });

        return {
          message: "If the email exists, a password reset link has been sent.",
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Password reset request error:", error);
      throw error;
    }
  },

  resetPassword: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { token } = context.params;
        const { password } = context.body;

        const user = await User.findByPasswordResetToken(token);
        if (!user) {
          throw new ValidationError("Invalid or expired password reset token");
        }

        if (!user.isPasswordResetTokenValid()) {
          throw new ValidationError("Password reset token has expired");
        }

        user.password = await hash(password, 12);
        user.setDataValue("passwordResetToken", null);
        user.setDataValue("passwordResetTokenExpires", null);
        user.setDataValue("refreshToken", null);
        user.setDataValue("refreshTokenExpires", null);

        await user.save({ transaction });

        return {
          message: "Password reset successful",
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  },

  getProfile: async (context: RequestContext) => {
    try {
      const userId = context.user?.id;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      return HttpResponse.send(context.res, user.toSafeObject(), 200);
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },
};
