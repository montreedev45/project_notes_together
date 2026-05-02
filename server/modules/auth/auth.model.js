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
      required: true,
    },
    avatar: {
      type: String,
      default: "#4b9fff",
    },
    changeEmailCode: { type: String },
    changeEmailExpire: { type: Date },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;

