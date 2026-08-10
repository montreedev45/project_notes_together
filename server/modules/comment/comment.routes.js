import express from "express"
import authMiddleware from "../../middleware/auth.middleware.js"
import { getComment, addComment, getAllSticker, getSticker } from "./comment.controller.js";
import { addCommentSchema, getCommentSchema, getStickerSchema } from "./comment.schema.js";
import { validate } from '../../middleware/validateZod.js'
import { writeLimiter, apiLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", authMiddleware, apiLimiter, validate(getCommentSchema), getComment)
router.post("/", authMiddleware, writeLimiter ,validate(addCommentSchema) ,addComment)
router.get("/stickers/all", authMiddleware, apiLimiter, getAllSticker)
router.get("/sticker", apiLimiter, validate(getStickerSchema), getSticker)

export default router;