import rateLimit from "express-rate-limit";

// 1. สำหรับ Login / Register / Reset Password / OAuth (เข้มงวดมาก)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10,
  message: { message: "Too many authentication attempts, please try again later." },
});

// 2. สำหรับ Action สำคัญ เช่น เปลี่ยนรหัสผ่าน / เปลี่ยนอีเมล / เช็กอีเมลซ้ำ
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 15,
  message: { message: "Too many requests for this action, please try again later." },
});

// 3. สำหรับ General API / Search Users (ยืดหยุ่น)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 นาที
  max: 60,
  message: { message: "Too many requests, please slow down." },
});