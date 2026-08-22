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
  updateRole,
  deleteMember,
  joinLink,
  updateCodeRoom,
  updateLinkShareRoom,
  invitedUsers,
  transferOwnership,
  permanentlyDeleteAll
} from "./room.controller.js";
import { validate } from "../../middleware/validateZod.js";
import { apiLimiter, writeLimiter } from "../../middleware/rateLimiter.js";
import { createRoomSchema, deleteMemberSchema, getAllRoomsSchema, getRoomByIdSchema, getRoomsSchema, getTrashRoomsSchema, invitedUsersSchema, joinLinkSchema, joinRoomSchema, leaveRoomSchema, permanentlyDeleteSchema, restoreRoomSchema, softDeleteSchema, transferOwnershipSchema, updateCodeRoomSchema, updatedRoomSchema, updateLinkShareRoomSchema, updateRoleSchema } from "./room.schema.js";

const router = express.Router();

//warning route matching conflict
router.put("/", authMiddleware, apiLimiter, validate(updatedRoomSchema), updateRoom)
router.post("/", authMiddleware, writeLimiter, validate(createRoomSchema), createRoom);
router.get("/trash", authMiddleware, apiLimiter, validate(getTrashRoomsSchema), getTrashRooms);
router.post("/my-rooms", authMiddleware, apiLimiter, validate(getRoomsSchema), getMyRooms);
router.post("/all-rooms", authMiddleware, apiLimiter, validate(getAllRoomsSchema), getAllRooms);

router.post("/join", authMiddleware, writeLimiter, validate(joinRoomSchema), joinRoom);
router.post("/leave", authMiddleware, writeLimiter, validate(leaveRoomSchema), leaveRoom);
router.put("/update-role", authMiddleware, apiLimiter, validate(updateRoleSchema), updateRole)
router.put("/delete-member", authMiddleware, apiLimiter, validate(deleteMemberSchema), deleteMember)
router.put("/update-code", authMiddleware, apiLimiter, validate(updateCodeRoomSchema), updateCodeRoom)
router.post("/invite-colleague", authMiddleware, apiLimiter, validate(invitedUsersSchema), invitedUsers)
router.post("/transfer-ownership", authMiddleware, apiLimiter, validate(transferOwnershipSchema), transferOwnership)
router.delete("/permanent-all", authMiddleware, apiLimiter, permanentlyDeleteAll);

router.get("/:roomId", authMiddleware, apiLimiter, validate(getRoomByIdSchema),  getRoomById); 

router.get("/join-link/:shareLinkToken/:role", authMiddleware, apiLimiter, validate(joinLinkSchema), joinLink)
router.put("/update-link-share/:roomId", authMiddleware, apiLimiter, validate(updateLinkShareRoomSchema), updateLinkShareRoom)
router.post("/delete/:roomId", authMiddleware, apiLimiter, validate(softDeleteSchema), softDelete);
router.post("/restore/:roomId", authMiddleware, apiLimiter, validate(restoreRoomSchema), restoreRoom);
router.delete("/permanent/:roomId", authMiddleware, apiLimiter, validate(permanentlyDeleteSchema), permanentlyDelete);

export default router;