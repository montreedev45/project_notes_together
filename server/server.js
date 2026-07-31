import dotenv from "dotenv";
// ต้องเรียก dotenv.config() ก่อน Import app.js เสมอ
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import setSocket from "./sockets/socket.manage.js";
import { createHocuspocus } from "./hocuspocus-server.js";

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

const hocuspocusServer = createHocuspocus(io);
hocuspocusServer.listen();

const PORT = process.env.SERVER_PORT || 5000;

// รอให้ DB เชื่อมต่อสำเร็จก่อนเปิดรับ Request
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB, server not started:", error);
    process.exit(1);
  }
};

startServer();