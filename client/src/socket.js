import { io } from "socket.io-client";

let socket;

// 1. ฟังก์ชันสั่งเชื่อมต่อครั้งแรก (รันที่ App.jsx)
export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL, {
      query: { userId } 
    });
    console.log("🔌 Socket initialized!");
  }
  return socket;
};

// 🚩 2. เพิ่มฟังก์ชันนี้: สำหรับให้หน้า Editor หรือหน้าอื่นๆ มาดึงท่อเดิมไปใช้งาน
export const getSocket = () => {
  return socket; // ส่งคืนอินสแตนซ์ปัจจุบันกลับไป (ถ้ายังไม่ได้เชื่อมต่อ จะได้ undefined/null)
};

// 3. ฟังก์ชันสั่งตัดสาย (ตอน Logout)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected and cleared.");
  }
};