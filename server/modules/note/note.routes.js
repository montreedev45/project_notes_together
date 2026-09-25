import express from "express";
import dotenv from "dotenv";

dotenv.config();

import fs from "fs";
import path from "path";
import multer from "multer";
import Room from "../../modules/room/room.model.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import { uploadImage } from "../../middleware/upload.middleware.js";
import { handleUploadResponse } from "./note.controller.js";
import { validate } from "../../middleware/validateZod.js";
import { uploadNoteImageSchema } from "./upload.schema.js";
import { apiLimiter, writeLimiter } from "../../middleware/rateLimiter.js";
import cloudinary from "../../config/cloudinary.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  writeLimiter,
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

router.get(
  "/image/:roomId/:filename",
  authMiddleware,
  apiLimiter,
  async (req, res) => {
    try {
      const { roomId, filename } = req.params;

      // 1. ใช้ userId จาก authMiddleware ได้เลย ไม่ต้องถอดรหัส JWT ซ้ำ
      const userId = req.user._id; 

      // 2. ตรวจสอบสิทธิ์การเข้าห้อง
      const hasAccess = await Room.exists({
        _id: roomId,
        "members.user": userId,
      });

      if (!hasAccess) {
        return res.status(403).send("Forbidden: คุณไม่มีสิทธิ์ดูรูปภาพในห้องนี้");
      }

      const cloudinaryUrl = cloudinary.url(`notes_together/${roomId}/${filename}`, {
        type: "authenticated",
        secure: true,
        sign_url: true,
      });

      // 3. Redirect ไปยังรูปภาพจริง
      return res.redirect(302, cloudinaryUrl);

    } catch (error) {
      console.error("❌ Image Fetch Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

export default router;
