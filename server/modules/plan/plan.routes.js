import express from "express"
import authMiddleware from "../../middleware/auth.middleware.js";
import { getPlan, upgradePlan } from "./plan.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getPlan)
router.post("/upgrade-plan", authMiddleware, upgradePlan)

export default router;
