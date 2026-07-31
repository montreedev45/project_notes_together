import express from "express"
import authMiddleware from "../../middleware/auth.middleware.js";
import { getPlan } from "./plan.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getPlan)

export default router;
