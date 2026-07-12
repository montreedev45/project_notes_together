import Room from "./room.model.js";
import User from "../auth/auth.model.js";
import Notification from "../notification/notification.model.js";
import generateCode from "../../utils/generateCode.js";
import { sendNotification, roleUpdated } from "../../sockets/socket.manage.js";
import crypto from "crypto";

//create room
export const createRoom = async (req, res) => {
  try {
    let roomCode = generateCode();
    let isUnique = false;

    while (!isUnique) {
      const existingRoom = await Room.findOne({ roomCode });
      if (!existingRoom) {
        isUnique = true;
      } else {
        roomCode = generateCode();
      }
    }

    const { name, description, isPrivate, selectedColor } = req.body;
    const shareLinkToken = crypto.randomBytes(16).toString("hex");

    const room = await Room.create({
      name,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
      isPrivate,
      color: selectedColor,
      code: roomCode,
      shareLink: {
        token: shareLinkToken,
        access: "anyone",
        expiredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    });

    //case: when create room frontend not received some data
    const populate = await Room.findById(room._id)
      .populate("owner", "username email")
      .populate("members.user", "avatar username");

    res.json(populate);
  } catch (error) {
    res.status(500).json({ message: "create room failed" });
  }
};

//get my room
export const getMyRooms = async (req, res) => {
  try {
    const { criteria, searchTerm } = req.body;
    const userId = req.user._id;

    // 1. สร้าง Query Object เบื้องต้น (เริ่มต้นด้วยการหาห้องที่เราเป็นสมาชิก)
    let query = {
      $or: [{ "members.user": userId }, { owner: userId }],
      isDeleted: false,
    };

    // 2. ปรับเปลี่ยน Query ตาม Criteria ที่ได้รับมา
    if (criteria === "private") {
      query.isPrivate = true;
    } else if (criteria === "public") {
      query.isPrivate = false;
    } else if (criteria === "owner") {
      // ถ้าดูเฉพาะที่เราเป็นเจ้าของ ให้ล้าง query เดิมแล้วใช้ owner แทน
      query = { owner: userId, isDeleted: false };
    }

    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id email");

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Fetch rooms failed" });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const { criteria, searchTerm } = req.body;
    const userId = req.user._id;

    // 1. เริ่มต้นด้วย Query ว่าง (ค้นหาทุกห้อง)
    let query = { isDeleted: false };

    // 2. ปรับเงื่อนไขตาม Criteria
    if (criteria === "owner") {
      query.owner = userId;
    } else if (criteria === "private") {
      query.isPrivate = true;
      // 🔐 ถ้าเป็นห้อง Private ปกติเราควรจะเห็นเฉพาะที่เราเป็นสมาชิกเท่านั้น
      query["members.user"] = userId;
    } else if (criteria === "public") {
      query.isPrivate = false;
    } else if (criteria === "joined") {
      // เพิ่ม Criteria ใหม่: เฉพาะห้องที่เราไปจอยไว้
      query["members.user"] = userId;
    }
    // ถ้า criteria === "all" หรืออื่นๆ query จะยังเป็น {} ซึ่งหมายถึงหาทั้งหมด

    // 3. ส่วนของการ Search (ทำงานร่วมกับ Query ด้านบน)
    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm.trim(), $options: "i" };
    }

    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Fetch rooms failed" });
  }
};

//get room by id
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "members.user",
      "username email",
    );

    if (!room) {
      res.status(404).json({ message: "room not found" });
    }

    //check member
    const isMember = room.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ message: "access denied" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "fetch room failed" });
  }
};

//join room
export const joinRoom = async (req, res) => {
  try {
    const { roomId, code } = req.body;
    const userId = req.user._id;
    let room;

    if (code) {
      room = await Room.findOne({ code });
      if (!room)
        return res.status(404).json({ message: "Invalid invite code" });

      if (!room.isAllowCodeSharing)
        return res
          .status(403)
          .json({ message: "The room owner has disabled sharing via code." });
    } else if (roomId) {
      room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      if (room.isPrivate) {
        return res.status(403).json({
          message: "This room is private. Please use an invite code.",
        });
      }
    }

    if (!room)
      return res
        .status(400)
        .json({ message: "Please provide a Room ID or Code" });

    const alreadyMember = room.members.find(
      (m) => m.user.toString() === userId.toString(),
    );

    if (alreadyMember) {
      // ถ้าเป็นสมาชิกอยู่แล้ว ให้ส่งข้อมูลห้องที่ Populate แล้วกลับไป
      const existingRoom = await Room.findById(room._id)
        .populate("owner", "username email avatar")
        .populate("members.user", "avatar username");
      return res.json(existingRoom);
    }

    // 3. เพิ่มสมาชิกใหม่
    room.members.push({ user: userId, role: "viewer" });
    await room.save();

    // 4. ส่งข้อมูลกลับพร้อม Populate
    const joinedRoom = await Room.findById(room._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar username");

    const newMemberData = joinedRoom.members.find(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );

    //save
    // 🚩 1. สร้าง Notification ลง Database
    const newNotice = await Notification.create({
      recipient: room.owner, // ส่งถึงเจ้าของห้อง
      sender: req.user._id, // คนที่กด Join
      type: "JOIN",
      roomId: room._id,
      roomName: room.name,
      message: `${req.user.username} joined your room: ${room.name}`,
    });

    // 🚩 2. Populate ข้อมูล sender เพื่อส่งไปกับ Socket (ให้เห็นชื่อและรูปทันที)
    const populatedNotice = await newNotice.populate(
      "sender",
      "username avatar email",
    );

    sendNotification(room.owner.toString(), populatedNotice, {
      newMemberData,
    });

    res.json(joinedRoom);
  } catch (error) {
    res.status(500).json({ message: "join room failed" });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "room not found" });

    if (room?.owner?.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Owner cannot leave the room. Please delete the room.",
      });
    }

    await Room.findByIdAndUpdate(roomId, {
      $pull: { members: { user: userId } },
    });

    const newNotice = await Notification.create({
      recipient: room.owner, // ส่งถึงเจ้าของห้อง
      sender: req.user._id, // คนที่กด Leave
      type: "LEAVE",
      roomId: room._id,
      roomName: room.name,
      message: `${req.user.username} leave your room: ${room.name}`,
    });

    // 🚩 2. Populate ข้อมูล sender เพื่อส่งไปกับ Socket (ให้เห็นชื่อและรูปทันที)
    const populatedNotice = await newNotice.populate(
      "sender",
      "username avatar",
    );

    sendNotification(room.owner.toString(), populatedNotice);

    res.status(200).json({ message: "leave rooom successfully" });
  } catch (error) {
    res.status(500).json({ message: "leave room failed" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { roomId, memberId, role } = req.body;

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: { user: memberId, role: role } } },
      { returnDocument: "after" },
    )
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar email username");

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.json(updatedRoom);
  } catch (error) {
    return res.status(500).json({ message: "Add member failed" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { roomId, memberId, role } = req.body;

    const updatedRole = await Room.findByIdAndUpdate(
      roomId,
      {
        $set: { "members.$[elem].role": role },
      },
      {
        arrayFilters: [{ "elem.user": memberId }],
        returnDocument: "after",
      },
    )
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar email username");

    if (!updatedRole)
      return res.status(404).json({ message: "Room not found" });

    roleUpdated(roomId, memberId, role);

    res.json(updatedRole);
  } catch (error) {
    return res.status(500).json({ message: "Update role failed" });
  }
};

export const softDelete = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId);

    if (!room) return res.status(404).json({ message: "room not found" });
    const roomUpdated = await Room.findByIdAndUpdate(
      roomId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { returnDocument: "after" },
    )
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");

    return res.status(200).json(roomUpdated);
  } catch (error) {
    return res.status(500).json({ message: "delete room failed" });
  }
};

export const getTrashRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const { searchTerm } = req.query;
    let query = { owner: userId, isDeleted: true };

    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const trashRooms = await Room.find(query)
      .sort({ deletedAt: -1 })
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");

    res.json(trashRooms);
  } catch (error) {
    console.error("Backend Error Detail:", error);
    return res.status(500).json({ message: "Fetch room failed" });
  }
};

export const restoreRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;

    const restoreRoom = await Room.findByIdAndUpdate(roomId, {
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");
    return res.json(restoreRoom);
  } catch (error) {
    return res.status(500).json({ message: "Restore room failed" });
  }
};

export const permanentlyDelete = async (req, res) => {
  try {
    const userId = req.user._id;
    const roomId = req.params.roomId;

    // ค้นหาห้องที่ ID ตรงกัน และ OWNER ต้องตรงกับคนสั่งลบด้วย
    const room = await Room.findOneAndDelete({
      _id: roomId,
      owner: userId,
    });

    // ถ้าไม่เจอห้อง (อาจจะ ID ผิด หรือไม่ใช่เจ้าของ)
    if (!room) {
      return res
        .status(404)
        .json({ message: "Room not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ message: "Permanently deleted room successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error during deletion" });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { roomId, newData } = req.body;

    if (!roomId || !newData) {
      return res
        .status(400)
        .json({ message: "roomId and newData are required" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $set: newData },
      { returnDocument: "after" },
    )
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");

    if (!updateRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res.status(500).json({ message: "Update room failed" });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { roomId, memberId } = req.body;

    if (memberId === req.user._id) {
      return res.status(400).json({ message: "Can not delete owner of room" });
    }

    //ใช้ $pull เพื่อลบ Object ใน members ที่มี user ตรงกับ memberId
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { members: { user: memberId } } },
      { returnDocument: "after" },
    )
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar email username");

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    return res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Delete member failed" });
  }
};

export const joinLink = async (req, res) => {
  try {
    const { shareLinkToken, role } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({
      "shareLink.role": role,
      "shareLink.token": shareLinkToken,
    })
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar email username");

    if (!room)
      return res.status(404).json({ message: "Room or Share link not found" });

    if (room.shareLink.expiredAt && new Date() > room.shareLink.expiredAt) {
      return res.status(410).json({ message: "The share link has expired." });
    }

    const isMember = room.members.some(
      (m) => m.user?._id.toString() === userId.toString(),
    );

    if (isMember) {
      return res.status(200).json(room);
    }

    // ตรวจสอบสิทธิ์การเข้าถึงตามกรณี (anyone VS invited)
    if (room.shareLink.access === "invited") {
      // เช็กว่าผู้ใช้คนนี้ มีชื่ออยู่ในรายชื่อที่ถูกเชิญไว้หรือไม่
      const isInvited = room.invitedUsers?.some(
        (id) => id.toString() === userId.toString(),
      );

      // ถ้าไม่ได้ถูกเชิญ และไม่ใช่เจ้าของห้อง ให้ส่ง 403 บล็อกทันที
      if (!isInvited && room.owner._id.toString() !== userId.toString()) {
        return res.status(403).json({
          message:
            "Access denied. You must be invited by the owner to join this room.",
        });
      }
    }
    // ถ้า access === "anyone" โค้ดจะปล่อยไหลผ่านเงื่อนไขนี้ไปทำงานต่อด้านล่างทันทีตามสเปก

    // ดึงสิทธิ์จริงบันทึกลงสมาชิกใหม่
    const assignedRole = room.shareLink.role || "viewer";
    room.members.push({ user: userId, role: assignedRole });
    await room.save();

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Join link failed" });
  }
};

export const invitedUsers = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const currentUserId = req.user._id;

    const roomCheck = await Room.findById(roomId);
    if (!roomCheck) {
      return res.status(404).json({ message: "room not found" });
    }

    if (roomCheck.owner.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message:
          "you do not have the right to invite other users to this room.",
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { invitedUsers: userId } },
      { returnDocument: "after" },
    );

    return res.status(200).json({
      message: "Invite colleague successfully",
      invitedUsers: updatedRoom.invitedUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Invite colleague failed" });
  }
};

const generate6DigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const updateCodeRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    let newCode = "";
    let isUnique = false;
    let safetyCount = 0;

    while (!isUnique && safetyCount < 10) {
      newCode = generate6DigitCode();

      const existingRoom = await Room.findOne({ code: newCode });

      if (!existingRoom) {
        isUnique = true;
      }

      safetyCount++;
    }

    if (!isUnique) {
      return res
        .status(500)
        .json({ message: "can't update code room, please try again" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { code: newCode },
      { returnDocument: "after" },
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "not found room" });
    }

    return res.status(200).json({
      message: "updated code room successfully",
      newCode: updatedRoom.code,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "update code room failed" });
  }
};

export const updateLinkShareRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { role, access } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (room.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "you not have permission to edit sharing." });
    }

    const newSecureToken = crypto.randomBytes(16).toString("hex");

    room.shareLink.token = newSecureToken;
    room.shareLink.access = access || room.shareLink.access; // ถ้าไม่มีส่งมาให้ใช้ค่าเดิม
    room.shareLink.role = role || room.shareLink.role; // ถ้าไม่มีส่งมาให้ใช้ค่าเดิม

    room.shareLink.expiredAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

    await room.save();

    return res.status(200).json(room.shareLink);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Update share settings failed" });
  }
};
