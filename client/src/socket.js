import { io } from "socket.io-client";

let socket = null;

// 1. ฟังก์ชันสั่งเชื่อมต่อครั้งแรก
export const connectSocket = (userId) => {
  // หากมี socket อยู่แล้วแต่หลุดสายไป ให้สั่ง connect ใหม่ หรือคืนค่าเดิม
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"], // สำคัญที่สุด! บังคับใช้ WebSocket ข้าม Long-Polling ไปเลย
      withCredentials: true,
      query: { userId },
    });
    //console.log("🔌 Socket initialized!");
  }
  return socket;
};

// 2. ดึงท่อเดิมไปใช้งาน
export const getSocket = () => {
  return socket;
};

// 3. สั่งตัดสาย (ตอน Logout)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    //console.log("🔌 Socket disconnected and cleared.");
  }
};