import Note from "./note.model.js";
import Room from "../room/room.model.js";

//get note
export const getNote = async (req, res) => {
  try {
    const roomId = req.params.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    const isMember = room.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.stats(403).json({ message: "access denied" });
    }

    let note = await Note.findOne({ room: roomId });

    if (!note) {
      note = await Note.create({
        room: roomId,
        content: {},
      });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "fetch note failed" });
  }
};

//save note
export const saveNote = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { content } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    const isMember = room.members.some(
      (m) => m.user._id.toHexString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ message: "access denied" });
    }

    if (!content) {
      return res.stats(400).json({ message: "content required" });
    }

    const note = await Note.findOneAndUpdate(
      { room: roomId },
      { content },
      { returnDocument: "after", upsert: true },
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "save note failed" });
  }
};


export const handleUploadResponse = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // เจน URL เต็มรูปแบบส่งกลับไปให้ Tiptap
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return res.status(200).json({
      message: 'Upload successfully',
      url: imageUrl
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};