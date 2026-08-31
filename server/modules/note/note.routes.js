import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import Room from "../../modules/room/room.model.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import { uploadImage } from "../../middleware/upload.middleware.js";
import { handleUploadResponse } from "./note.controller.js";
import { validate } from "../../middleware/validateZod.js";
import { uploadNoteImageSchema } from "./upload.schema.js";
import { apiLimiter } from "../../middleware/rateLimiter.js";

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

router.get(
  "/image/:roomId/:filename",
  authMiddleware,
  apiLimiter,
  async (req, res) => {
    try {
      const { roomId, filename } = req.params;

      // 1. ใช้ userId จาก authMiddleware ได้เลย ไม่ต้องถอดรหัส JWT ซ้ำ
      // (หมายเหตุ: เช็กด้วยว่า authMiddleware ของคุณแนบค่าเป็น req.user หรือ req.userId)
      const userId = req.user.id; 

      // 2. ตรวจสอบสิทธิ์การเข้าห้อง
      const hasAccess = await Room.exists({
        _id: roomId,
        "members.user": userId,
      });

      if (!hasAccess) {
        return res.status(403).send("Forbidden: คุณไม่มีสิทธิ์ดูรูปภาพในห้องนี้");
      }

      // 3. กำหนด Path และป้องกัน Path Traversal
      const filePath = path.join(process.cwd(), "public/uploads", roomId, filename);

      if (!filePath.startsWith(path.join(process.cwd(), "public/uploads"))) {
        return res.status(400).send("Invalid file path");
      }
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      // 4. ส่งไฟล์แบบ Asynchronous (ไม่บล็อก Event Loop)
      res.sendFile(filePath, (err) => {
        if (err) {
          // หากเกิด Error เช่น หาไฟล์ไม่เจอ (ENOENT) Express จะจัดการให้
          if (err.code === "ENOENT") {
            res.status(404).send("File not found");
          } else if (!res.headersSent) {
            res.status(500).send("Error sending file");
          }
        }
      });

    } catch (error) {
      console.error("❌ Image Fetch Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

export default router;
