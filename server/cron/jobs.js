import cron from "node-cron";
import fs from "fs";
import path from "path";
import * as Y from "yjs";
import Room from "../modules/room/room.model.js";
import Note from "../modules/note/note.model.js";
import { extractImageUrls } from "../hocuspocus-server.js";
import logger from "../utils/logger.js";

export const startDailyJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("[Cron] เริ่มกระบวนการตรวจสอบและทำความสะอาดระบบ...");

    // ==========================================
    // งานที่ 1: ลบห้องที่หมดอายุ และลบ Note ที่เกี่ยวข้อง
    // ==========================================
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredRooms = await Room.find({
        isDeleted: true,
        deletedAt: { $lt: thirtyDaysAgo },
      });

      if (expiredRooms.length > 0) {
        for (const room of expiredRooms) {
          // ลบ Note ที่ผูกกับห้องนี้ทิ้งก่อน (ถ้า Note ถูกลบ รูปภาพใน Note จะกลายเป็นไฟล์ขยะทันที)
          await Note.findOneAndDelete({ room: room._id });

          // ลบห้อง
          await Room.findByIdAndDelete(room._id);
          logger.info(`ลบห้อง ${room._id} และข้อมูลที่เกี่ยวข้องสำเร็จ`);

          const roomFolderPath = path.join(
            process.cwd(),
            "public/uploads",
            room._id.toString(),
          );
          if (fs.existsSync(roomFolderPath)) {
            fs.rmSync(roomFolderPath, { recursive: true, force: true });
          }
        }
      } else {
        logger.info("ไม่มีห้องที่หมดอายุ");
      }
    } catch (error) {
      logger.error("[Cron] Error ระหว่างเคลียร์ห้องหมดอายุ:", error);
    }

    // ==========================================
    // งานที่ 2: กวาดล้างไฟล์รูปภาพขยะ (ต่อยอดจากงานที่ 1 ทันที)
    // ==========================================
    try {
      logger.info("เริ่มสแกนลบไฟล์รูปภาพขยะแบบแยกโฟลเดอร์ห้อง...");
      const uploadsDir = path.join(process.cwd(), "public/uploads");

      if (fs.existsSync(uploadsDir)) {
        // 1. อ่านรายการ "โฟลเดอร์ห้อง" ทั้งหมดใน uploads
        const roomFolders = fs.readdirSync(uploadsDir);
        let totalDeletedImages = 0;

        for (const folderName of roomFolders) {
          const roomFolderPath = path.join(uploadsDir, folderName);

          // เช็กให้ชัวร์ว่าเป็นโฟลเดอร์ (กันไฟล์แปลกปลอมหลุดมาอยู่ข้างนอก)
          if (!fs.statSync(roomFolderPath).isDirectory()) continue;

          // folderName คือ Room ID
          const note = await Note.findOne({ room: folderName }, "content");

          // กรณีที่ 1: ห้องถูกลบไปแล้ว แต่โฟลเดอร์รูปยังตกค้าง
          if (!note) {
            // ลบโฟลเดอร์นี้ทิ้งทั้งยวงได้เลย! (โคตรประหยัดเวลา)
            fs.rmSync(roomFolderPath, { recursive: true, force: true });
            logger.info(
              `ลบโฟลเดอร์ตกค้างของห้อง ${folderName} ทิ้งทั้งโฟลเดอร์`,
            );
            continue;
          }

          // กรณีที่ 2: ห้องยังมีชีวิตอยู่ สแกนหาไฟล์ขยะข้างใน
          if (note.content) {
            const ydoc = new Y.Doc();
            Y.applyUpdate(ydoc, new Buffer.from(note.content));
            const xmlString = ydoc.getXmlFragment("content").toString();

            // สกัดชื่อไฟล์เฉพาะของห้องนี้
            const activeImages = new Set();
            const imagesInDoc = extractImageUrls(xmlString);

            imagesInDoc.forEach((url) => {
              // 1. ดักจับและข้ามรูปภาพประเภท Base64
              if (url.startsWith("data:image")) return;

              // 2. ดำเนินการเฉพาะ URL ที่เป็นของระบบเราเท่านั้น (ต้องมีคำว่า /uploads/)
              if (!url.includes("/uploads/")) return;

              // 3. ลบ Query Parameters หรือ Hash Tags ทิ้งก่อน (ถ้ามี)
              const cleanUrl = url.split("?")[0].split("#")[0];

              // 4. สกัดชื่อไฟล์อย่างปลอดภัย
              const filename = cleanUrl.split("/").pop();
              if (filename) activeImages.add(filename);
            });

            // เทียบรูปในโฟลเดอร์ห้องนี้ กับ Set รูปที่ใช้จริง
            const filesInRoom = fs.readdirSync(roomFolderPath);
            for (const file of filesInRoom) {
              if (!activeImages.has(file)) {
                fs.unlinkSync(path.join(roomFolderPath, file));
                totalDeletedImages++;
              }
            }
          }
        }
        logger.info(
          `ลบไฟล์รูปภาพขยะย่อยๆ ไปทั้งหมด ${totalDeletedImages} ไฟล์`,
        );
      }
    } catch (error) {
      logger.error("[Cron] Error ระหว่างลบไฟล์รูปภาพ:", error);
    }
  });
};
