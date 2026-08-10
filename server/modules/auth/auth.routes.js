import express from "express";
import {
  register,
  login,
  updateProfile,
  changePassword,
  checkDuplicateEmail,
  changeEmail,
  deleteAccount,
  getUser,
  forgotPassword,
  resetPassword,
  googleLoginController,
  logout,
  upgradePlan
} from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import { authLimiter, sensitiveActionLimiter, apiLimiter } from "../../middleware/rateLimiter.js";
import { validate } from "../../middleware/validateZod.js";
import { changeEmailSchema, changePasswordSchema, checkDuplicateEmailSchema, forgotPasswordSchema, getUserSchema, googleLoginControllerSchema, loginSchema, registerSchema, resetPasswordSchema, updateProfileSchema, upgradePlanSchema } from "./auth.schema.js";

const router = express.Router();

// Auth Routes (Strict Auth Limiter)
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/google", authLimiter, validate(googleLoginControllerSchema), googleLoginController);

// Sensitive Actions (Sensitive Action Limiter)
router.put("/change-password", authMiddleware, sensitiveActionLimiter, validate(changePasswordSchema), changePassword);
router.post("/change-email", authMiddleware, sensitiveActionLimiter, validate(changeEmailSchema), changeEmail);
router.post("/check-duplicate-email", authMiddleware, sensitiveActionLimiter, validate(checkDuplicateEmailSchema), checkDuplicateEmail);
router.post("/upgrade-plan", authMiddleware, sensitiveActionLimiter, validate(upgradePlanSchema), upgradePlan);

// Data Query / Search (API Limiter)
router.post("/users", authMiddleware, apiLimiter, validate(getUserSchema), getUser);

// Standard Authenticated Routes (ไม่ต้องใส่ Limiter แยก ยิงผ่าน Global Limiter ใน app.js ได้เลย)
router.post("/logout", logout);
router.get("/verify", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authenticated",
    user: req.user,
  });
});
router.put("/profile", authMiddleware, validate(updateProfileSchema), updateProfile);
router.delete("/delete-account", authMiddleware, deleteAccount);
export default router;
