import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import noteRoutes from "./modules/note/note.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ type: "application/json" }));

app.get("/api/health", (req, res) => {
  console.log("/health is working");
  res.json({
    message: "server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notes", noteRoutes);

export default app;
