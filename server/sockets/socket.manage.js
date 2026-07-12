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

    socket.on("join_room", async ({ roomId, user }) => {
      socket.join(roomId);

      // ฝากข้อมูล user แปะติดไว้กับตัว socket นี้เลย
      socket.roomId = roomId;
      socket.user = user;
    });

    socket.on("leave_room", async ({ roomId }) => {
      if (roomId) {
        socket.leave(roomId);
      }
    });

    socket.on("typing", () => {
      // ตรวจสอบก่อนว่าตัว socket นี้มีห้อง (roomId) และมีข้อมูลผู้ใช้ (user) สิงสถิตอยู่จริงไหม
      if (socket.roomId && socket.user) {
        socket.to(socket.roomId).emit("user_typing", {
          userId: socket.user._id,
          username: socket.user.username,
        });
      }
    });

    // ดักฟังเมื่อหยุดพิมพ์
    socket.on("stop_typing", () => {
      if (socket.roomId && socket.user) {
        // 🚩 ส่งสัญญาณบอกคนอื่นให้เอาชื่อคนนี้ออกจากแท็บ "กำลังพิมพ์..."
        socket.to(socket.roomId).emit("user_stop_typing", {
          userId: socket.user._id,
        });
      }
    });

  });
};

// สร้างฟังก์ชันช่วยส่งค่า io ตัวปัจจุบันออกไป
export const getIoInstance = () => {
  return io;
};

export const sendNotification = (recipientId, data, newMember) => {
  if (io) {
    io.to(recipientId).emit("new_notification", data);
  }
};

export const sendComment = (roomId, newComment) => {
  if (io) {
    io.to(roomId).emit("received_comment", { newComment });
  }
};

export const roleUpdated = (roomId, targetUserId, newRole) => {
  if (io) {
    io.to(roomId).emit("role_updated", {
      targetUserId: targetUserId,
      newRole: newRole,
    });
  }
};

export const sendRelativeTime = (ioInstance, roomId, time) => {
  if (ioInstance) {
    console.log("🎯 io found! Emitting send_relative_time now.");
    ioInstance.emit("send_relative_time", { roomId, time });
  } else {
    console.error("❌ ioInstance พารามิเตอร์ที่ส่งมามีค่าเป็น undefined!");
  }
};

export default setSocket;
