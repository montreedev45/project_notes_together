import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(10, "Username must be at least 10 characters")
        .max(20, "Username cannot exceed 20 characters")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores",
        )
        .openapi({ example: "john_doe_123", description: "Unique username" }),

      email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(255, "Email is too long")
        .openapi({ example: "john@example.com", description: "Unique email" }),

      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(30, "Password is too long")
        .openapi({ example: "securePass!23" }),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .max(255, "Email is too long")
        .trim()
        .openapi({ example: "john@example.com" }),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(30, "Password is too long")
        .openapi({ example: "securePass!23" }),
    })
    .strict(),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .trim()
        .min(10, "Username must be at least 10 characters")
        .max(20, "Username cannot exceed 20 characters")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores",
        )
        .openapi({example: "john_doe_123"})
        .optional(),

      avatar: z.string().openapi({example: "#e2d5ae"}).optional(),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(255, "Email is too long")
        .openapi({example: "john@example.com"})
        .optional(),
    })
    .strict(),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: "Current password is required" })
        .min(6, "Current password must be at least 6 characters")
        .max(30, "Current password too long")
        .openapi({example: "securePass!23"}),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters")
        .max(30, "New password too long")
        .openapi({example: "newSecurePass!23"}),
      confirmPassword: z
        .string({ required_error: "Confirm password is required" })
        .min(6, "Confirm password must be at least 6 characters")
        .max(30, "Confirm password too long")
        .openapi({example: "newSecurePass!23"}),
    })
    .strict(),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      currentEmail: z
        .string({ required_error: "Current email is required" })
        .email("Invalid email format")
        .trim()
        .openapi({example: "john@example.com"}),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z
        .string({ required_error: "Token is required" })
        .trim()
        .min(10, "Token is required")
        .openapi({example: "arhsolfpeytlfvndlsyefvwkfllg"}),
      email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .openapi({example: "john@example.com"}),

      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters")
        .max(30, "New password is too long")
        .trim()
        .openapi({example: "newSecurePass!23"}),
    })
    .strict(),
});

export const checkDuplicateEmailSchema = z.object({
  body: z
    .object({
      newEmail: z
        .string({ required_error: "New email is required" })
        .trim()
        .email("Invalid email format")
        .openapi({example: "newJohn@example.com"}),
      currentPassword: z
        .string({ required_error: "Current password is required" })
        .trim()
        .min(6, "Current password must be at least 6 characters")
        .max(30, "Current password is too long")
        .openapi({example: "securePass!23"}),
    })
    .strict(),
});

export const changeEmailSchema = z.object({
  body: z
    .object({
      temporalyToken: z
        .string({ required_error: "Temporaly token is required" })
        .trim()
        .min(20, "Temporaly token must be at least 20 characters")
        .openapi({example: "eyJhbGciOiJIUzI1NiIsInR5cC..."}),
      verifyCode: z
        .string({ required_error: "Verify code is required" })
        .trim()
        .min(6, "Verify code must be at least 6 characters")
        .openapi({example: "214586"}),
    })
    .strict(),
});

export const getUserSchema = z.object({
  body: z
    .object({
      searchTerm: z
        .string()
        .max(10, "Search term must be at least 10 characters")
        .openapi({example: "user1"})
        .optional(),
    })
    .strict(),
});

export const googleLoginControllerSchema = z.object({
  body: z.object({
    credential: z
      .string({ required_error: "Credential is required" })
      .trim()
      .min(10, "Credential must be at least 10 characters")
      .openapi({example: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxMGY4NzQwNWE..."}),
  }),
});

export const upgradePlanSchema = z.object({
  body: z
    .object({
      planId: z
        .string({ required_error: "Plan id is required" })
        .trim()
        .min(5, "Plan is must be at least 5 characters")
        .openapi({example:"6a5e20ee4c374cae7d7d7768"}),
    })
    .strict(),
});
