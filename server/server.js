import dotenv from "dotenv";
import http from "http"
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import setSocket from "./sockets/socket.manage.js";

const server = http.createServer(app);
dotenv.config();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

setSocket(io);

const PORT = process.env.SERVER_PORT || 5000;
connectDB();

server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
