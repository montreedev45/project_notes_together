import { sendComment } from "../../sockets/socket.manage.js";
import Comment from "./comment.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getComment = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ message: "Missing roomId parameter" });
  }

  try {
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

  let text = "";
  let stickerUrl = "";

  if (type === "text") {
    text = content;
  } else if (type === "sticker") {
    stickerUrl = content.endsWith(".png") ? content : `${content}.png`;
  }

  try {
    const newComment = await Comment.create({
      room: roomId,
      sender: req.user._id,
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
    return res.status(500).json({ message: "add comment failed" });
  }
};

export const getAllSticker = (req, res) => {
  const { nameImg } = req.query;
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

    // ส่งอาร์เรย์รายชื่อไฟล์กลับไปให้หน้าบ้าน (เช่น ["sticker01.png", "sticker02.png"])
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
    res.sendFile(imagePath);
  } else {
    // ถ้าหาไม่เจอ ส่งรูป Default ไปแทน หรือตอบกลับ 404
    return res.status(404).json({ message: "Sticker not found" });
  }
};
