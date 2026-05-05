import express from "express";
import {
  register,
  login,
  updateProfile,
  changePassword,
  checkDuplicateEmail,
  changeEmail,
  deleteAccount,
  getUser
} from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
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

export default router;
