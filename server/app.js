import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import noteRoutes from "./modules/note/note.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js"
import planRoutes from "./modules/plan/plan.routes.js"
import path from 'path';
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ type: "application/json" }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/plans", planRoutes);

export default app;
