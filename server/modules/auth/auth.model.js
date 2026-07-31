import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { 
      type: String, 
      required: function() { return !this.googleId; }, // จะ required เฉพาะเมื่อไม่ได้ใช้ Google Login
      select: false
    },
    googleId: { type: String },
    avatar: {
      type: String,
      default: "#4b9fff",
    },
    plan: {
      type: String,
      enum: ["free", "teams", "bussiness"],
      default: "free"
    },
    changeEmailCode: { type: String },
    changeEmailExpire: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
