import dotenv from "dotenv";
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import jwt from "jsonwebtoken";
import Note from "./modules/note/note.model.js";
import mongoose from "mongoose";
import { sendRelativeTime } from "./sockets/socket.manage.js";

import * as Y from "yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Room from "./modules/room/room.model.js";

// 1. สร้าง __dirname สำหรับ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔍 ฟังก์ชันช่วยแกะลิงก์รูปภาพทั้งหมดจาก HTML String
export const extractImageUrls = (xmlString) => {
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
dotenv.config({ path: path.join(__dirname, ".env") });

const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(";").reduce((res, c) => {
    const [key, val] = c.trim().split("=").map(decodeURIComponent);
    try {
      return Object.assign(res, { [key]: JSON.parse(val) });
    } catch (e) {
      return Object.assign(res, { [key]: val });
    }
  }, {});
};

export const createHocuspocus = (io) => {
  return new Server({
    port: 1234,

    async onAuthenticate(data) {
      // เอา connection ออกจากบรรทัดนี้ เพราะมันไม่มีอยู่จริง
      const { request, documentName } = data;
      const cookieHeader = request.headers.cookie;

      if (!cookieHeader) throw new Error("Unauthorized: ไม่พบคุกกี้");
      const parsedCookies = parseCookies(cookieHeader);
      const token = parsedCookies.token;
      if (!token) throw new Error("Unauthorized: ไม่พบ JWT Token");

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const roomId = documentName;

        const room = await Room.findOne(
          { _id: roomId, "members.user": userId },
          { "members.$": 1 },
        );
        if (!room) throw new Error("Forbidden");
        const userRole = room.members[0].role;

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeLeftInSeconds = decoded.exp - currentTimestamp;

        if (timeLeftInSeconds <= 0) {
          throw new Error("Unauthorized: Token หมดอายุแล้ว");
        }

        console.log(
          `User ${decoded.username} ยืนยันตัวตนผ่าน เข้าห้อง: ${documentName}`,
        );

        // ส่งผ่านกล่อง context ไปให้ Hook ถัดไปจัดการแทน
        return {
          user: decoded,
          role: userRole,
          timeLeftInMs: timeLeftInSeconds * 1000,
        };
      } catch (error) {
        console.error("❌ Auth Error Details:", error.message);
        throw new Error(`Unauthorized: ${error.message}`);
      }
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

            const compactedState = Buffer.from(Y.encodeStateAsUpdate(document));

            await Note.findOneAndUpdate(
              { room: roomObjectId },
              { content: compactedState, updatedAt: currentUpdatedTime },
              { upsert: true },
            );

            // ยิง Socket แจ้งเตือนผู้ใช้
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

    // ใช้ Hook "connected" (ทำงานเมื่อผู้ใช้เชื่อมต่อและยืนยันตัวตนเสร็จสมบูรณ์ 100%)
    async connected({ documentName, context, connection }) {
      const username = context?.user?.username || "Unknown User";

      const isEditable =
        context?.role === "owner" || context?.role === "editor";
      if (!isEditable) {
        connection.readOnly = true;
        console.log(
          `ล็อกสิทธิ์ Read-only สำหรับ ${username} (ห้อง ${documentName})`,
        );
      }

      if (context?.timeLeftInMs && connection) {
        // เคลียร์ Timer เก่า (ถ้ามี)
        if (context.expirationTimer) {
          clearTimeout(context.expirationTimer);
        }

        // ฝาก Timer ไว้ในกระเป๋า context แทน connection
        context.expirationTimer = setTimeout(() => {
          console.log(
            `Token ของ ${username} (ห้อง ${documentName}) หมดอายุแล้ว บังคับเตะออก...`,
          );
          connection.close();
        }, context.timeLeftInMs);
      }
    },

    async onConnect({ documentName }) {
      // 3. onConnect ให้ทำหน้าที่แค่รับการเชื่อมต่อเบื้องต้น (ยังไม่รู้ว่าใครเป็นใคร)
      console.log(
        `มีการเชื่อมต่อใหม่เข้ามาที่ห้อง: ${documentName} (กำลังรอยืนยันตัวตน...)`,
      );
    },

    async onDisconnect({ documentName, context }) {
      // ไม่ต้องรับ connection เข้ามาแล้ว
      const username = context?.user?.username || "Unknown User";

      // ดึง Timer ออกมาจากกระเป๋า context เพื่อเคลียร์ทิ้ง
      if (context?.expirationTimer) {
        clearTimeout(context.expirationTimer);
      }

      console.log(`User ${username} ออกจากห้อง ${documentName} แล้ว`);
    },
  });
};
