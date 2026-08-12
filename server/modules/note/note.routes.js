import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { uploadImage } from "../../middleware/upload.middleware.js";
import { handleUploadResponse } from "./note.controller.js";
import { validate } from "../../middleware/validateZod.js";
import { uploadNoteImageSchema } from "./upload.schema.js";
import multer from 'multer';

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  // 1. ดักจับ Error จาก Multer (ขนาดไฟล์ / ชนิดไฟล์) ให้ตอบกลับ 400 ทันที
  (req, res, next) => {
    uploadImage(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res
              .status(400)
              .json({ message: "File size exceeds limit (Max 5MB)" });
          }
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  // 2. ส่ง req.file และ req.body ที่ผ่าน Multer แล้วไปให้ Zod Validate
  validate(uploadNoteImageSchema),
  handleUploadResponse,
);
export default router;
