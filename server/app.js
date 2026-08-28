import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";

// Routes Imports
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import noteRoutes from "./modules/note/note.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import planRoutes from "./modules/plan/plan.routes.js";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocs } from "./swagger.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. Core & Security Middlewares
// ==========================================
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // อนุญาตให้เข้าถึงภาพได้
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // เพิ่ม "blob:" เข้าไปใน img-src
        "img-src": ["'self'", "data:", "blob:"], 
      },
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Custom Safe Mongo Sanitize (ย้ายมาวางหลัง express.json เพื่อกรอง Payload ที่แปลงเป็น Object แล้ว)
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  }
  if (req.params && Object.keys(req.params).length > 0) {
    mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  }
  next();
});

// ==========================================
// 2. Static Files Services
// ==========================================
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public/uploads"), {
    setHeaders: (res, path, stat) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// ==========================================
// 3. API Routes Configuration
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/plans", planRoutes);

if (process.env.NODE_ENV !== 'production') {
  const openApiDocument = generateOpenApiDocs();
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
// ==========================================
// 4. Error Handling & 404 Handlers
// ==========================================
// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler (ดักจับ Error ที่หลุดมาจาก Controller)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;