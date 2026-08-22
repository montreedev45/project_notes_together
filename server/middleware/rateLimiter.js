import rateLimit from "express-rate-limit";

// 1. สำหรับ Login / Register / Reset Password / OAuth (เข้มงวดมาก)
// 10 req / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10,
  message: {
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. สำหรับ Action สำคัญ เช่น เปลี่ยนรหัสผ่าน / เปลี่ยนอีเมล / เช็กอีเมลซ้ำ
// 15 req / 15 min
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 15,
  message: {
    message: "Too many requests for this action, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. สำหรับ General API / Search Users (ยืดหยุ่น)
// 60 req / 1 min
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 นาที
  max: 60,
  message: { message: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. สำหรับการเขียนข้อมูล/Spam Risk (เช่น โพสต์คอมเมนต์)
// 15 req / 1 min
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 นาที
  max: 15, // อนุญาตให้โพสต์ได้สูงสุด 15 คอมเมนต์ต่อนาที
  message: { message: "Too many comments created. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
