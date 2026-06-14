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

    onConnect({ documentName }) {
      console.log(`📡 Client connecting to room: ${documentName}`);
    },

    extensions: [
      new Database({
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

        store: async ({ documentName, state }) => {
          console.log(`💾 Saving data for room: ${documentName}`);
          if (!state) return;

          try {
            const roomObjectId = new mongoose.Types.ObjectId(documentName);
            const currentUpdatedTime = new Date();

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

    onDisconnect({ documentName }) {
      console.log(`🔌 Client disconnected from: ${documentName}`);
    },
  });
};
