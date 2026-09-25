import winston from "winston";
import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
const isProduction = process.env.NODE_ENV === "production";

// 1. เตรียม Transports พื้นฐาน (Console)
const transportsList = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} ${level}: ${message} ${stack ? `\n${stack}` : ""}`;
      })
    ),
  }),
];

// 2. ถ้าไม่ใช่ Production (รันบนเครื่องตัวเอง) ให้เขียนไฟล์ลงโฟลเดอร์ logs
if (!isProduction) {
  transportsList.push(
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/application-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/error-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "30d",
    })
  );
}

// 3. ถ้ามีคีย์ Axiom ค่อยผูก Transport (ป้องกัน Error ถ้ารันเครื่อง Local แล้วไม่มี .env)
if (process.env.AXIOM_DATASET && process.env.AXIOM_TOKEN) {
  transportsList.push(
    new AxiomTransport({
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    })
  );
}

// 4. สร้าง Logger
const logger = winston.createLogger({
  level: "info",
  // Format หลักสำหรับไฟล์และ Axiom (ส่งเป็น JSON ดีที่สุด)
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: transportsList,
});

// 5. ผูกเข้ากับ Morgan
logger.stream = {
  write: (message) => {
    // ลบการขึ้นบรรทัดใหม่ที่ Morgan แถมมาให้
    logger.info(message.trim());
  },
};

export default logger;