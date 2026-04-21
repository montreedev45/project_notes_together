import Room from "./room.model.js";
import generateCode from "../../utils/generateCode.js";

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
    });

    //case: when create room frontend not received some data
    const populate = await Room.findById(room._id)
      .populate("owner", "username email")
      .populate("members.user", "avatar username -_id");

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
    let query = { "members.user": userId };

    // 2. ปรับเปลี่ยน Query ตาม Criteria ที่ได้รับมา
    if (criteria === "private") {
      console.log("isPrivate");
      query.isPrivate = true;
    } else if (criteria === "public") {
      query.isPrivate = false;
    } else if (criteria === "owner") {
      // ถ้าดูเฉพาะที่เราเป็นเจ้าของ ให้ล้าง query เดิมแล้วใช้ owner แทน
      query = { owner: userId };
    }

    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
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

export const getAllRooms = async (req, res) => {
  try {
    const { criteria, searchTerm } = req.body;
    const userId = req.user._id;

    // 1. เริ่มต้นด้วย Query ว่าง (ค้นหาทุกห้อง)
    let query = {}; 

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

    console.log("query", query)

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

    // 1. ค้นหาห้อง (ลำดับความสำคัญ: ใช้ Code ก่อน ถ้าไม่มีค่อยใช้ roomId)
    if (code) {
      console.log("block code is working");
      // ถ้าส่ง Code มา ให้หาห้องจาก Code (ใช้สำหรับห้อง Private)
      room = await Room.findOne({ code });
      if (!room)
        return res.status(404).json({ message: "Invalid invite code" });
    } else if (roomId) {
      console.log("block roomId is working");
      // ถ้าส่ง roomId มา (ใช้สำหรับห้อง Public)
      room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      // 🔐 Security Check: ถ้าห้องนี้เป็น Private แต่พยายามเข้าผ่าน ID โดยไม่มี Code
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
    room.members.push({ user: userId, role: "editor" });
    await room.save();

    // 4. ส่งข้อมูลกลับพร้อม Populate
    const joinedRoom = await Room.findById(room._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "avatar username");

    res.json(joinedRoom);
  } catch (error) {
    res.status(500).json({ message: "join room failed" });
  }
};
