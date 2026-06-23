import mongoose, { Types } from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "sticker"],
      default: "text",
    },
    stickerUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
