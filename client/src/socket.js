import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL, {
      // เพิ่มการส่ง userId หรือ token ไปตอนเชื่อมต่อได้ถ้าต้องการ
      query: { userId } 
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;