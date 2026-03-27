import dotenv from "dotenv"
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import Note from "./modules/note/note.model.js";
import connectDB from "./config/db.js";

import path from "path";
import { fileURLToPath } from "url";

// 1. สร้าง __dirname สำหรับ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. โหลด .env โดยระบุ Path ให้ชัดเจน (สมมติว่าไฟล์ .env อยู่ในโฟลเดอร์เดียวกับไฟล์นี้)
// หาก .env อยู่โฟลเดอร์ข้างนอก ให้ใช้ path.join(__dirname, "../.env")
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🔍 Check MONGO_URI:", process.env.MONGO_URI ? "Found" : "Not Found");

connectDB();


const server = new Server({
  port: 1234,

  // Hook สำหรับตรวจสอบการเชื่อมต่อเบื้องต้น
  onConnect({ documentName }) {
    console.log(`📡 Client connecting to room: ${documentName}`);
  },

  extensions: [
    new Database({
      // 1. ดึงข้อมูลจาก MongoDB เมื่อมีคนเปิดเอกสาร
      fetch: async ({ documentName }) => {
        console.log(`📖 Fetching data for room: ${documentName}`);
        
        const note = await Note.findOne({ room: documentName });
        
        // ถ้าเจอข้อมูล ให้ส่งคืน content (Buffer) กลับไปให้ Yjs merge
        // ถ้าไม่เจอ ให้คืนค่า null เพื่อเริ่ม doc ใหม่
        return note ? note.content : null;
      },

      // 2. บันทึกข้อมูลลง MongoDB เมื่อมีการเปลี่ยนแปลง
      // Hocuspocus จะจัดการ Debounce ให้เองโดยอัตโนมัติ (Default ประมาณ 2 วินาที)
      store: async ({ documentName, state }) => {
        console.log(`💾 Saving data for room: ${documentName}`);
        
        try {
          await Note.findOneAndUpdate(
            { room: documentName },
            { 
              content: state, // state คือ Y.Doc binary update
              updatedAt: new Date() 
            },
            { upsert: true } // ถ้ายังไม่มี Note ของ Room นี้ให้สร้างใหม่ทันที
          );
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

server.listen();
console.log("🚀 Hocuspocus with MongoDB persistence running on ws://localhost:1234");