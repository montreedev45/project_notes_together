import { sendComment } from "../../sockets/socket.manage.js";
import Comment from "./comment.model.js";
import Room from "../room/room.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getComment = async (req, res) => {
  const { roomId } = req.query;
  const userId = req.user._id;

  try {
    const room = await Room.findById(roomId).select("isPrivate members");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.isPrivate) {
      const isMember = room.members.some(
        (member) => member.user.toString() === userId.toString(),
      );

      if (!isMember) {
        return res.status(403).json({
          message: "Forbidden: You are not a member of this private room",
        });
      }
    }

    const comments = await Comment.find({ room: roomId }).populate(
      "sender",
      "username avatar",
    );

    return res.status(200).json({
      message: "Fetch comments successfully",
      comments,
    });
  } catch (error) {
    console.error("❌ Fetch comment error:", error);
    return res.status(500).json({ message: "fetch comment failed" });
  }
};

export const addComment = async (req, res) => {
  const { roomId, type, content } = req.body;
  const userId = req.user._id;

  let text = "";
  let stickerUrl = "";

  if (type === "text") {
    text = content;
  } else if (type === "sticker") {
    stickerUrl = content.endsWith(".png") ? content : `${content}.png`;
  }

  try {
    const room = await Room.findById(roomId).select("isPrivate members");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isMember = room.members.some(
      (member) => member.user.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          "Forbidden: You must be a member to add a comment in this room",
      });
    }

    const newComment = await Comment.create({
      room: roomId,
      sender: userId,
      text: text,
      type: type,
      stickerUrl: stickerUrl,
    });

    const populatedComment = await newComment.populate(
      "sender",
      "username avatar",
    );

    sendComment(roomId, populatedComment);

    return res
      .status(201)
      .json({ message: "add new comment successfully", populatedComment });
  } catch (error) {
    console.error("❌ Add comment error:", error); // 🟢 ควร Log error เสมอเพื่อให้ตามหาบั๊กได้ง่าย
    return res.status(500).json({ message: "add comment failed" });
  }
};

export const getAllSticker = (req, res) => {
  const stickerPath = path.join(__dirname, "../../public", "stickers");

  fs.readdir(stickerPath, (err, files) => {
    if (err) {
      console.error("Unable to scan directory:", err);
      return res.status(500).json({ message: "Unable to scan images" });
    }

    // กรองเอาเฉพาะไฟล์ที่เป็นรูปภาพ (ป้องกันไฟล์ระบบอื่นๆ เช่น .DS_Store หรือโฟลเดอร์ย่อย)
    const imageFiles = files.filter(
      (file) =>
        file.endsWith(".png") ||
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".webp"),
    );

    return res.status(200).json({ stickers: imageFiles });
  });
};

export const getSticker = (req, res) => {
  const { nameImg } = req.query;
  const imagePath = path.join(
    __dirname,
    "../../public",
    "stickers",
    `${nameImg}.png`,
  );

  if (fs.existsSync(imagePath)) {
    // ปลดล็อกการบล็อก NotSameOrigin สำหรับรูปภาพนี้
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    return res.sendFile(imagePath);
  } else {
    return res.status(404).json({ message: "Sticker not found" });
  }
};
