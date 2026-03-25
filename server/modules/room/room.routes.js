import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { createRoom, getMyRooms, getRoomById, joinRoom } from "./rooom.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.get("/", authMiddleware, getMyRooms);
router.get("/:id", authMiddleware, getRoomById);
router.post("/join", authMiddleware, joinRoom);

export default router;