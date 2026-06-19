import { sendComment } from "../../sockets/socket.manage.js";
import Comment from "./comment.model.js";

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
      comments
    });

  } catch (error) {
    console.error("❌ Fetch comment error:", error);
    return res.status(500).json({ message: "fetch comment failed" });
  }
};

export const addComment = async (req, res) => {
  const { roomId, text } = req.body;

  try {
    const newComment = await Comment.create({
      room: roomId,
      sender: req.user._id,
      text: text,
    })

    const populatedComment = await newComment.populate("sender", "username avatar");

    sendComment(roomId, populatedComment)

    return res.status(201).json({ message: "add new comment successfully", populatedComment });
  } catch (error) {
    return res.status(500).json({ message: "add comment failed" });
  }
};
