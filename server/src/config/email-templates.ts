import { env } from "./env.js";

export const EmailTemplates = {
  verificationEmail: (name: string, token: string) => ({
    subject: "Email Verification",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Welcome to ${env.SMTP_FROM_NAME}, ${name}!</h2>
      <p>Please verify your email address to complete your registration.</p>
      <p>Click the link below to verify your email:</p>
      <a href="${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}" 
       style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">
       Verify Email
      </a>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `,
  }),

  passwordResetEmail: (name: string, token: string) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Password Reset</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${env.FRONTEND_URL}/reset-password?token=${token}" 
           style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  }),

  loginNotification: (name: string) => ({
    subject: "Successful Login Notification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Login Detected</h2>
        <p>Hello ${name},</p>
        <p>You have successfully logged in to your account.</p>
        <p>If this wasn't you, please secure your account immediately.</p>
      </div>
    `,
  }),
};
