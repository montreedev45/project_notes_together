import  express from "express"
import authMiddleware from "../../middleware/auth.middleware.js";
import { getNotification, deleteNotification, deleteAllNotifications, markAsRead } from "./notification.controller.js"


const router = express.Router()

router.get("/", authMiddleware, getNotification)
router.delete("/all", authMiddleware, deleteAllNotifications)
router.put("/mark-as-read", authMiddleware, markAsRead)
router.delete("/:noticId", authMiddleware, deleteNotification)

export default router