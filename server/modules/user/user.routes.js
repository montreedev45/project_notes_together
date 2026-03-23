import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import profile from "./user.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, profile)

export default router;