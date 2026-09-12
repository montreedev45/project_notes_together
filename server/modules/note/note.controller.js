import cloudinary from "../../config/cloudinary.js";

export const handleUploadResponse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const roomId = req.body.roomId || "general";

    // อัปโหลดเข้า Cloudinary ด้วย Stream
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: `notes_together/${roomId}`,
          type: "authenticated", // บังคับให้เป็นไฟล์ลับ ห้ามคนนอกเข้าถึง
        }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // สร้าง URL ที่ชี้กลับมาหา API ของเราเอง (ไม่ใช่ URL ของ Cloudinary)
    // uploadResult.public_id จะมีชื่อโฟลเดอร์ติดมาด้วย เราใช้ .split('/').pop() เพื่อดึงแค่ชื่อไฟล์
    const filename = uploadResult.public_id.split('/').pop();
    const imageUrl = `${req.protocol}://${req.get("host")}/api/notes/image/${roomId}/${filename}`;

    return res.status(200).json({
      message: "Upload successfully",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};