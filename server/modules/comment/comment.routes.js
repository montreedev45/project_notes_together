import express from "express"
import authMiddleware from "../../middleware/auth.middleware.js"
import { getComment, addComment, getAllSticker, getSticker } from "./comment.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getComment)
router.post("/", authMiddleware, addComment)

router.get("/sticker", getSticker)
router.get("/stickers/all", authMiddleware, getAllSticker)

export default router;