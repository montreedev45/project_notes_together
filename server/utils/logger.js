import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

// ตั้งค่าการหมุนเวียนไฟล์ (แยกไฟล์ตามวัน ลบไฟล์เก่าเกิน 14 วันทิ้งอัตโนมัติ)
const transportDaily = new winston.transports.DailyRotateFile({
  filename: `${logDir}/application-%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d", // เก็บย้อนหลังแค่ 14 วัน
});

const transportError = new winston.transports.DailyRotateFile({
  filename: `${logDir}/error-%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  level: "error", // บันทึกเฉพาะ Error เท่านั้น
  maxFiles: "30d",
});

// สร้างตัว Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    transportDaily,
    transportError,
    // ให้พ่นออก Terminal ด้วยเวลาเรารันตอน Dev
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),
  ],
});

logger.stream = {
  write: (message) => {
    // Morgan มักจะแถมการขึ้นบรรทัดใหม่ (\n) มาด้วย เราจึงต้อง .trim() ออกก่อนบันทึก
    logger.info(message.trim());
  },
};

export default logger;