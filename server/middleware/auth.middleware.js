import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    // const token = req.cookies.token;

    // if (!token) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "Unauthorized: No token provided" });
    // }

    // 1. ดึงข้อมูลจาก Header ที่ชื่อว่า Authorization
    const authHeader = req.headers.authorization;
    
    // 2. ตรวจสอบว่ามี Header และขึ้นต้นด้วยคำว่า Bearer หรือไม่
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    // 3. หั่นเอาเฉพาะตัว Token (แยกคำว่า Bearer ออก)
    const token = authHeader.split(" ")[1];

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // ดึงข้อมูลสดจาก DB (ตัด password ออก)
    const user = await User.findById(decode._id).select(
      "-password",
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // แนบ Object user ทั้งหมด (ซึ่งจะมี googleId ติดไปด้วยถ้ามีใน DB)
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;