import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import setSocket from "./sockets/socket.manage.js";
import { createHocuspocus } from "./hocuspocus-server.js";
import { startDailyJobs } from "./cron/jobs.js";
import logger from "./utils/logger.js";
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ noServer: true });

// 1. สร้าง HTTP Server แกนกลาง
const server = http.createServer(app);

// 2. ผูก Socket.io เข้ากับแกนกลาง (Socket.io จะจอง Path: /socket.io/ โดยอัตโนมัติ)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

setSocket(io);

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startDailyJobs();

    // 3. สร้าง Hocuspocus Instance (ห้ามใช้ .listen() เด็ดขาด เพราะจะเป็นการเปิดพอร์ตใหม่แยกต่างหาก)
    const hocuspocusServer = createHocuspocus(io);

    // 4. สกัดกั้นและแยกเส้นทาง WebSocket (Multiplexing)
    server.on("upgrade", (request, socket, head) => {
      // โยน Traffic ให้ Hocuspocus จัดการ "เฉพาะ" เมื่อไม่ใช่ Path ของ Socket.io
      if (!request.url.startsWith("/socket.io/")) {
        // 3. ให้ 'ws' ทำการ Upgrade โปรโตคอลจาก HTTP เป็น WebSocket ให้เสร็จก่อน
        wss.handleUpgrade(request, socket, head, (ws) => {
          // จากนั้นค่อยโยน WebSocket (ws) ที่สมบูรณ์แล้ว ให้ Hocuspocus ทำงานต่อ
          hocuspocusServer.handleConnection(ws, request);
        });
      }
    });

    // 5. เปิดรับ Request ทั้งหมดบนพอร์ตเดียว (HTTP, Socket.io, Hocuspocus)
    server.listen(PORT, () => {
      console.log(`Server & WebSockets are running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB, server not started:", error);
    process.exit(1);
  }
};

startServer();