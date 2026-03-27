let io;

const setSocket = (ioConfig) => {
  io = ioConfig;

  io.on("connection", (socket) => {
    console.log("user connected", socket.id);



    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default setSocket;
