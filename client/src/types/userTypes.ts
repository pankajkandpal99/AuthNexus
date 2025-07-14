/* eslint-disable @typescript-eslint/no-explicit-any */
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
  SUPER_ADMIN = "SUPER_ADMIN",
}

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

export interface UserPreferences {
  // Define preferences structure as per your application needs
  [key: string]: any;
}

export interface UserSession {
  id: string;
  // Add other session properties as needed
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  role: Role;
  profileImage?: string | null;
  isVerified: boolean;
  provider: AuthProvider;
  providerId?: string | null;
  status: UserStatus;
  profileCompleted: boolean;
  preferences?: UserPreferences;
  lastLogin?: Date | null;
  lastActive?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  isEmailVerified?: boolean;
  loginAttempts?: number;
  lockedUntil?: Date | null;

  isGuest: boolean;
  guestId?: string;
  guestExpiresAt?: Date;
}

export interface UserState {
  currentUser: UserData | null;
  viewedUser: UserData | null;
  users: UserData[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
  };
}
