import React, { lazy } from "react";

const Home = lazy(() => import("../pages/Home"));
// const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const MyProfile = lazy(() => import("../pages/MyProfile"));
const Users = lazy(() => import("../pages/Users"));
const UserProfile = lazy(() => import("../pages/UserProfile"));

const NotFound = lazy(() => import("../pages/NotFound"));

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const EmailVerificationSent = lazy(
  () => import("../pages/EmailVerificationSent")
);
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const PasswordResetSent = lazy(() => import("../pages/PasswordResetSent"));
const PasswordResetSuccess = lazy(
  () => import("../pages/PasswordResetSuccess")
);

interface RouteConfig {
  path: string;
  element: React.ComponentType;
  fullWidth?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  { path: "/", element: Home, fullWidth: true },
];

export const authRoutes: RouteConfig[] = [
  { path: "/login", element: Login },
  { path: "/register", element: Register },

  { path: "/verify-email", element: VerifyEmail },
  { path: "/email-verification-sent", element: EmailVerificationSent },

  { path: "/forgot-password", element: ForgotPassword },
  { path: "/reset-password", element: ResetPassword },
  { path: "/password-reset-sent", element: PasswordResetSent },
  { path: "/password-reset-success", element: PasswordResetSuccess },
];

export const protectedRoutes: RouteConfig[] = [
  // { path: "/dashboard", element: AdminDashboard },
  { path: "/profile", element: Profile },
  { path: "/my-profile", element: MyProfile },
  { path: "/users", element: Users },
  { path: "/users/:id", element: UserProfile },
];

export const notFoundRoute: RouteConfig = { path: "*", element: NotFound };
