import { Router } from "express";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../../../schema/authSchema.js";
import { createApiHandler } from "../../../utils/api-factory.js";
import { AuthController } from "../controllers/auth.controller.js";
import { withFileUpload } from "@/utils/file-upload-utils.js";

export default (router: Router) => {
  router.post(
    "/auth/register",
    createApiHandler(
      AuthController.register,
      withFileUpload(
        {
          requireAuth: false,
          bodySchema: registerSchema,
          useTransaction: true,
        },
        "file",
        {
          convertTextToJson: true,
          validateBeforeAuth: false,
          pathStructure: "/my-profile",
          targetField: "profileImage",
        }
      )
    )
  );

  router.post(
    "/auth/login",
    createApiHandler(AuthController.login, {
      bodySchema: loginSchema,
      useTransaction: true,
      requireAuth: false,
    })
  );

  router.post(
    "/auth/refresh",
    createApiHandler(AuthController.refreshToken, {
      bodySchema: refreshTokenSchema,
      useTransaction: true,
      requireAuth: false,
    })
  );

  router.post(
    "/auth/logout",
    createApiHandler(AuthController.logout, {
      useTransaction: true,
      requireAuth: true,
    })
  );

  router.post(
    "/auth/verify-email/:token",
    createApiHandler(AuthController.verifyEmail, {
      useTransaction: true,
      requireAuth: false,
    })
  );

  router.post(
    "/auth/request-password-reset",
    createApiHandler(AuthController.requestPasswordReset, {
      useTransaction: true,
      requireAuth: false,
    })
  );

  router.post(
    "/auth/reset-password/:token",
    createApiHandler(AuthController.resetPassword, {
      useTransaction: true,
      requireAuth: false,
    })
  );

  router.get(
    "/auth/profile",
    createApiHandler(AuthController.getProfile, {
      requireAuth: true,
      useTransaction: true,
    })
  );
};
