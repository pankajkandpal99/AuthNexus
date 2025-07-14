import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const registerFormSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    profileImage: z
      .instanceof(File, { message: "Profile image is required" })
      .refine(
        (file) => file.size <= 5 * 1024 * 1024,
        "File size must be less than 5MB"
      )
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Only JPEG, PNG, and WEBP formats are supported"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    token: z.string().min(1, "Token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  profileImage: z
    .union([z.instanceof(File), z.string(), z.null()])
    .refine(
      (val) => !val || typeof val === "string" || val instanceof File,
      "Must be a valid file or URL"
    )
    .optional(),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
