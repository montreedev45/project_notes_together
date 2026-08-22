import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
  getNotification,
  deleteNotification,
  deleteAllNotifications,
  markAsRead,
} from "./notification.controller.js";
import { validate } from "../../middleware/validateZod.js";
import { apiLimiter } from "../../middleware/rateLimiter.js";
import { deleteNotificationSchema } from "./notification.schema.js";

const router = express.Router();

router.get("/", authMiddleware, apiLimiter, getNotification);
router.delete("/all", authMiddleware, apiLimiter, deleteAllNotifications);
router.put("/mark-as-read", authMiddleware, apiLimiter, markAsRead);
router.delete(
  "/:noticId",
  authMiddleware,
  apiLimiter,
  validate(deleteNotificationSchema),
  deleteNotification,
);

export default router;