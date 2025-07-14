import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot be more than 20 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    profileImage: z
      .object({
        originalname: z.string(),
        mimetype: z.string().regex(/^image\/(jpeg|png|webp)$/),
        size: z.number().max(5 * 1024 * 1024), // 5MB max
        buffer: z.instanceof(Buffer),
        filename: z.string().optional(), // For stored files
        path: z.string().optional(), // For stored files
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .optional(),
  profileImage: z
    .object({
      originalname: z.string(),
      mimetype: z.string().regex(/^image\/(jpeg|png|webp)$/),
      size: z.number().max(5 * 1024 * 1024), // 5MB max
      buffer: z.instanceof(Buffer),
      filename: z.string().optional(),
      path: z.string().optional(),
    })
    .optional(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type RefreshTokenValues = z.infer<typeof refreshTokenSchema>;
