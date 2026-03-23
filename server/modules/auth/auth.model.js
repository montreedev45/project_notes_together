import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        unique: true
    },
    avatar: {
        type: String,
        default: "#3888f1"
    }
},{timestramps: true});

const User = mongoose.model("User", userSchema);

export default User;

