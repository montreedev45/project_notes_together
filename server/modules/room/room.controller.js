import Room from "./room.model.js";
import Notification from "../notification/notification.model.js";
import generateCode from "../../utils/generateCode.js";
import {
  sendNotificationEveryMemberOn,
  sendNotification,
  roleUpdated,
} from "../../sockets/socket.manage.js";
import crypto from "crypto";
import Plan from "../plan/plan.model.js";

// create room
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
        message: `your package allows a maximum of ${roomLimit} rooms. please upgrade your plan.`,
      });
    }

    const userJoinedRoomsCount = await Room.countDocuments({
      "members.user": userId,
      isDeleted: false,
    });

    const userPlanDetails = await Plan.findOne({
      plan: userPlan,
    }).lean();

    const userRoomLimit = userPlanDetails?.roomLimit ?? 3;

    // ปฏิเสธการเข้าร่วม หากโควตาห้องของผู้ใช้เต็มแล้ว และเขาไม่ใช่เจ้าของห้องนี้
    if (userJoinedRoomsCount >= userRoomLimit) {
      return res.status(403).json({
        message: `Your plan allows you to join a maximum of ${userRoomLimit} rooms. Please upgrade your account to join more.`,
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
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .sort({ createdAt: -1 })
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    res.status(201).json(populate);
  } catch (error) {
    res.status(500).json({ message: "create room failed" });
  }
};

// get my room
export const getMyRooms = async (req, res) => {
  try {
    const { criteria, searchTerm } = req.body;
    const userId = req.user._id;

    let query = {
      $or: [{ "members.user": userId }, { owner: userId }],
      isDeleted: false,
    };

    if (criteria === "private") {
      query.isPrivate = true;
    } else if (criteria === "public") {
      query.isPrivate = false;
    } else if (criteria === "owner") {
      query = { owner: userId, isDeleted: false };
    }

    if (searchTerm && searchTerm.trim()) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const rooms = await Room.find(query)
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing isDeleted owner members code shareLink invitedUsers",
      )
      .sort({ createdAt: -1 })
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username")
      .lean();

    // กรองห้องขยะทิ้ง (Data Integrity Check)
    const validRooms = rooms.map((room) => {
      const isOwner = room.owner._id.toString() === userId.toString();
      // ถ้าไม่ใช่เจ้าของห้อง ให้ทำลายข้อมูลลับทิ้งก่อนส่งออกไป
      if (!isOwner) {
        delete room.code;
        delete room.shareLink;
      }

      return room;
    });

    res.status(200).json(validRooms);
  } catch (error) {
    console.error("getMyRooms Error:", error);
    res.status(500).json({ success: false, message: "Fetch rooms failed" });
  }
};

// get all rooms
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
      // ถ้าเป็นห้อง Private ปกติเราควรจะเห็นเฉพาะที่เราเป็นสมาชิกเท่านั้น
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
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isDeleted isAllowCodeSharing owner members",
      )
      .sort({ createdAt: -1 })
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Fetch rooms failed" });
  }
};

// get room by id
export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ _id: roomId, isDeleted: false })
      .select(
        "_id name description isDeleted isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members code shareLink",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username")
      .lean();

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const ownerId = room.owner?._id;
    const isOwner = ownerId?.toString() === userId.toString();

    // เช็กว่าผู้ใช้เป็นสมาชิกของห้องนี้หรือไม่
    const isMember = room.members.some(
      (m) =>
        m.user?._id?.toString() === userId.toString() ||
        m.user?.toString() === userId.toString(),
    );

    // ลอจิกป้องกัน: ถ้าเป็นห้อง Private จะเข้าได้แค่ Owner และ Member
    if (room.isPrivate && !isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Access denied to this private room" });
    }

    // ลอจิกซ่อนข้อมูลความลับสำหรับคนที่ไม่ใช่เจ้าของห้อง
    if (!isOwner) {
      delete room.code;
      delete room.shareLink;
    }

    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// join room
export const joinRoom = async (req, res) => {
  try {
    const { roomId, code } = req.body;
    const userId = req.user._id.toString();
    let room;

    const selectFields =
      "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members";
    const populateQuery = [
      { path: "owner", select: "username avatar plan" },
      { path: "members.user", select: "avatar username" },
    ];

    if (code) {
      room = await Room.findOne({ code })
        .select(selectFields)
        .populate(populateQuery);
      if (!room)
        return res.status(404).json({ message: "Invalid invite code" });
      if (!room.isAllowCodeSharing) {
        return res
          .status(403)
          .json({ message: "The room owner has disabled sharing via code." });
      }
    } else if (roomId) {
      room = await Room.findById(roomId)
        .select(selectFields)
        .populate(populateQuery);
      if (!room) return res.status(404).json({ message: "Room not found" });
    } else {
      return res
        .status(400)
        .json({ message: "Please provide a Room ID or Code" });
    }

    const ownerId = room.owner._id.toString();
    const isOwner = ownerId === userId;

    const isAlreadyMember = room.members.some((member) => {
      const currentMemberId = member.user?._id
        ? member.user._id.toString()
        : member.user?.toString();
      return currentMemberId === userId;
    });

    // ฟังก์ชันช่วยเหลือสำหรับจัดรูปแบบข้อมูลก่อนส่งกลับ
    const formatRoomResponse = (roomDoc) => {
      const roomData = roomDoc.toObject();
      delete roomData.code;
      delete roomData.shareLink;
      delete roomData.__v;
      delete roomData.updatedAt;
      return roomData;
    };

    // หากเป็นสมาชิกอยู่แล้ว คืนค่าสำเร็จได้เลย
    if (isAlreadyMember) {
      return res.status(200).json(formatRoomResponse(room));
    }

    if (roomId && room.isPrivate && !isAlreadyMember && !isOwner) {
      return res
        .status(403)
        .json({ message: "This room is private. Please use an invite code." });
    }

    // ตรวจสอบ Plan Limit
    // นับจำนวนเพื่อนร่วมงาน (Colleagues) จริงๆ โดยไม่นับเจ้าของห้อง
    const colleaguesCount = room.members.filter((member) => {
      const memberId = member.user?._id
        ? member.user._id.toString()
        : member.user?.toString();
      return memberId !== ownerId;
    }).length;

    const ownerPlan = room.owner?.plan || "free";
    const planDetails = await Plan.findOne({ plan: ownerPlan }).lean();
    const colleagueLimit = planDetails?.colleagueLimit ?? 1;

    // ถ้าคนที่กำลังจะเข้า ไม่ใช่เจ้าของห้อง และโควตาเพื่อนร่วมงานเต็มแล้ว ให้ปฏิเสธ
    if (!isOwner && colleaguesCount >= colleagueLimit) {
      return res.status(403).json({
        message: `This room allows a maximum of ${colleagueLimit} colleagues. Please contact the room owner.`,
      });
    }

    const userJoinedRoomsCount = await Room.countDocuments({
      "members.user": userId,
      isDeleted: false,
    });

    // ดึงข้อมูล Plan Limit ของตัวผู้ใช้เอง (สมมติว่า req.user มีฟิลด์ plan)
    const currentUserPlan = req.user.plan || "free";
    const userPlanDetails = await Plan.findOne({
      plan: currentUserPlan,
    }).lean();
    // ดึงค่า roomLimit (ควรตั้งชื่อฟิลด์ใน Database ให้ตรงกับโควตานี้)
    const userRoomLimit = userPlanDetails?.roomLimit ?? 3;

    // ปฏิเสธการเข้าร่วม หากโควตาห้องของผู้ใช้เต็มแล้ว และเขาไม่ใช่เจ้าของห้องนี้
    if (!isOwner && userJoinedRoomsCount >= userRoomLimit) {
      return res.status(403).json({
        message: `Your current plan allows you to join a maximum of ${userRoomLimit} rooms. Please upgrade your account to join more.`,
      });
    }

    room.members.push({
      user: req.user._id,
      role: "viewer",
    });
    await room.save();

    // ส่งแจ้งเตือน (เฉพาะคนอื่นเข้า)
    if (!isOwner) {
      const newNotice = await Notification.create({
        recipient: room.owner._id,
        sender: req.user._id,
        type: "JOIN",
        roomId: room._id,
        roomName: room.name,
        message: `room: ${room.name}`,
      });

      await newNotice.populate("sender", "username avatar");
      const populatedNotice = newNotice.toObject();
      delete populatedNotice.updatedAt;
      delete populatedNotice.__v;

      sendNotification(ownerId, populatedNotice);
    }

    return res.status(200).json(formatRoomResponse(room));
  } catch (error) {
    console.error("Join room error:", error);
    return res.status(500).json({ message: "Join room failed" });
  }
};

// leave room
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

// update role
export const updateRole = async (req, res) => {
  try {
    const { roomId, memberId, role } = req.body;

    const currentUserId = req.user._id;

    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        owner: currentUserId,
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
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .sort({ createdAt: -1 })
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    if (!updatedRoom) {
      return res.status(403).json({
        message:
          "Update failed: Room not found, unauthorized, or member does not exist.",
      });
    }

    roleUpdated(roomId, memberId, role);

    const newNotice = await Notification.create({
      recipient: memberId,
      sender: currentUserId,
      type: "UPDATE_ROLE",
      roomId: updatedRoom._id,
      roomName: updatedRoom.name,
      message: `you to ${role} in room: ${updatedRoom.name}`,
    });

    await newNotice.populate([
      { path: "sender", select: "username avatar plan" },
      { path: "recipient", select: "username avatar plan" },
    ]);

    const populatedNotice = (data) => {
      const plainData = data.toObject ? data.toObject() : { ...data };
      delete data.updatedAt;
      delete data.__v;
      return plainData;
    };

    const cleanNotic = populatedNotice(newNotice);

    sendNotification(memberId, cleanNotic);

    res.json(updatedRoom);
  } catch (error) {
    console.error("Update Role Error:", error);
    return res.status(500).json({ message: "Update role failed" });
  }
};

// soft delete
export const softDelete = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not the owner" });
    }

    const roomUpdated = await Room.findByIdAndUpdate(
      roomId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { returnDocument: "after", lean: true },
    )
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    return res.status(200).json(roomUpdated);
  } catch (error) {
    console.error("Soft Delete Error:", error);
    return res.status(500).json({ message: "delete room failed" });
  }
};

// get trash room
export const getTrashRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const { criteria, searchTerm } = req.query;
    let query = { owner: userId, isDeleted: true };

    if (criteria === "private") {
      query.isPrivate = true;
    } else if (criteria === "public") {
      query.isPrivate = false;
    }

    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const trashRooms = await Room.find(query)
      .select(
        "_id name description isDeleted isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .sort({ createdAt: -1 })
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    res.status(200).json(trashRooms);
  } catch (error) {
    console.error("Backend Error Detail:", error);
    return res.status(500).json({ message: "Fetch room failed" });
  }
};

// restore room
export const restoreRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;

    // 1. ค้นหาห้องในถังขยะก่อน (ยังไม่อัปเดต) เพื่อยืนยันสิทธิ์
    const roomToRestore = await Room.findOne({
      _id: roomId,
      owner: userId,
      isDeleted: true,
    });

    if (!roomToRestore) {
      return res.status(404).json({
        message:
          "Room not found in trash or you are not authorized to restore it.",
      });
    }

    // 2. ดึง Plan และ Limit ของผู้ใช้ (ใช้โค้ดชุดเดียวกับตอน Join Room)
    const currentUserPlan = req.user.plan || "free";
    const userPlanDetails = await Plan.findOne({
      plan: currentUserPlan,
    }).lean();
    const userRoomLimit = userPlanDetails?.roomLimit ?? 3;

    // 3. นับจำนวนห้องแบบ Active ที่ผู้ใช้นี้มีชื่ออยู่
    const activeRoomsCount = await Room.countDocuments({
      "members.user": userId,
      isDeleted: false,
    });

    // 4. บล็อกการ Restore หากโควตาเต็มแล้ว
    if (activeRoomsCount >= userRoomLimit) {
      return res.status(403).json({
        message: `Cannot restore room. Your current plan allows a maximum of ${userRoomLimit} active rooms. Please upgrade or delete another active room first.`,
      });
    }

    // 5. โควตาผ่าน ดำเนินการ Restore และ Populate ข้อมูล
    const restoredRoom = await Room.findByIdAndUpdate(
      roomId,
      { isDeleted: false },
      { returnDocument: "after" }, // Mongoose ใช้ { new: true } เทียบเท่า returnDocument: "after"
    )
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    return res.status(200).json(restoredRoom);
  } catch (error) {
    console.error("Restore room error:", error);
    return res.status(500).json({ message: "Restore room failed" });
  }
};

// permanently delete
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

// permanently delete all
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

// update room
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
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

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

// delete member
export const deleteMember = async (req, res) => {
  try {
    const { roomId, memberId } = req.body;
    const userId = req.user._id;

    if (String(memberId) === String(userId)) {
      return res
        .status(400)
        .json({ message: "Owner cannot be removed from the room" });
    }

    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        owner: userId,
      },
      {
        $pull: { members: { user: memberId } },
      },
      { returnDocument: "after" },
    )
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    if (!updatedRoom) {
      return res.status(404).json({
        message: "Room not found or you are not authorized to manage members",
      });
    }

    // ฟังก์ชันช่วยเหลือสำหรับจัดรูปแบบข้อมูลก่อนส่งกลับ
    const formatRoomResponse = async (roomDoc) => {
      await roomDoc.populate("members.user", "avatar username");
      const roomData = roomDoc.toObject();
      delete roomData.code;
      delete roomData.shareLink;
      delete roomData.__v;
      delete roomData.updatedAt;
      return roomData;
    };

    return res.status(200).json(await formatRoomResponse(updatedRoom));
  } catch (error) {
    console.error("Delete member error:", error);
    return res.status(500).json({ message: "Delete member failed" });
  }
};

// join link
export const joinLink = async (req, res) => {
  try {
    const { shareLinkToken, role } = req.params;
    const userId = req.user._id.toString();

    const room = await Room.findOne({
      "shareLink.role": role,
      "shareLink.token": shareLinkToken,
    })
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing shareLink invitedUsers owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    if (!room)
      return res.status(404).json({ message: "Room or Share link not found" });

    if (room.shareLink.expiredAt && new Date() > room.shareLink.expiredAt) {
      return res.status(410).json({ message: "The share link has expired." });
    }

    const ownerId = room.owner._id.toString();
    const isOwner = ownerId === userId;

    // ตรวจสอบสมาชิก
    const isAlreadyMember = room.members.some((member) => {
      const currentMemberId = member.user?._id
        ? member.user._id.toString()
        : member.user?.toString();
      return currentMemberId === userId;
    });

    // ฟังก์ชันช่วยเหลือสำหรับจัดรูปแบบข้อมูล
    const formatRoomResponse = (roomDoc) => {
      const roomData = roomDoc.toObject ? roomDoc.toObject() : roomDoc;
      delete roomData.code;
      delete roomData.shareLink;
      delete roomData.__v;
      delete roomData.updatedAt;
      return roomData;
    };

    if (isAlreadyMember) {
      return res.status(200).json(formatRoomResponse(room));
    }

    // 1. ตรวจสอบโควตาเพื่อนร่วมงานของเจ้าของห้อง (ไม่นับ owner)
    const colleaguesCount = room.members.filter((member) => {
      const memberId = member.user?._id
        ? member.user._id.toString()
        : member.user?.toString();
      return memberId !== ownerId;
    }).length;

    const ownerPlan = room.owner?.plan || "free";
    const planDetails = await Plan.findOne({ plan: ownerPlan }).lean();
    const colleagueLimit = planDetails?.colleagueLimit ?? 1;

    if (!isOwner && colleaguesCount >= colleagueLimit) {
      return res.status(403).json({
        message: `This room allows a maximum of ${colleagueLimit} colleagues. Please contact the room owner.`,
      });
    }

    // 2. ตรวจสอบโควตาแพ็กเกจของคนที่กำลังจะเข้า (กรอง isDeleted: false)
    const userJoinedRoomsCount = await Room.countDocuments({
      "members.user": userId,
      isDeleted: false,
    });

    const currentUserPlan = req.user.plan || "free";
    const userPlanDetails = await Plan.findOne({
      plan: currentUserPlan,
    }).lean();
    const userRoomLimit = userPlanDetails?.roomLimit ?? 3;

    if (!isOwner && userJoinedRoomsCount >= userRoomLimit) {
      return res.status(403).json({
        message: `Your current plan allows you to join a maximum of ${userRoomLimit} rooms. Please upgrade your account to join more.`,
      });
    }

    // 3. ตรวจสอบสิทธิ์ Private (invited)
    if (room.shareLink.access === "invited") {
      const isInvited = room.invitedUsers?.some(
        (id) => id.toString() === userId,
      );
      if (!isInvited && !isOwner) {
        return res.status(403).json({
          message:
            "Access denied. You must be invited by the owner to join this room.",
        });
      }
    }

    // 4. บันทึกสมาชิกใหม่
    const assignedRole = room.shareLink.role || "viewer";
    room.members.push({ user: userId, role: assignedRole });
    await room.save();

    // ดึงข้อมูลใหม่เพื่อคืนค่าพร้อม Avatar
    const joinedRoom = await Room.findById(room._id)
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    // 5. แจ้งเตือน
    if (!isOwner) {
      const newNotice = await Notification.create({
        recipient: ownerId,
        sender: userId,
        type: "JOIN",
        roomId: room._id,
        roomName: room.name,
        message: `room : ${room.name}`,
      });
      const populatedNotice = await newNotice.populate(
        "sender",
        "username avatar",
      );
      sendNotification(ownerId, populatedNotice);
    }

    return res.status(200).json(formatRoomResponse(joinedRoom));
  } catch (error) {
    console.error("Join link error:", error);
    return res.status(500).json({ message: "Join link failed" });
  }
};

// invite colleague
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
        message:
          "You do not have the right to invite other users to this room.",
      });
    }

    // ตรวจสอบว่าผู้ถูกเชิญ เป็นสมาชิกในห้องไปแล้วหรือยัง
    const isAlreadyMember = roomCheck.members.some(
      (member) => String(member.user) === String(userId),
    );
    if (isAlreadyMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this room" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { invitedUsers: userId } },
      { returnDocument: "after" },
    );

    const newNotice = await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: "INVITE",
      roomId: roomCheck._id,
      roomName: roomCheck.name,
      message: `you to room: ${roomCheck.name}`,
    });

    await newNotice.populate([
      { path: "sender", select: "username avatar plan" },
      { path: "recipient", select: "username avatar plan" },
    ]);

    const populatedNotice = (data) => {
      const plainData = data.toObject ? data.toObject() : { ...data };
      delete data.updatedAt;
      delete data.__v;
      return plainData;
    };

    const cleanNotic = populatedNotice(newNotice);

    sendNotification(userId, cleanNotic);
        console.log("invitedUsers", updatedRoom.invitedUsers)


    return res.status(200).json({
      message: "Invite colleague successfully",
      invitedUsers: updatedRoom.invitedUsers,
    });
  } catch (error) {
    console.error("Invite User Error:", error);
    return res.status(500).json({ message: "Invite colleague failed" });
  }
};

// cancel invite colleague
export const cancelInvitedUsers = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const currentUserId = req.user._id;

    if (String(userId) === String(currentUserId)) {
      return res
        .status(400)
        .json({ message: "You cannot cancel invite yourself" });
    }

    const roomCheck = await Room.findById(roomId);
    if (!roomCheck) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (String(roomCheck.owner) !== String(currentUserId)) {
      return res.status(403).json({
        message:
          "You do not have the right to cancel invite other users to this room.",
      });
    }

    const isInvited = roomCheck.invitedUsers.some(
      (id) => String(id) === String(userId),
    );

    if (!isInvited) {
      return res
        .status(400)
        .json({ message: "This user is not currently invited to this room." });
    }

    const isAlreadyMember = roomCheck.members.some(
      (member) => String(member.user) === String(userId),
    );

    if (isAlreadyMember) {
      return res
        .status(400)
        .json({ message: "Cannot cancel. User has already joined the room." });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { invitedUsers: userId } },
      { returnDocument: "after" },
    );

    const newNotice = await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: "CANCEL_INVITE",
      roomId: roomCheck._id,
      roomName: roomCheck.name,
      message: `you to room: ${roomCheck.name}`,
    });

    await newNotice.populate([
      { path: "sender", select: "username avatar plan" },
      { path: "recipient", select: "username avatar plan" },
    ]);

    const populatedNotice = (data) => {
      const plainData = data.toObject ? data.toObject() : { ...data };
      delete data.updatedAt;
      delete data.__v;
      return plainData;
    };

    const cleanNotic = populatedNotice(newNotice);

    sendNotification(userId, cleanNotic);

    return res.status(200).json({
      message: "Cancel Invite colleague successfully",
      invitedUsers: updatedRoom.invitedUsers,
    });
  } catch (error) {
    console.error("Cancel Invite User Error:", error);
    return res.status(500).json({ message: "Cancel Invite colleague failed" });
  }
};

// accept invite
export const acceptInvite = async (req, res) => {
  const userId = req.user._id.toString();
  const { roomId } = req.body;

  try {
    const room = await Room.findById(roomId).populate("owner", "plan");
    if (!room) return res.status(404).json({ message: "Room not found" });

    const isInvited = room.invitedUsers.some((m) => m.toString() === userId);
    if (!isInvited) {
      return res
        .status(403)
        .json({ message: "You are not invited to this room" });
    }

    const isAlreadyMember = room.members.some(
      (m) => m.user?.toString() === userId,
    );
    if (isAlreadyMember) {
      // ถ้าเป็นสมาชิกอยู่แล้ว แค่ลบชื่อออกจากคำเชิญอย่างเดียว
      await Room.findByIdAndUpdate(room._id, {
        $pull: { invitedUsers: userId },
      });
      return res.status(400).json({ message: "You are already a member" });
    }

    const ownerId = room.owner._id.toString();
    const isOwner = ownerId === userId;
    const colleaguesCount = room.members.filter(
      (m) => m.user?.toString() !== ownerId,
    ).length;

    const ownerPlan = room.owner?.plan || "free";
    const planDetails = await Plan.findOne({ plan: ownerPlan }).lean();
    const colleagueLimit = planDetails?.colleagueLimit ?? 1;

    if (colleaguesCount >= colleagueLimit) {
      return res.status(403).json({
        message: `This room has reached its maximum limit of ${colleagueLimit} colleagues.`,
      });
    }

    // ทำการอัปเดตข้อมูล (เอาชื่อออกจาก Invite และเพิ่มเข้า Members)
    const updatedRoom = await Room.findByIdAndUpdate(
      room._id,
      {
        $pull: { invitedUsers: userId },
        $push: { members: { user: userId, role: "viewer" } }, // ใช้ $push ปลอดภัยกว่า
      },
      { returnDocument: "after" },
    )
      .populate("owner", "username avatar plan")
      .populate("members.user", "avatar username");

    const cleanRoom = updatedRoom.toObject();
    delete cleanRoom.code;
    delete cleanRoom.shareLink;
    delete cleanRoom.__v;
    delete cleanRoom.createdAt;
    delete cleanRoom.updatedAt;

    if (!isOwner) {
      const newNotice = await Notification.create({
        recipient: room.owner._id,
        sender: userId,
        type: "JOIN",
        roomId: room._id,
        roomName: room.name,
        message: `room: ${room.name}`,
      });

      await newNotice.populate("sender", "username avatar");
      const populatedNotice = newNotice.toObject();
      delete populatedNotice.updatedAt;
      delete populatedNotice.__v;

      sendNotification(ownerId, populatedNotice);
    }

    return res.status(200).json({
      message: "Accept invite successful",
      updatedRoom: cleanRoom,
    });
  } catch (error) {
    console.error("Accept Invite Error:", error);
    return res.status(500).json({ message: "Accept Invite failed" });
  }
};

// decline invite
export const declineInvite = async (req, res) => {
  const userId = req.user._id.toString();
  const { roomId } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const isInvited = room.invitedUsers.some((m) => m.toString() === userId);
    if (!isInvited) {
      return res
        .status(403)
        .json({ message: "You are not invited to this room" });
    }

    const isAlreadyMember = room.members.some(
      (m) => m.user?.toString() === userId,
    );

    if (isAlreadyMember) {
      await Room.findByIdAndUpdate(room._id, {
        $pull: { invitedUsers: userId },
      });
      return res.status(400).json({ message: "You are already a member" });
    }

    await Room.findByIdAndUpdate(room._id, {
      $pull: { invitedUsers: userId },
    });

    return res.status(200).json({
      message: "Decline invite successful",
    });
  } catch (error) {
    console.error("Decline Invite Error:", error);
    return res.status(500).json({ message: "Decline Invite failed" });
  }
};

// transfer ownership
export const transferOwnership = async (req, res) => {
  try {
    const { roomId, newOwnerId } = req.body;
    const userId = req.user._id;

    if (String(userId) === String(newOwnerId)) {
      return res
        .status(400)
        .json({ message: "You are already the owner of this room." });
    }

    const room = await Room.findById(roomId)
      .select(
        "_id name description isPrivate color isOnlineStatus isLastEditTime isPeopleJoinRoom isAllowLinkSharing isAllowCodeSharing owner members",
      )
      .populate("owner", "username avatar plan")
      .populate("members.user", "username avatar");

    if (!room) return res.status(404).json({ message: "room not found" });

    if (String(room.owner._id) !== String(userId)) {
      return res.status(403).json({
        message: "you do not have the right to change the owner of the room.",
      });
    }

    // ตรวจสอบว่าเจ้าของใหม่เป็นสมาชิกในห้องหรือไม่
    const isMember = room.members.some(
      (m) => String(m.user._id) === String(newOwnerId),
    );
    if (!isMember) {
      return res
        .status(400)
        .json({ message: "New owner must be a member of the room." });
    }

    // อัปเดตสิทธิ์ (สมมติให้เจ้าของใหม่มี role: "owner" และเจ้าของเดิมมี role: "editor")
    room.members = room.members.map((m) => {
      if (String(m.user?._id) === String(newOwnerId))
        return { ...m, role: "owner" };
      if (String(m.user?._id) === String(userId))
        return { ...m, role: "editor" };
      return m;
    });

    room.owner = newOwnerId;
    await room.save();

    const newNotice = await Notification.create({
      recipient: newOwnerId,
      sender: userId,
      type: "TRANSFER_OWNER",
      roomId: room._id,
      roomName: room.name,
      message: `room: ${room.name} to you`,
    });

    await newNotice.populate([
      { path: "sender", select: "username avatar plan" },
      { path: "recipient", select: "username avatar plan" },
    ]);

    const populatedNotice = (data) => {
      const plainData = data.toObject ? data.toObject() : { ...data };
      delete data.updatedAt;
      delete data.__v;
      return plainData;
    };

    const cleanNotic = populatedNotice(newNotice);
    const roomBroadcastData = {
      ...cleanNotic,
      message: `room: ${cleanNotic.roomName} to ${cleanNotic.recipient.username}`,
    };

    sendNotification(newOwnerId, cleanNotic);
    sendNotificationEveryMemberOn(room._id.toString(), roomBroadcastData);

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

// update code room
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
      return res.status(500).json({
        message: "Can't generate a unique room code. Please try again.",
      });
    }

    // เปลี่ยนมาใช้ findOneAndUpdate ให้ถูกต้องตาม Syntax
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        owner: userId,
      },
      { code: newCode },
      { returnDocument: "after" },
    );

    if (!updatedRoom) {
      return res
        .status(404)
        .json({ message: "Room not found or unauthorized to update code" });
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

// update link share room
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
