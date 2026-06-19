import express from "express"
import authMiddleware from "../../middleware/auth.middleware.js"
import { getComment, addComment } from "./comment.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getComment)
router.post("/", authMiddleware, addComment)

export default router;