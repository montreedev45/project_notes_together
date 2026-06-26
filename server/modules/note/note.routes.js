import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { uploadImage } from "../../middleware/upload.middleware.js";
import { getNote, saveNote, handleUploadResponse } from "./note.controller.js";

const router = express.Router();

router.get("/:id", authMiddleware, getNote);
router.put("/:id", authMiddleware, saveNote);
router.post("/upload",uploadImage , handleUploadResponse);

export default router;
