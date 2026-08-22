import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import profile from "./user.controller.js";
import { apiLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.get("/profile", authMiddleware, apiLimiter, profile)

export default router;