import cron from "node-cron";
import { extractImageUrls } from "../hocuspocus-server.js";
import * as Y from "yjs";
import Room from "../modules/room/room.model.js";
import Note from "../modules/note/note.model.js";
import logger from "../utils/logger.js";
import cloudinary from "../config/cloudinary.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const startDailyJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    const startTime = Date.now();
    let adminApiCount = 0;
    let deletedRoomsCount = 0;
    let totalDeletedImages = 0;
    const MAX_API_PER_HOUR = 450;

    const trackAndThrottleApi = async () => {
      adminApiCount++;
      await delay(2000);
      if (adminApiCount >= MAX_API_PER_HOUR) {
        logger.warn(
          `[Cron:Limit] แตะขีดจำกัด Cloudinary API (${adminApiCount}/500) บังคับพัก 1 ชั่วโมง`,
        );
        await delay(60 * 60 * 1000);
        adminApiCount = 0;
        logger.info("[Cron:Resume] รีเซ็ตโควต้า API กลับมาทำงานต่อ");
      }
    };

    try {
      // ==========================================
      // งานที่ 1: ลบห้องที่หมดอายุ
      // ==========================================
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const expiredRooms = await Room.find({
        isDeleted: true,
        deletedAt: { $lt: thirtyDaysAgo },
      });

      if (expiredRooms.length > 0) {
        logger.info(
          `[Cron:Task1] พบห้องหมดอายุ ${expiredRooms.length} ห้อง เริ่มดำเนินการ...`,
        );
        for (const room of expiredRooms) {
          const roomId = room._id.toString();
          const folderPrefix = `notes_together/${roomId}`;
          try {
            await cloudinary.api.delete_resources_by_prefix(folderPrefix, {
              type: "authenticated"
            });
            await trackAndThrottleApi();
            await cloudinary.api.delete_folder(folderPrefix);
            await trackAndThrottleApi();

            await Note.findOneAndDelete({ room: roomId });
            await Room.findByIdAndDelete(roomId);
            deletedRoomsCount++;
          } catch (err) {
            logger.error(`[Cron:Task1] ลบห้อง ${roomId} ล้มเหลว:`, err.message);
          }
        }
      }

      // ==========================================
      // งานที่ 2: กวาดล้างไฟล์รูปภาพขยะ
      // ==========================================
      const activeRooms = await Room.find({ isDeleted: false });

      for (const room of activeRooms) {
        const roomId = room._id.toString();
        const folderPrefix = `notes_together/${roomId}/`;

        try {
          const { resources } = await cloudinary.api.resources({
            type: "upload",
            prefix: folderPrefix,
            max_results: 500,
          });
          await trackAndThrottleApi();

          if (resources.length === 0) continue;

          const note = await Note.findOne({ room: roomId }, "content");
          if (!note || !note.content) continue;

          const ydoc = new Y.Doc();
          Y.applyUpdate(ydoc, new Buffer.from(note.content));
          const xmlString = ydoc.getXmlFragment("content").toString();
          const imagesInDoc = extractImageUrls(xmlString);
          const activeFilenames = new Set();

          imagesInDoc.forEach((url) => {
            if (!url.includes("/api/notes/image/")) return;
            const filename = url.split("?")[0].split("#")[0].split("/").pop();
            if (filename) activeFilenames.add(filename);
          });

          const publicIdsToDelete = [];
          for (const res of resources) {
            const filename = res.public_id.split("/").pop();
            if (!activeFilenames.has(filename)) {
              publicIdsToDelete.push(res.public_id);
            }
          }

          if (publicIdsToDelete.length > 0) {
            await cloudinary.api.delete_resources(publicIdsToDelete);
            await trackAndThrottleApi();
            totalDeletedImages += publicIdsToDelete.length;
            logger.debug(
              `[Cron:Task2] ลบไฟล์ขยะ ${publicIdsToDelete.length} รูป ในห้อง ${roomId}`,
            );
          }
        } catch (err) {
          logger.error(
            `[Cron:Task2] สแกนไฟล์ขยะห้อง ${roomId} ล้มเหลว:`,
            err.message,
          );
        }
      }

      // ==========================================
      // งานที่ 3: Deep Clean (ล้างบางโฟลเดอร์ขยะอมตะจาก Hard Delete)
      // ==========================================
      try {
        logger.info(
          "[Cron:DeepClean] เริ่มตรวจสอบโฟลเดอร์ขยะตกค้างบน Cloudinary...",
        );

        // 1. ดึงรายชื่อโฟลเดอร์ทั้งหมดที่อยู่ภายใต้ "notes_together" บน Cloudinary
        const { folders } = await cloudinary.api.sub_folders("notes_together");
        await trackAndThrottleApi();

        let orphanFoldersDeleted = 0;

        for (const folder of folders) {
          const roomId = folder.name; // ชื่อโฟลเดอร์คือ Room ID

          // 2. ตรวจสอบว่า Room ID นี้ยังมีชีวิตอยู่ใน MongoDB หรือไม่ (รวมถึงที่ถูก Soft Delete ด้วย)
          const roomExists = await Room.exists({ _id: roomId });

          // 3. ถ้าไม่มีใน Database แล้ว แสดงว่าเป็น "ขยะอมตะ" (เกิดจาก Hard Delete)
          if (!roomExists) {
            logger.warn(
              `[Cron:DeepClean] พบโฟลเดอร์ไร้สังกัด ${roomId} กำลังดำเนินการลบทิ้ง...`,
            );

            const folderPath = folder.path; // เช่น notes_together/6a9d02f...

            // สั่งกวาดล้างไฟล์และโฟลเดอร์ทิ้งทันที
            await cloudinary.api.delete_resources_by_prefix(folderPath, {
              type: "authenticated"
            });
            await trackAndThrottleApi();

            await cloudinary.api.delete_folder(folderPath);
            await trackAndThrottleApi();

            orphanFoldersDeleted++;
          }
        }

        if (orphanFoldersDeleted > 0) {
          logger.info(
            `[Cron:DeepClean] ล้างโฟลเดอร์ขยะอมตะสำเร็จ ${orphanFoldersDeleted} ห้อง`,
          );
        }
      } catch (error) {
        logger.error("[Cron:DeepClean] ระบบตรวจสอบย้อนกลับล้มเหลว:", error);
      }


      // ==========================================
      // สรุปผล (พิมพ์เฉพาะเมื่อมีการทำงานเกิดขึ้น)
      // ==========================================
      if (deletedRoomsCount > 0 || totalDeletedImages > 0) {
        const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(
          `[Cron:Summary] เสร็จสิ้น! ลบห้อง: ${deletedRoomsCount} | ลบรูป: ${totalDeletedImages} (ใช้เวลา ${durationSec} วินาที)`,
        );
      }
    } catch (error) {
      logger.error("[Cron:Fatal] ระบบล้มเหลวแบบคริติคอล:", error);
    }
  }, {
    timezone: "Asia/Bangkok"
  });
};
