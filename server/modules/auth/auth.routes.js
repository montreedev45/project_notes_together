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
import { validateGoogleTokenInput } from '../../middleware/validateGoogleToken.js';
import rateLimit from "express-rate-limit";

const router = express.Router();

router.post("/register", rateLimit, register);
router.post("/login", rateLimit, login);
router.post("/logout", logout);
router.get("/verify", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authenticated",
    user: req.user,
  });
});
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.post("/check-duplicate-email", authMiddleware, checkDuplicateEmail);
router.post("/change-email", authMiddleware, changeEmail);
router.delete("/delete-account", authMiddleware, deleteAccount);
router.post("/users", authMiddleware, getUser)
router.post("/forgot-password", rateLimit ,forgotPassword)
router.post("/reset-password", rateLimit, resetPassword)
router.post("/upgrade-plan", authMiddleware, upgradePlan)
router.post('/google', rateLimit, validateGoogleTokenInput, googleLoginController);

export default router;
