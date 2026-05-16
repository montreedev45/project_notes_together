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

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export const sendNotification = (recipientId, data, newMember ) => {
  console.log("sendNotification is working");
  if (io) {
    // ส่งไปที่ Room ที่ชื่อเดียวกับ ID ของเจ้าของห้อง
    io.to(recipientId).emit("new_notification", data);
    io.to(data.roomId.toString()).emit("new_member", {
      roomId: data.roomId,
      ...newMember, // กระจาย newMemberData ออกมา
    });
  }
};

export default setSocket;
