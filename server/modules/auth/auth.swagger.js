import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  checkDuplicateEmailSchema,
  changeEmailSchema,
  getUserSchema,
  googleLoginControllerSchema,
  upgradePlanSchema,
} from "./auth.schema.js";

// สร้างฟังก์ชันรับค่า registry เข้ามา
export const setupAuthSwagger = (registry) => {
  // ลงทะเบียน Schema ไว้ใช้ซ้ำได้
  registry.register("Auth_Register", registerSchema);
  registry.register("Auth_Login", loginSchema);
  registry.register("Auth_UpdateProfile", updateProfileSchema);
  registry.register("Auth_ChangePassword", changePasswordSchema);
  registry.register("Auth_ForgotPassword", forgotPasswordSchema);
  registry.register("Auth_ResetPassword", resetPasswordSchema);
  registry.register("Auth_CheckDuplicateEmail", checkDuplicateEmailSchema);
  registry.register("Auth_ChangeEmail", changeEmailSchema);
  registry.register("Auth_GetUser", getUserSchema);
  registry.register("Auth_GoogleLogin", googleLoginControllerSchema);
  registry.register("Auth_UpgradePlan", upgradePlanSchema);

  // register
  registry.registerPath({
    method: "post",
    path: "/api/auth/register",
    tags: ["Auth"],
    summary: "Register member",
    description: "Register a new member",
    request: {
      body: {
        content: {
          "application/json": {
            schema: registerSchema.shape.body,
          },
        },
      },
    },
    responses: {
      201: {
        description:"Register successfully",
        content: {
          "application/json": {
            schema: z.object({
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe_123" }),
                email: z.string().openapi({ example: "john@gmail.com" }),
              }),
            }),
          },
        },
      },
    },
  });

  // login
  registry.registerPath({
    method: "post",
    path: "/api/auth/login",
    tags: ["Auth"],
    summary: "Login by user",
    description: "Login by user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: loginSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Login successfully",
        content: {
          "application/json": {
            schema: z.object({
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe_123" }),
                email: z.string().openapi({ example: "john@example.com" }),
              }),
            }),
          },
        },
      },
    },
  });

  // update profile
  registry.registerPath({
    method: "put",
    path: "/api/auth/profile",
    tags: ["Auth"],
    summary: "Update profile user",
    description: "Update profile user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: updateProfileSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Update profile successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Profile updated successfully" }),
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe_123" }),
                email: z.string().openapi({ example: "john@example.com" }),
                avatar: z.string().openapi({ example: "#e2d5ae" }),
                plan: z.string().openapi({ example: "free" }),
                googleId: z.string().openapi({ example: "test google id" }),
              }),
            }),
          },
        },
      },
    },
  });

  // change password
  registry.registerPath({
    method: "put",
    path: "/api/auth/change-password",
    tags: ["Auth"],
    summary: "Change password of user",
    description: "Change password of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: changePasswordSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Change password successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Password updated successfully" }),
            }),
          },
        },
      },
    },
  });

  // forgot password
  registry.registerPath({
    method: "post",
    path: "/api/auth/forgot-password",
    tags: ["Auth"],
    summary: "Forgot password of user",
    description: "Forgot password of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: forgotPasswordSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Forgot password successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z.string().openapi({
                example:
                  "If this email address is in the system, a password reset link has been sent.",
              }),
            }),
          },
        },
      },
    },
  });

  // reset password
  registry.registerPath({
    method: "post",
    path: "/api/auth/reset-password",
    tags: ["Auth"],
    summary: "Reset password of user",
    description: "Reset password of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: resetPasswordSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Reset password successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "reset password successfully" }),
            }),
          },
        },
      },
    },
  });

  // check duplicate email
  registry.registerPath({
    method: "post",
    path: "/api/auth/check-duplicate-email",
    tags: ["Auth"],
    summary: "Check duplicate email of user",
    description: "Check duplicate email of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: checkDuplicateEmailSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Check duplicate email successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Verification code sent" }),
              temporalyToken: z.string().openapi({
                example:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTBkZjE5ZTdhYTcwMzNkNDMxNjdlZCIsIm5ld0VtYWlsIjoibW9udHJlZS5kZXY0NUBnbWFpbC5jb20iLCJ0eXBlIjoiQ0hBTkdFX0VNQUlMX1ZFUklGWSIsImlhdCI6MTc4NzQ4OTE2OCwiZXhwIjoxNzg3NDg5NzY4fQ.y1RF-hh-FCgcgryd23AXOtJGA2m5Qek_PBnhW-HdPVo",
              }),
            }),
          },
        },
      },
    },
  });

  // change email
  registry.registerPath({
    method: "post",
    path: "/api/auth/change-email",
    tags: ["Auth"],
    summary: "Change email of user",
    description: "Change email of user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: changeEmailSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Change email successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Change email successfully" }),
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe" }),
                email: z.string().openapi({ example: "new_email@example.com" }),
                avatar: z.string().openapi({ example: "#3888f1" }),
                createdAt: z
                  .string()
                  .openapi({ example: "2024-04-16T13:07:37.439Z" }),
                updatedAt: z
                  .string()
                  .openapi({ example: "2024-08-23T13:22:48.143Z" }),
                __v: z.number().openapi({ example: 0 }),
                isDeleted: z.boolean().openapi({ example: false }),
                plan: z.string().openapi({ example: "free" }),
                googleId: z.string().openapi({ example: "" }),
              }),
            }),
          },
        },
      },
    },
  });

  // get user
  registry.registerPath({
    method: "post",
    path: "/api/auth/user",
    tags: ["Auth"],
    summary: "Get user",
    description: "Get user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: getUserSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Get user successfully",
        content: {
          "application/json": {
            schema: z.object({
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe" }),
                email: z.string().openapi({ example: "new_email@example.com" }),
                avatar: z.string().openapi({ example: "#3888f1" }),
                createdAt: z
                  .string()
                  .openapi({ example: "2024-04-16T13:07:37.439Z" }),
                updatedAt: z
                  .string()
                  .openapi({ example: "2024-08-23T13:22:48.143Z" }),
                __v: z.number().openapi({ example: 0 }),
                isDeleted: z.boolean().openapi({ example: false }),
                plan: z.string().openapi({ example: "free" }),
                googleId: z
                  .string()
                  .openapi({ example: "105422452168412709045" }),
              }),
            }),
          },
        },
      },
    },
  });

  // google login
  registry.registerPath({
    method: "post",
    path: "/api/auth/google",
    tags: ["Auth"],
    summary: "Login by google",
    description: "Login by google",
    request: {
      body: {
        content: {
          "application/json": {
            schema: googleLoginControllerSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Login by google successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe" }),
                email: z.string().openapi({ example: "new_email@example.com" }),
                avatar: z.string().openapi({ example: "#3888f1" }),
                googleId: z
                  .string()
                  .openapi({ example: "105422452168412709045" }),
              }),
            }),
          },
        },
      },
    },
  });

  // upgrade plan
  registry.registerPath({
    method: "post",
    path: "/api/auth/upgrade-plan",
    tags: ["Auth"],
    summary: "Upgrade plan",
    description: "Upgrade plan",
    request: {
      body: {
        content: {
          "application/json": {
            schema: upgradePlanSchema.shape.body,
          },
        },
      },
    },
    responses: {
      200: {
        description:"Upgrade plan successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z
                .string()
                .openapi({ example: "Plan upgraded successfully" }),
              user: z.object({
                _id: z.string().openapi({ example: "60d5ecb8b392d7..." }),
                username: z.string().openapi({ example: "john_doe" }),
                email: z.string().openapi({ example: "new_email@example.com" }),
                avatar: z.string().openapi({ example: "#3888f1" }),
                createdAt: z
                  .string()
                  .openapi({ example: "2024-04-16T13:07:37.439Z" }),
                updatedAt: z
                  .string()
                  .openapi({ example: "2024-08-23T13:22:48.143Z" }),
                __v: z.number().openapi({ example: 0 }),
                isDeleted: z.boolean().openapi({ example: false }),
                plan: z.string().openapi({ example: "free" }),
                googleId: z
                  .string()
                  .openapi({ example: "105422452168412709045" }),
              }),
            }),
          },
        },
      },
    },
  });
};
