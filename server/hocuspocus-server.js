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

            const newXmlString = document.getXmlFragment("content").toString();

            if (oldNote && oldNote.content) {
              const oldDoc = new Y.Doc();
              Y.applyUpdate(oldDoc, new Uint8Array(oldNote.content));

              const oldXmlString = oldDoc.getXmlFragment("content").toString();
              const oldImages = extractImageUrls(oldXmlString);
              const newImages = extractImageUrls(newXmlString);

              const deletedImages = oldImages.filter(
                (url) => !newImages.includes(url),
              );

              deletedImages.forEach((url) => {
                if (url.includes("/uploads/")) {
                  const filename = url.split("/uploads/")[1];
                  if (filename) {
                    // 🟢 ปรับพิกัดมาอิงที่ Root ด้วย process.cwd() ป้องกันบั๊กหาโฟลเดอร์รูปไม่เจอ
                    const filePath = path.join(
                      process.cwd(),
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

            await Note.findOneAndUpdate(
              { room: roomObjectId },
              { content: state, updatedAt: currentUpdatedTime },
              { upsert: true, returnDocument: "after" },
            );

            const eventName = `syncStatus:${documentName}`;
            io.emit(eventName, { status: "saved" });

            sendRelativeTime(io, documentName, currentUpdatedTime);
          } catch (error) {
            console.error("❌ Error saving to MongoDB:", error);
          }
        },
      }),
    ],

    async onAwarenessUpdate({ documentName, awareness }) {
      const roomId = documentName;
      const states = awareness.getStates();

      const rawUsers = Array.from(states.values())
        .filter((state) => state.user)
        .map((state) => state.user);

      const uniqueUsers = rawUsers.filter(
        (u, index, self) =>
          index === self.findIndex((target) => target.username === u.username),
      );

      io.emit(`room-online-status:${roomId}`, {
        roomId,
        count: uniqueUsers.length,
        activeUsers: uniqueUsers,
      });
    },

    onDisconnect({ documentName }) {
      console.log(`🔌 Client disconnected from: ${documentName}`);
    },
  });
};
