import Room from "./room.model.js";
import User from "../auth/auth.model.js";
import Notification from "../notification/notification.model.js";
import generateCode from "../../utils/generateCode.js";
import {
  sendNotification,
  roleUpdated,
  transferOwnershipSocket,
} from "../../sockets/socket.manage.js";
import crypto from "crypto";
import cron from "node-cron";
import Plan from "../plan/plan.model.js";

cron.schedule("0 0 * * *", async () => {
  console.log("cron starting...");

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ใช้ deleteMany สั่งลบห้องทั้งหมดที่ตรงเงื่อนไขในคำสั่งเดียว!
    // const expiredRooms = await Room.deleteMany({
    //   isDeleted: true,
    //   deletedAt: { $lt: thirtyDaysAgo }
    // });

    const expiredRooms = await Room.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo },
    });

    if (expiredRooms.length > 0) {
      for (const room of expiredRooms) {
        // ตรงนี้สามารถใส่ลอจิกเสริมได้ เช่น สั่งลบไฟล์ข้อความ/ไฟล์โน้ตที่ผูกกับห้องนี้ออกให้เกลี้ยง
        // await deleteRelatedNotes(room._id);
        await Room.findByIdAndDelete(room._id);
        console.log(`room ${room._id} has been deleted`);
      }
    } else {
      console.log("no rooms were deleted");
    }
  } catch (error) {
    console.log("error while running cron job to delete room", error);
  }
});

//create room
export const createRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const userPlan = req.user.plan;

    const planDetails = await Plan.findOne({ plan: userPlan });
    const roomLimit = planDetails.roomLimit ?? 3;

    const currentOwnerRoomCount = await Room.countDocuments({ owner: userId });

    if (currentOwnerRoomCount >= roomLimit) {
      return res.status(403).json({
        success: false,
        message: `your package allows a maximum of ${roomLimit} rooms. please upgrade your plan.`, // แก้คำผิดเล็กน้อย (lease -> please)
      });
    }

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
      owner: userId,
      members: [
        {
          user: userId,
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
    const { roomId } = req.params;
    const userId = req.user._id;

    // 1. หาห้องก่อน (ดูว่ามีห้องนี้อยู่จริงและไม่โดน Soft Delete)
    const room = await Room.findOne({ _id: roomId, isDeleted: false });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2. เช็กสิทธิ์การเข้าถึง (Permission Check)
    const isMember = room.members.some(
      (m) => m.user.toString() === userId.toString()
    );
    const isOwner = room.owner.toString() === userId.toString();

    // 🔒 ถ้าเป็น Private Room แล้วผู้ใช้ไม่ใช่ทั้ง Owner และ Member -> ปฏิเสธ access
    if (room.isPrivate && !isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Access denied to this private room" });
    }

    // 🔓 ถ้าเป็น Public Room หรือ เป็นคนในห้อง Private -> ส่งข้อมูลห้องกลับไปให้ Editor
    return res.status(200).json(room);
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//join room
export const joinRoom = async (req, res) => {
  try {
    const { roomId, code } = req.body;
    const userId = req.user._id;
    let room;

    if (code) {
      room = await Room.findOne({ code }).populate(
        "owner",
        "username email avatar plan",
      );
      if (!room)
        return res.status(404).json({ message: "Invalid invite code" });

      if (!room.isAllowCodeSharing)
        return res
          .status(403)
          .json({ message: "The room owner has disabled sharing via code." });
    } else if (roomId) {
      room = await Room.findById(roomId).populate(
        "owner",
        "username email avatar plan",
      );
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
      const existingRoom = await Room.findById(room._id)
        .populate("owner", "username email avatar")
        .populate("members.user", "avatar username");
      return res.json(existingRoom);
    }

    const ownerPlan = room.owner?.plan || "free";

    const planDetails = await Plan.findOne({ plan: ownerPlan });
    const colleagueLimit = planDetails.colleagueLimit ?? 1;

    if (room.members.length - 1 >= colleagueLimit) {
      if (room.owner._id.toString() === userId.toString()) {
        return res.status(403).json({
          message: `Your package allows a maximum of ${colleagueLimit} colleagues. Please upgrade your plan.`,
        });
      }

      return res.status(403).json({
        message: `This room allows a maximum of ${colleagueLimit} colleagues. Please contact the room owner.`,
      });
    }

    room.members.push({ user: userId, role: "viewer" });
    await room.save();

    const joinedRoom = await Room.findById(room._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar username");

    const newNotice = await Notification.create({
      recipient: room.owner._id, // ส่งถึงเจ้าของห้อง (._id)
      sender: req.user._id,
      type: "JOIN",
      roomId: room._id,
      roomName: room.name,
      message: `room: ${room.name}`,
    });

    const populatedNotice = await newNotice.populate(
      "sender",
      "username avatar email",
    );

    sendNotification(room.owner._id.toString(), populatedNotice);

    return res.json(joinedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Join room failed" });
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
      message: `room : ${room.name}`,
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

export const updateRole = async (req, res) => {
  try {
    const { roomId, memberId, role } = req.body;

    const currentUserId = req.user.id;

    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        owner: currentUserId, // บังคับว่าคนแก้ต้องเป็น Owner ของห้องเท่านั้น
        "members.user": memberId, // บังคับว่าเป้าหมายที่ถูกเปลี่ยนสิทธิ์ ต้องอยู่ในห้องนี้จริงๆ
      },
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

    if (!updatedRoom) {
      return res.status(403).json({
        message:
          "Update failed: Room not found, unauthorized, or member does not exist.",
      });
    }

    roleUpdated(roomId, memberId, role);

    res.json(updatedRoom);
  } catch (error) {
    console.error("Update Role Error:", error);
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

    const restoredRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        owner: userId, // บังคับว่าต้องเป็นเจ้าของห้องเท่านั้นถึงจะกู้คืนได้
      },
      { isDeleted: false },
      { returnDocument: "after" },
    )
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");

    if (!restoredRoom) {
      return res
        .status(404)
        .json({ message: "Room not found or unauthorized to restore" });
    }

    return res.json(restoredRoom);
  } catch (error) {
    console.error("Restore room error:", error); // ควร log error ไว้ดูเสมอ
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
      isDeleted: true,
    });

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

export const permanentlyDeleteAll = async (req, res) => {
  try {
    const userId = req.user._id;

    const deleteRoom = await Room.deleteMany({
      owner: userId,
      isDeleted: true,
    });

    // ถ้าไม่เจอห้อง (อาจจะ ID ผิด หรือไม่ใช่เจ้าของ)
    if (!deleteRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Delete all room succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unexpected response from server" });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { roomId, newData } = req.body;
    const userId = req.user._id;

    if (!roomId || !newData || Object.keys(newData).length === 0) {
      return res
        .status(400)
        .json({ message: "roomId and valid newData are required" });
    }

    // กำหนดรายชื่อ Field ที่อนุญาตให้อัปเดตได้
    const allowedKeys = [
      "name",
      "description",
      "color",
      "isPrivate",
      "isOnlineStatus",
      "isLastEditTime",
      "isPeopleJoinRoom",
      "isAllowLinkSharing",
      "isAllowCodeSharing",
    ];

    // วนลูปและคัดเลือกเฉพาะข้อมูลที่มีการส่งเข้ามา (รวมถึงค่า false หรือ "")
    const allowedUpdates = allowedKeys.reduce((acc, key) => {
      if (newData[key] !== undefined) {
        acc[key] = newData[key];
      }
      return acc;
    }, {});
    
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        owner: userId,
      },
      { $set: allowedUpdates },
      { returnDocument: "after" },
    )
      .populate("owner", "username email")
      .populate("members.user", "avatar username _id");

    if (!updatedRoom) {
      return res
        .status(404)
        .json({ message: "Room not found or unauthorized to update" });
    }

    return res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({ message: "Update room failed" });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { roomId, memberId } = req.body;
    const userId = req.user._id;

    if (String(memberId) === String(userId)) {
      return res.status(400).json({ message: "Owner cannot be removed from the room" });
    }

    const updatedRoom = await Room.findOneAndUpdate(
      { 
        _id: roomId, 
        owner: userId
      },
      { 
        $pull: { members: { user: memberId } } 
      },
      { returnDocument: 'after' }
    )
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar email username");

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found or you are not authorized to manage members" });
    }

    return res.json(updatedRoom);
  } catch (error) {
    console.error("Delete member error:", error);
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
      .populate("owner", "username email avatar plan")
      .populate("members.user", "avatar email username");

    if (!room)
      return res.status(404).json({ message: "Room or Share link not found" });

    if (room.shareLink.expiredAt && new Date() > room.shareLink.expiredAt) {
      return res.status(410).json({ message: "The share link has expired." });
    }

    const ownerPlan = room.owner?.plan || "free";

    const planDetails = await Plan.findOne({ plan: ownerPlan });
    const colleagueLimit = planDetails.colleagueLimit ?? 1;

    const isMember = room.members.some(
      (m) => m.user?._id.toString() === userId.toString(),
    );

    if (isMember) {
      return res.status(200).json(room);
    }

    // ตรวจสอบสิทธิ์การเข้าถึงตามกรณี (anyone VS invited)
    if (room.shareLink.access === "invited") {
      const isInvited = room.invitedUsers?.some(
        (id) => id.toString() === userId.toString(),
      );

      if (!isInvited && room.owner._id.toString() !== userId.toString()) {
        return res.status(403).json({
          message:
            "Access denied. You must be invited by the owner to join this room.",
        });
      }
    }

    if (room.members.length - 1 >= colleagueLimit) {
      if (room.owner._id.toString() === userId.toString()) {
        return res.status(403).json({
          message: `Your package allows a maximum of ${colleagueLimit} colleagues. Please upgrade your plan.`,
        });
      }

      return res.status(403).json({
        message: `This room allows a maximum of ${colleagueLimit} colleagues. Please contact the room owner.`,
      });
    }

    // บันทึกสมาชิกใหม่
    const assignedRole = room.shareLink.role || "viewer";
    room.members.push({ user: userId, role: assignedRole });
    await room.save();

    const joinedRoom = await Room.findById(room._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar username");

    // สร้าง Notification และส่ง Socket... (โค้ดส่วนล่างถูกต้องดีแล้วครับ)
    const newNotice = await Notification.create({
      recipient: room.owner._id.toString(),
      sender: req.user._id,
      type: "JOIN",
      roomId: room._id,
      roomName: room.name,
      message: `room : ${room.name}`,
    });

    const populatedNotice = await newNotice.populate(
      "sender",
      "username avatar email",
    );
    const ownerId = room.owner._id.toString();
    sendNotification(ownerId, populatedNotice);

    return res.status(200).json(joinedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Join link failed" });
  }
};

export const invitedUsers = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const currentUserId = req.user._id;

    if (String(userId) === String(currentUserId)) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }

    const roomCheck = await Room.findById(roomId);
    if (!roomCheck) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (String(roomCheck.owner) !== String(currentUserId)) {
      return res.status(403).json({
        message: "You do not have the right to invite other users to this room.",
      });
    }

    // ตรวจสอบว่าผู้ถูกเชิญ เป็นสมาชิกในห้องไปแล้วหรือยัง
    // (สมมติว่า schema ของคุณคือ members: [{ user: ObjectId, role: String }])
    const isAlreadyMember = roomCheck.members.some(
      (member) => String(member.user) === String(userId)
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already a member of this room" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { invitedUsers: userId } },
      { returnDocument: 'after' }
    );

    return res.status(200).json({
      message: "Invite colleague successfully",
      invitedUsers: updatedRoom.invitedUsers,
    });
  } catch (error) {
    console.error("Invite User Error:", error);
    return res.status(500).json({ message: "Invite colleague failed" });
  }
};

export const transferOwnership = async (req, res) => {
  try {
    const { roomId, newOwnerId } = req.body;
    const userId = req.user._id;

    if (String(userId) === String(newOwnerId)) {
      return res.status(400).json({ message: "You are already the owner of this room." });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "room not found" });

    if (String(room.owner) !== String(userId)) {
      return res.status(403).json({
        message: "you do not have the right to change the owner of the room.",
      });
    }

    // ตรวจสอบว่าเจ้าของใหม่เป็นสมาชิกในห้องหรือไม่
    const isMember = room.members.some(m => String(m.user) === String(newOwnerId));
    if (!isMember) {
      return res.status(400).json({ message: "New owner must be a member of the room." });
    }

    // อัปเดตสิทธิ์ (สมมติให้เจ้าของใหม่มี role: "owner" และเจ้าของเดิมมี role: "editor")
    room.members = room.members.map((m) => {
      if (String(m.user) === String(newOwnerId)) return { ...m, role: "owner" };
      if (String(m.user) === String(userId)) return { ...m, role: "editor" };
      return m;
    });

    room.owner = newOwnerId;
    await room.save();

    // const newNotice = await Notification.create({
    //   recipient: room.owner, // ส่งถึงเจ้าของห้อง
    //   sender: req.user._id, // คนที่กด Join
    //   type: "JOIN",
    //   roomId: room._id,
    //   roomName: room.name,
    //   message: `${req.user.username} joined your room: ${room.name}`,
    // });

    // // 🚩 2. Populate ข้อมูล sender เพื่อส่งไปกับ Socket (ให้เห็นชื่อและรูปทันที)
    // const populatedNotice = await newNotice.populate(
    //   "sender",
    //   "username avatar email",
    // );

    // sendNotification(room.owner.toString(), populatedNotice);

    // ประหยัด Query โดยการ Populate Document เดิมที่มีอยู่แล้ว
    await room.populate([
      { path: "owner", select: "username email avatar" },
      { path: "members.user", select: "avatar email username" }
    ]);

    return res.status(200).json({
      success: true,
      message: "transfer ownership successfully",
      data: room,
    });
  } catch (error) {
    console.error("Transfer Error:", error);
    return res.status(500).json({ message: "transfer ownership failed" });
  }
};

const generate6DigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const updateCodeRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user._id;

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
      return res.status(500).json({ message: "Can't generate a unique room code. Please try again." });
    }

    // เปลี่ยนมาใช้ findOneAndUpdate ให้ถูกต้องตาม Syntax
    const updatedRoom = await Room.findOneAndUpdate(
      { 
        _id: roomId, 
        owner: userId
      },
      { code: newCode },
      { returnDocument: 'after' }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found or unauthorized to update code" });
    }

    return res.status(200).json({
      message: "Updated room code successfully",
      newCode: updatedRoom.code,
    });
  } catch (error) {
    console.error("Update Code Error:", error);
    return res.status(500).json({ message: "Update room code failed" });
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
