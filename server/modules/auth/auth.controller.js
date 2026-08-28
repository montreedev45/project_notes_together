import User from "./auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Room from "../room/room.model.js";
import Plan from "../plan/plan.model.js";
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
      googleId: user.googleId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check exist email and Is delete?
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isDeleted) {
        return res.status(400).json({
          message: "This account has been deactivated. Please contact support.",
        });
      }
      return res.status(400).json({ message: "Email already used" });
    }

    // hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    // attach token in cookie
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 1000,
    });

    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user and Is delete?
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (user.isDeleted) {
      return res.status(400).json({
        message: "This account has been deactivated. Please contact support.",
      });
    }

    // check password is match?
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // attach token in cookie
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true, // ป้องกัน JavaScript ฝั่ง Frontend อ่านค่า (กัน XSS)
      secure: process.env.NODE_ENV === "production", // ส่งเฉพาะ HTTPS เท่านั้น (ใน dev ใช้ false ได้)
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, avatar, email } = req.body;

    // find user by id
    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // create updateData object
    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;

    // if request change email
    if (email && email !== user.email) {
      // if signup with Google Auth -> reject Email
      if (user.googleId) {
        return res.status(400).json({
          message:
            "Accounts logged in via Google cannot change their email address.",
        });
      }

      // check new email is duplicate other user?
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "This email is already in use." });
      }
      updateData.email = email;
    }

    // update data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: "after" },
    );

    // attach token in cookie
    const newToken = generateToken(updatedUser);
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check payload?
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // check it's google account?
    if (!user.password && user.googleId) {
      return res.status(400).json({
        message:
          "Google authenticated accounts cannot change password directly. Please set up a password first.",
      });
    }

    // check newPassword and confirmNewPassword is match?
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "current password is incorrect" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server  error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { currentEmail } = req.body;

    // find user from email
    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return res.status(200).json({
        message: "please check your email for the verification code.",
      });
    }

    // check it google account?
    if (user.googleId) {
      return res.status(400).json({
        message:
          "This account was created with Google Sign-In and does not have a password. Please sign in using Google or reset your password on Google.",
      });
    }

    // create token for reset password
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // save token and expire in db
    user.resetPasswordToken = hashPasswordToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // send reset url to mail
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

    // hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user from reset password and not expire
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "the link has expired or the token is invalid." });
    }

    // hash token and set reset password token, reset password expire
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

    const user = await User.findById(userId).select("+password");
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

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Change email successfully",
      user: user,
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
    const appToken = generateToken(user);

    res.cookie("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4. ส่งข้อมูล User และ Token กลับไป
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId } = req.body;

    //when use findById, it's return object { _id: "...", plan: "teams" }
    const selectedPlan = await Plan.findById(planId).select("plan");
    if (!selectedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const upgradedPlan = await User.findByIdAndUpdate(
      userId,
      { plan: selectedPlan.plan },
      { returnDocument: "after", select: "-password" },
    );

    const newToken = generateToken(upgradedPlan);

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Plan upgraded successfully",
      user: upgradedPlan,
    });
  } catch (error) {
    console.error("Upgrade plan error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Upgrade plan failed" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};