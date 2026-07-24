import User from "./auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Room from "../room/room.model.js";
import mongoose from "mongoose";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      plan: user.plan
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.isDeleted) {
        return res.status(400).json({
          message: "This account has been deactivated. Please contact support.",
        });
      }
      return res.status(400).json({ message: "Email already used" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    const token = generateToken(user);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        message: "This account has been deactivated. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, avatar } = req.body;

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      {
        username: username,
        avatar: avatar,
      },
      { returnDocument: "after" },
    );

    const newToken = generateToken(updatedProfile);

    res.status(200).json({
      user: {
        _id: updatedProfile.id,
        username: updatedProfile.username,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar,
        plan: updatedProfile.plan,
      },
      newToken,
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server  error" });
  }
};

export const checkDuplicateEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail, currentPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const checkEmail = await User.findOne({ email: newEmail });
    if (checkEmail) {
      if (checkEmail.isDeleted) {
        return res.status(400).json({
          message: "This account has been deactivated. Please contact support.",
        });
      }
      return res.status(400).json({ message: "Email already in use" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.changeEmailCode = verificationCode;
    user.changeEmailExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const temporalyToken = jwt.sign(
      {
        id: user._id,
        newEmail: newEmail,
        type: "CHANGE_EMAIL_VERIFY",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({
      message: "Verification code sent",
      temporalyToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeEmail = async (req, res) => {
  try {
    const { temporalyToken, verifyCode } = req.body;

    const decode = jwt.verify(temporalyToken, process.env.JWT_SECRET);
    if (!decode || decode.type !== "CHANGE_EMAIL_VERIFY")
      return res
        .status(401)
        .json({ message: "Invalid or expired token session" });

    const user = await User.findById(decode.id);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.changeEmailCode !== verifyCode)
      return res.status(400).json({ message: "Invalid verification code" });

    if (Date.now() > user.changeEmailExpire)
      return res.status(400).json({ message: "Verify code has expired" });

    user.email = decode.newEmail;
    user.changeEmailCode = undefined;
    user.changeEmailExpire = undefined;

    await user.save();

    const newToken = generateToken(user);
    res.status(200).json({
      message: "Change email successfully",
      user: user,
      token: newToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const userId = req.user._id;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(200).json([]);
    }

    let query = { _id: { $ne: userId }, isDeleted: false};
    query.username = { $regex: searchTerm, $options: "i" };

    const users = await User.find(query).select("username email avatar");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Fetch user error:", error);
    return res.status(500).json({ message: "Fetch user failed" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    // 1. Soft Delete ตัว User ก่อน
    await User.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${req.user.email}`,
      },
      { returnDocument: "after" },
    );

    // 2. ดึงห้องทั้งหมดที่ User คนนี้เป็น "เจ้าของ (Owner)"
    const ownedRooms = await Room.find({ owner: userId, isDeleted: false });

    for (const room of ownedRooms) {
      // 1. กรองหาคนที่ไม่ใช่ Owner เดิม (คนที่กำลังกดลบบัญชี)
      const remainingMembers = room.members.filter(
        (m) => (m.user._id || m.user).toString() !== userId.toString(),
      );

      if (remainingMembers.length > 0) {
        const targetMember = remainingMembers[0];
        const newOwnerId = new mongoose.Types.ObjectId(
          (targetMember.user._id || targetMember.user).toString(),
        );

        // 🎯 Step A: โอน Owner และเปลี่ยน Role ของ Owner ใหม่เป็น editor
        await Room.updateOne(
          { _id: room._id },
          {
            $set: {
              owner: newOwnerId,
              "members.$[elem].role": "owner", // หรือ role อื่นตามต้องการ
            },
          },
          {
            arrayFilters: [{ "elem.user": newOwnerId }],
          },
        );

        // 🎯 Step B: ถอด Owner เก่า (คนที่ลบบัญชี) ออกจาก array members
        await Room.updateOne(
          { _id: room._id },
          {
            $pull: {
              members: { user: userId },
            },
          },
        );

        console.log(`Transferred room ${room._id} to new owner successfully`);
      } else {
        // ถ้าไม่มีสมาชิกคนอื่นเหลือเลย -> Soft Delete
        await Room.updateOne(
          { _id: room._id },
          { $set: { isDeleted: true, deletedAt: new Date() } },
        );
      }
    }

    // 3. ถอด userId นี้ออกจากทุกห้องที่เขาไปเป็น "สมาชิก" (Member)
    await Room.updateMany(
      { "members.user": userId },
      {
        $pull: {
          members: {
            user: userId,
            role: { $ne: "owner" }, // $ne = Not Equal (ลบเฉพาะตัวที่ role != "owner")
          },
        },
      },
    );

    return res.status(200).json({ message: "Delete account successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
