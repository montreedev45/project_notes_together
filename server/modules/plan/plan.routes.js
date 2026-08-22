import express from "express"
import authMiddleware from "../../middleware/auth.middleware.js";
import { getPlan } from "./plan.controller.js";
import { apiLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", authMiddleware, apiLimiter, getPlan)

export default router;
