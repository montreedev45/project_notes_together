import dotenv from "dotenv";
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import Note from "./modules/note/note.model.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import { sendRelativeTime } from "./sockets/socket.manage.js";

import * as Y from "yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 1. สร้าง __dirname สำหรับ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔍 ฟังก์ชันช่วยแกะลิงก์รูปภาพทั้งหมดจาก HTML String
const extractImageUrls = (xmlString) => {
  if (!xmlString) return [];
  // รองรับทั้ง img และ image เผื่อไว้
  const imgRegex = /<(?:img|image)[^>]+src="([^">]+)"/g;
  const urls = [];
  let match;

  while ((match = imgRegex.exec(xmlString)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

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

        store: async ({ documentName, state, document }) => {
          console.log(`💾 Saving data for room: ${documentName}`);
          if (!state) return;

          try {
            const roomObjectId = new mongoose.Types.ObjectId(documentName);
            const currentUpdatedTime = new Date();

            const oldNote = await Note.findOne({ room: roomObjectId });

            // 1: ใช้กุญแจชื่อ "content" ไขเอาก้อน XML ออกมา
            const newXmlString = document.getXmlFragment("content").toString();

            if (oldNote && oldNote.content) {
              const oldDoc = new Y.Doc();
              Y.applyUpdate(oldDoc, new Uint8Array(oldNote.content));

              // 2: ใช้กุญแจชื่อ "content" ไขก้อนเก่าออกมาด้วย
              const oldXmlString = oldDoc.getXmlFragment("content").toString();

              // เทียบรูป
              const oldImages = extractImageUrls(oldXmlString);
              const newImages = extractImageUrls(newXmlString);

              const deletedImages = oldImages.filter(
                (url) => !newImages.includes(url),
              );

              // 4. สั่งสอยไฟล์ขยะเหล่านั้นออกจากโฟลเดอร์ดิสก์บนเซิร์ฟเวอร์จริง
              deletedImages.forEach((url) => {
                // กรองความชัวร์ เผื่อมีลิงก์เว็บอื่นปนมา จะได้ลบเฉพาะรูประบบเรา
                if (url.includes("/uploads/")) {
                  const filename = url.split("/uploads/")[1];
                  if (filename) {
                    const filePath = path.join(
                      __dirname,
                      "public/uploads",
                      filename,
                    );
                    if (fs.existsSync(filePath)) {
                      fs.unlink(filePath, (err) => {
                        if (err)
                          console.error(`❌ ลบไม่ได้ (${filename}):`, err);
                        else
                          console.log(
                            `🗑️ ลบไฟล์ออกจากโฟลเดอร์สำเร็จ: ${filename}`,
                          );
                      });
                    }
                  }
                }
              });
            }

            // 💾 บันทึกก้อน state (Buffer) ลงฐานข้อมูล
            await Note.findOneAndUpdate(
              { room: roomObjectId },
              {
                content: state,
                updatedAt: currentUpdatedTime,
              },
              { upsert: true, returnDocument: "after" },
            );

            if (!document.hasUnappliedUpdates) {
              io.to(documentName).emit("syncStatus", { status: "saved" });
            }

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
