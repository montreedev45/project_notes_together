import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { getNote, saveNote } from "./note.controller.js";

const router = express.Router();

router.get("/:id", authMiddleware, getNote);
router.put("/:id", authMiddleware, saveNote);

export default router;
