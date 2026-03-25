import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //pull token
    const token = authHeader.split(" ")[1];
    
    //verify
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decode.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    //attact user data
    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
