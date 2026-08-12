import Note from "./note.model.js";
import Room from "../room/room.model.js";

export const handleUploadResponse = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const roomId = req.body.roomId || "general";

    // เจน URL เต็มรูปแบบส่งกลับไปให้ Tiptap
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${roomId}/${req.file.filename}`;

    return res.status(200).json({
      message: "Upload successfully",
      url: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
