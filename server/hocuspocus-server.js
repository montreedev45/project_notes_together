import dotenv from "dotenv"
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import Note from "./modules/note/note.model.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import { sendRelativeTime } from "./sockets/socket.manage.js";

import path from "path";
import { fileURLToPath } from "url";

// 1. สร้าง __dirname สำหรับ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. โหลด .env โดยระบุ Path ให้ชัดเจน (สมมติว่าไฟล์ .env อยู่ในโฟลเดอร์เดียวกับไฟล์นี้)
// หาก .env อยู่โฟลเดอร์ข้างนอก ให้ใช้ path.join(__dirname, "../.env")
dotenv.config({ path: path.join(__dirname, ".env") });


connectDB();

export const createHocuspocus = (io) => {
  return new Server({
    port: 1234,

    // Hook สำหรับตรวจสอบการเชื่อมต่อเบื้องต้น
    onConnect({ documentName }) {
      console.log(`📡 Client connecting to room: ${documentName}`);
    },

    extensions: [
      new Database({
        // 🟢 1. ดึงข้อมูล: ถ้าไม่มี ให้คืนค่า null ไปเลย เพื่อให้ Yjs เริ่มนับหนึ่งอย่างถูกต้อง
        fetch: async ({ documentName }) => {
          console.log(`📖 Fetching data for room: ${documentName}`);
          try {
            const roomObjectId = new mongoose.Types.ObjectId(documentName);
            const note = await Note.findOne({ room: roomObjectId });

            // ถ้ามีโน้ตเก่าและมี content ให้ส่ง Buffer ไป แต่ถ้าไม่มีให้ส่ง null ตรงๆ
            return note && note.content ? note.content : null;
          } catch (err) {
            console.error("❌ Fetch Error:", err);
            return null;
          }
        },

        // 🟢 2. บันทึกข้อมูล: เมื่อหน้าบ้านพิมพ์ หรือเชื่อมต่อเสร็จ มันจะส่งก้อนโครงสร้างสมบูรณ์มาเซฟที่นี่
        store: async ({ documentName, state }) => {
          console.log(`💾 Saving data for room: ${documentName}`);
          if (!state) return;

          try {
            const roomObjectId = new mongoose.Types.ObjectId(documentName);
            const currentUpdatedTime = new Date(); // 🚩 สร้างก้อนเวลาไว้รอเลย ชัวร์ที่สุด

            // ใช้ findOneAndUpdate ร่วมกับ upsert
            // ถ้ายังไม่มีห้องนี้ในเบส มันจะสร้างเอกสารใหม่พ่วงก้อน state ที่ถูกต้องไปเซฟทันที
            const saveNote = await Note.findOneAndUpdate(
              { room: roomObjectId },
              {
                content: state,
                updatedAt: new Date(),
              },
              { upsert: true, returnDocument: "after" },
            );

            sendRelativeTime(io, documentName, currentUpdatedTime);
          } catch (error) {
            console.error("❌ Error saving to MongoDB:", error);
          }
        },
      }),
    ],

    // (Option) ถ้าต้องการจัดการ Error ในระดับ Server
    onDisconnect({ documentName }) {
      console.log(`🔌 Client disconnected from: ${documentName}`);
    },
  });
};
