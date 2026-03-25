let io;

const setSocket = (ioConfig) => {
  io = ioConfig;

  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send-changes", ({ roomId, content }) => {
      socket.to(roomId).emit("receive-changes", content);
    });

    const roomCursor = {};
    socket.on("cursor:update", ({ roomId, userId, from, to }) => {
      if (!roomCursor[roomId]) {
        return (roomCursor[roomId] = {});
      }

      roomCursor[roomId][userId] = {
        userId,
        from,
        to,
      };
      socket.to(roomId).emit("cursor:broadcast", roomCursor);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default setSocket;
