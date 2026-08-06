import z from "zod";

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
        ),

      email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(255, "Email is too long"),

      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(30, "Password is too long"),
    })
    .strict(), // .strict() ป้องกันผู้ใช้แอบส่ง field อื่นที่ไม่ได้รับอนุญาตเข้ามา
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .max(255, "Email is too long")
        .trim(),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(30, "Password is too long"),
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
        .optional(), // ใส่ optional() ไว้ท้ายสุด

      avatar: z.string().optional(),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(255, "Email is too long")
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
        .max(30, "Current password too long"),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters")
        .max(30, "New password too long"),
      confirmPassword: z
        .string({ required_error: "Confirm password is required" })
        .min(6, "Confirm password must be at least 6 characters")
        .max(30, "Confirm password too long"),
    })
    .strict(),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      currentEmail: z
        .string({ required_error: "Current email is required" })
        .email("Invalid email format")
        .trim(),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z
        .string({ required_error: "Token is required" })
        .trim()
        .min(10, "Token is required"), // ป้องกันการส่ง string ว่าง "" มา

      email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters")
        .max(30, "New password is too long")
        .trim(),
    })
    .strict(),
});

export const checkDuplicateEmailSchema = z.object({
  body: z
    .object({
      newEmail: z
        .string({ required_error: "New email is required" })
        .trim()
        .email("Invalid email format"),
      currentPassword: z
        .string({ required_error: "Current password is required" })
        .trim()
        .min(6, "Current password must be at least 6 characters")
        .max(30, "Current password is too long"),
    })
    .strict(),
});

export const changeEmailSchema = z.object({
  body: z.object({
    temporalyToken: z
      .string({ required_error: "Temporaly token is required" })
      .trim()
      .min(20, "Temporaly token must be at least 20 characters"),
    verifyCode: z
      .string({ required_error: "Verify code is required" })
      .trim()
      .min(6, "Verify code must be at least 6 characters"),
  }),
});

export const getUserSchema = z.object({
  body: z
    .object({
      searchTerm: z
        .string()
        .max(10, "Search term must be at least 10 characters")
        .optional(),
    })
    .strict(),
});

export const googleLoginControllerSchema = z.object({
  body: z
    .object({
      credential: z
        .string({ required_error: "Credential is required" })
        .trim()
        .min(10, "Credential must be at least 10 characters"),
    })
    .strict(),
});

export const upgradePlanSchema = z.object({
  body: z.object({
    planId: z
      .string({ required_error: "Plan id is required" })
      .trim()
      .min(5, "Plan is must be at least 5 characters"),
  }),
});
