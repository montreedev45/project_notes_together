import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { createRoom, getMyRooms, getRoomById, joinRoom, getAllRooms} from "./room.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.post("/my-rooms", authMiddleware, getMyRooms);
router.post("/all-rooms", authMiddleware, getAllRooms);
router.get("/:id", authMiddleware, getRoomById);
router.post("/join", authMiddleware, joinRoom);

export default router;