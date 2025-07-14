import { ROLE } from "../../config/constants.js";

export enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
  FACEBOOK = "facebook",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

export interface IUserInstance {
  id: string;
  username: string;
  email: string;
  password: string;
  role: ROLE;
  profileImage?: string | null;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationTokenExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpires?: Date | null;
  refreshToken?: string | null;
  refreshTokenExpires?: Date | null;
  loginAttempts: number;
  lockedUntil?: Date | null;
  lastLogin?: Date | null;
  lastActive?: Date | null;
  provider: AuthProvider;
  providerId?: string | null;
  status: UserStatus;
  profileCompleted: boolean;
  preferences?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
