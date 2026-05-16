import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["JOIN", "LEAVE", "EDIT", "PERMISSION"],
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    roomName: { type: String, required: true },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }, // จะสร้าง createdAt และ updatedAt ให้โดยอัตโนมัติ
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
