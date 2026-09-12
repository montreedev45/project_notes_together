import cloudinaryPkg from "cloudinary";
import dotenv from "dotenv";

// 1. โหลดค่าตัวแปรจากไฟล์ .env เข้าสู่ระบบก่อน
dotenv.config();

// 2. ดึงโมดูล v2 ออกมาใส่ในตัวแปร cloudinary อย่างปลอดภัย
const cloudinary = cloudinaryPkg.v2;

// 3. เริ่มต้นตั้งค่าการเชื่อมต่อ
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 4. ส่งออกตัวแปรที่ตั้งค่าเสร็จแล้วไปให้ไฟล์อื่นใช้งาน
export default cloudinary;