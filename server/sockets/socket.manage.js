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

    const broadcastRoomStatus = async (roomId) => {
      // 1. ดึง Sockets ทั้งหมดที่กำลังเชื่อมต่ออยู่ในห้องนี้
      const socketsInRoom = await io.in(roomId).fetchSockets();

      const uniqueUsers = [];
      const seenIds = new Set();

      // 2. วนลูปดึงข้อมูล user ที่เราฝากไว้กับ socket
      for (const s of socketsInRoom) {
        if (s.user && !seenIds.has(s.user._id)) {
          seenIds.add(s.user._id); // ดักจับไม่ให้คนเดียวกันโชว์ 2 รูป (กรณีเปิด 2 แท็บ)
          uniqueUsers.push(s.user);
        }
      }

      // 3. ยิงข้อมูลชุดใหม่กลับไป (มีทั้งยอดรวม และ ข้อมูลรายบุคคล)
      io.emit("room_status", {
        roomId,
        onlineCount: uniqueUsers.length,
        activeUsers: uniqueUsers, // 📦 [ { _id, username, avatar }, ... ]
      });
    };

    // 1. จังหวะกดเข้าหน้า Editor
    socket.on("join_room", async ({ roomId, user }) => {
      socket.join(roomId);

      // 🚩 ฝากข้อมูล user แปะติดไว้กับตัว socket นี้เลย
      socket.roomId = roomId;
      socket.user = user;

      await broadcastRoomStatus(roomId);
    });

    // 2. เพิ่ม Event: จังหวะผู้ใช้กดถอยออกจากหน้า Editor กลับมาหน้าแรก (ท่อเน็ตยังไม่ตัด)
    socket.on("leave_room", async ({ roomId }) => {
      if (roomId) {
        socket.leave(roomId);
        // พอเดินออกจากห้อง ก็สั่งอัปเดตรายชื่อใหม่
        await broadcastRoomStatus(roomId);
      }
    });

    socket.on("typing", () => {
      // ตรวจสอบก่อนว่าตัว socket นี้มีห้อง (roomId) และมีข้อมูลผู้ใช้ (user) สิงสถิตอยู่จริงไหม
      if (socket.roomId && socket.user) {
        console.log("typing backend woring")
        // 🚩 สั่ง socket.to().emit() เพื่อส่งสัญญาณหา "คนอื่นทุกคนในห้อง" ยกเว้นตัวคนพิมพ์เอง
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

    // 3. จังหวะปิดเบราว์เซอร์หนี หรือเน็ตหลุดจริงๆ (ท่อตัดขาด)
    socket.on("disconnect", async () => {
      if (socket.roomId) {
        // พอสายหลุด ก็สั่งอัปเดตรายชื่อคนที่เหลืออยู่ในห้อง
        await broadcastRoomStatus(socket.roomId);
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

export const sendRelativeTime = (ioInstance, roomId, time) => {
  if (ioInstance) {
    console.log("🎯 io found! Emitting send_relative_time now.");
    ioInstance.emit("send_relative_time", { roomId, time });
  } else {
    console.error("❌ ioInstance พารามิเตอร์ที่ส่งมามีค่าเป็น undefined!");
  }
};

export default setSocket;
