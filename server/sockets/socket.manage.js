let io;

const setSocket = (ioConfig) => {
  io = ioConfig;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) {
      console.log("Rejected: No userId provided");
      return socket.disconnect();
    }

    //เมื่อ User เชื่อมต่อ ให้เขาร่วม Room ที่ใช้ชื่อเป็น UserID ของเขาเอง
    socket.on("setup", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} connected socket`);
    });

    // 🟢 ในไฟล์ socket server หลังบ้านของคุณ

    // 1. จังหวะกดเข้าหน้า Editor
    socket.on("join_room", ({ roomId, userId }) => {
      socket.join(roomId);
      socket.userId = userId;
      socket.roomId = roomId;

      const onlineCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.emit("room_status", { roomId, onlineCount });
    });

    // 🚩 2. เพิ่ม Event: จังหวะผู้ใช้กดถอยออกจากหน้า Editor กลับมาหน้าแรก (ท่อเน็ตยังไม่ตัด)
    socket.on("leave_room", ({ roomId }) => {
      if (roomId) {
        socket.leave(roomId); // สั่งให้ออกจากห้อง Socket

        const onlineCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        console.log(
          `🏃‍♂️ User left room ${roomId} via navigation. Remaining: ${onlineCount}`,
        );

        io.emit("room_status", { roomId, onlineCount }); // กระจายบอกทุกคนให้อัปเดต Room Card
      }
    });

    // 3. จังหวะปิดเบราว์เซอร์หนี หรือเน็ตหลุดจริงๆ (ท่อตัดขาด)
    socket.on("disconnect", () => {
      const { roomId } = socket;
      if (roomId) {
        const onlineCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.emit("room_status", { roomId, onlineCount });
      }
    });
  });
};

// 🚩 สร้างฟังก์ชันช่วยส่งค่า io ตัวปัจจุบันออกไป
export const getIoInstance = () => {
  return io;
};

export const sendNotification = (recipientId, data, newMember) => {
  console.log("sendNotification is working");
  if (io) {
    // ส่งไปที่ Room ที่ชื่อเดียวกับ ID ของเจ้าของห้อง
    io.to(recipientId).emit("new_notification", data);
  }
};

// 🟢 ในไฟล์ socket_manage.js
export const sendRelativeTime = (ioInstance, roomId, time) => {
  // 🚩 เช็คเงื่อนไขจาก ioInstance ที่ส่งมาจาก hocuspocus ตรงๆ
  if (ioInstance) {
    console.log("🎯 io found! Emitting send_relative_time now.");
    ioInstance.emit("send_relative_time", { roomId, time });
  } else {
    console.error("❌ ioInstance พารามิเตอร์ที่ส่งมามีค่าเป็น undefined!");
  }
};

export default setSocket;
