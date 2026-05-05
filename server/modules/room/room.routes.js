import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
  createRoom,
  getMyRooms,
  getRoomById,
  joinRoom,
  getAllRooms,
  leaveRoom,
  softDelete,
  getTrashRooms,
  restoreRoom,
  permanentlyDelete,
  updateRoom,
  addMember,
  updateRole,
  deleteMember
} from "./room.controller.js";

const router = express.Router();

//warning route matching conflict
router.put("/", authMiddleware, updateRoom)
router.post("/", authMiddleware, createRoom);
router.get("/trash", authMiddleware, getTrashRooms);
router.post("/my-rooms", authMiddleware, getMyRooms);
router.post("/all-rooms", authMiddleware, getAllRooms);

router.post("/join", authMiddleware, joinRoom);
router.post("/leave", authMiddleware, leaveRoom);
router.put("/add-member", authMiddleware, addMember)
router.put("/update-role", authMiddleware, updateRole)
router.put("/delete-member", authMiddleware, deleteMember)

router.get("/:id", authMiddleware, getRoomById); 

router.post("/delete/:roomId", authMiddleware, softDelete);
router.post("/restore/:roomId", authMiddleware, restoreRoom);
router.delete("/permanent/:roomId", authMiddleware, permanentlyDelete);

export default router;
