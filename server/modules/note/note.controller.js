export const handleUploadResponse = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const roomId = req.body.roomId || "general";

    // (ปรับ /api/notes ให้ตรงกับที่คุณประกาศ app.use() ใน app.js)
    const imageUrl = `${req.protocol}://${req.get("host")}/api/notes/image/${roomId}/${req.file.filename}`;

    return res.status(200).json({
      message: "Upload successfully",
      url: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};