import dotenv from "dotenv";
// ต้องเรียก dotenv.config() ก่อน Import app.js เสมอ
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import setSocket from "./sockets/socket.manage.js";
import { createHocuspocus } from "./hocuspocus-server.js";
import { startDailyJobs } from "./cron/jobs.js";
import logger from "./utils/logger.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

setSocket(io);

const PORT = process.env.SERVER_PORT || 5000;

// รอให้ DB เชื่อมต่อสำเร็จก่อนเปิดรับ Request ทุกช่องทาง
const startServer = async () => {
  try {
    // 1. รอให้ ฐานข้อมูลเชื่อมต่อสำเร็จ 100% ก่อน
    await connectDB();
    
    startDailyJobs();
    
    // 2. ปลุก Hocuspocus ให้พร้อมรับ WebSocket (ปลอดภัยแล้วเพราะ DB พร้อม)
    const hocuspocusServer = createHocuspocus(io);
    hocuspocusServer.listen();

    // 3. เปิดรับ HTTP Request ฝั่ง Express เป็นลำดับสุดท้าย
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error("Failed to connect to DB, server not started:", error);
    process.exit(1);
  }
};

startServer();