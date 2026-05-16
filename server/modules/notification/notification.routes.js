import  express from "express"
import authMiddleware from "../../middleware/auth.middleware.js";
import { getNotification, markAsRead } from "./notification.controller.js"


const router = express.Router()

router.get("/", authMiddleware, getNotification)
router.put("/mark-as-read", authMiddleware, markAsRead)

export default router