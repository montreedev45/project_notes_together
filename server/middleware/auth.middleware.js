import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // ดึงข้อมูลสดจาก DB (ตัด password ออก)
    const user = await User.findById(decode.id || decode._id).select(
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