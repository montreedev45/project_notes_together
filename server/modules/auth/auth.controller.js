import User from "./auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Room from "../room/room.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      // 💡 ถ้าเป็นสมัครธรรมดา user.googleId จะไม่มี ค่าใน JWT จะกลายเป็น null
      googleId: user.googleId || null, 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
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
    const { username, avatar, email, currentPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;

    // กรณีมีการขอเปลี่ยน Email
    if (email && email !== user.email) {
      
      // 1. ถ้าสมัครผ่าน Google Auth -> ปฏิเสธการเปลี่ยน Email ทันที
      if (user.googleId) {
        return res.status(400).json({
          message: "Accounts logged in via Google cannot change their email address.",
        });
      }

      // 2. ถ้าสมัครแบบปกติ (Password Auth) -> บังคับเช็ก Password เดิม
      if (!currentPassword) {
        return res.status(400).json({
          message: "Please enter your current password to confirm email change.",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password." });
      }

      // 3. ตรวจสอบว่า Email ใหม่ซ้ำกับคนอื่นไหม
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "This email is already in use." });
      }

      updateData.email = email;
    }

    // อัปเดตข้อมูล
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: "after" }
    );

    const newToken = generateToken(updatedUser);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        plan: updatedUser.plan,
        googleId: updatedUser.googleId ? "google" : "local",
      },
      token : newToken
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

export const forgotPassword = async (req, res) => {
  try {
    const { currentEmail } = req.body;

    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return res.status(200).json({
        message: "please check your email for the verification code.",
      });
    }

    if (user.googleId) {
      return res.status(400).json({
        message: "This account was created with Google Sign-In and does not have a password. Please sign in using Google or reset your password on Google.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashPasswordToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}/${currentEmail}`;

    const transporter = getTransporter();

    transporter
      .sendMail({
        from: `"Notes Together" <${process.env.EMAIL_USER}>`,
        to: currentEmail,
        subject: "Reset Password - Notes Together",
        html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Request to reset password</h2>
          <p>You have requested to reset your password. Please click the button below:</p>
          <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Set a new password
          </a>
          <p style="margin-top: 15px; font-size: 12px; color: #666;">This link will expire in 10 minutes.</p>
        </div>
      `,
      })
      .catch((mailError) => {
        console.error("Background Email Error:", mailError);
      });

    res.json({
      success: true,
      message:
        "If this email address is in the system, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "unexpected response from server" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "the link has expired or the token is invalid." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "reset password successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "unexpected response from server" });
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

    // เช็กว่าอีเมลใหม่ซ้ำกับใครไหม (ใช้ .lean() และ select เฉพาะ isDeleted เพื่อความเร็วในการ Query)
    const checkEmail = await User.findOne({ email: newEmail })
      .select("isDeleted")
      .lean();
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
      { expiresIn: "10m" },
    );

    // ส่งอีเมลแบบ Background (ไม่ใส่ await เพื่อให้ Response ไม่ถูกบล็อก)
    const transporter = getTransporter();
    transporter
      .sendMail({
        from: `"Notes-Together" <${process.env.EMAIL_USER}>`,
        to: newEmail,
        subject: "Change Email Notes Together",
        html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Request to change email</h2>
          <p>You have requested to change your email. Please use the code below to verify your identity:</p>
          <h2 style="color: #4F46E5; letter-spacing: 2px;">${verificationCode}</h2>
          <p style="margin-top: 15px; font-size: 12px; color: #666;">This code will expire in 10 minutes.</p>
        </div>
      `,
      })
      .catch((mailError) => {
        console.error("Background Email Error:", mailError);
      });

    return res.status(200).json({
      message: "Verification code sent",
      temporalyToken,
    });
  } catch (error) {
    console.error("checkDuplicateEmail Error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    let query = { _id: { $ne: userId }, isDeleted: false };
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

export const googleLoginController = async (req, res) => {
  try {
    const { credential } = req.body; // รับ ID Token จาก Frontend

    if (!credential) {
      return res.status(400).json({ message: "Google Token is required" });
    }

    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("payload", payload)
    const { email, name, picture, sub: googleId } = payload;

    // 2. เช็กว่าผู้ใช้เคยมี Account ใน DB หรือยัง
    let user = await User.findOne({ email });

    if (!user) {
      // ถ้ายังไม่มี -> ทำการ Sign Up (สร้าง User ใหม่)
      user = new User({
        username: name,
        email: email,
        googleId: googleId,
        isVerified: true, // อีเมลจาก Google ผ่านการยืนยันแล้ว
        // รหัสผ่านไม่ต้องตั้ง หรือสุ่มเก็บไว้กรณี Schema บังคับ
      });
      await user.save();
    } else if (!user.googleId) {
      // 🟡 มีอีเมลอยู่แล้วแต่สมัครผ่านแบบธรรมดา -> อัปเดตผูก googleId ไว้
      user.googleId = googleId;
      await user.save();
    }

    // 3. สร้าง JWT Token ของระบบเราเองส่งกลับไปให้ Frontend
    const appToken = jwt.sign(
      { id: user._id, username: user.username, email: user.email, avatar: user.avatar, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 4. ส่งข้อมูล User และ Token กลับไป
    res.status(200).json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
