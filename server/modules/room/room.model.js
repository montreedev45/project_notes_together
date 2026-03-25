import mongoose, { Types } from "mongoose";

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String,
        enum: ["owner", "editor", "viewer"],
        default: "owner"
    }
})

const roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: String,
    members: [memberSchema],
    isPrivate: {
        type:Boolean,
        default: false
    }
}, {timestamps: true})

const Room = mongoose.model("Room", roomSchema)

export default Room;