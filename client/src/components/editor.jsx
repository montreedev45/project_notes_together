import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { createYjs } from "../lib/yjs";
import { Icon } from "@iconify/react";
import Underline from "@tiptap/extension-underline";
import { useParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { connectSocket, disconnectSocket, getSocket } from "../socket";
import useRoomStore from "../store/useRoomStore";
import useCommentStore from "../store/useCommentStore";
import { formatChatTime } from "../utils/formatTime";

function Editor() {
  const { roomId, role } = useParams();
  const user = useAuthStore((state) => state.user);
  const getMyRooms = useRoomStore((state) => state.getMyRooms);
  const myRooms = useRoomStore((state) => state.myRooms);
  const roomData = myRooms.find((r) => r._id === roomId);
  const getComment = useCommentStore((state) => state.getComment);

  //initial load
  useEffect(() => {
    getMyRooms();
    getComment(roomId);
  }, []);

  const roomOnlineData = useRoomStore((state) => state.onlineUsers[roomId]);

  const quantityOnlineUsers = roomOnlineData?.count || 0;
  const activeUsersList = roomOnlineData?.activeUsers || [];

  const [yjs, setYjs] = useState(null);

  const providerRef = useRef(null);
  const ydocRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();

    if (socket && roomId) {
      socket.emit("join_room", {
        roomId,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      });
    }

    return () => {
      if (socket && roomId) {
        console.log("🏃‍♂️ User leaving editor page...");
        // ส่งสัญญาณบอกหลังบ้านเบาๆ ว่าฉันกำลังจะเดินออกจากห้องนี้แล้วนะ (แต่ไม่ต้องสั่ง socket.disconnect() ปิดท่อหลักทิ้ง)
        socket.emit("leave_room", { roomId });
      }
    };
  }, [roomId, user._id]);

  useEffect(() => {
    let active = true;

    // เรียกฟังก์ชันสร้างการเชื่อมต่อที่เราทำไว้
    const instance = createYjs(roomId, (readyYjs) => {
      // ตรวจสอบว่า Component ยังไม่ได้โดนปิดหน้าหนี ค่อยอัปเดตสเตท
      if (active) {
        setYjs(readyYjs);
      }
    });

    // ฝากวัตถุไว้ใน ref เพื่อไม่ให้ลัดวงจรหายไปไหน
    ydocRef.current = instance.ydoc;
    providerRef.current = instance.provider;

    return () => {
      active = false;
      setYjs(null); // ล้างสเตทหน้าจอรอรับห้องใหม่

      // สั่งตัดขาดสายเชื่อมต่อเฉพาะตอนที่ผู้ใช้เปลี่ยนห้อง หรือกดปิดหน้าต่างหนีจริง ๆ เท่านั้น
      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [roomId]);

  if (!yjs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400 font-medium">
          Connecting to sync server...
        </div>
      </div>
    );
  }

  return (
    <EditorInner
      key={roomId}
      yjs={yjs}
      user={user}
      room={roomData}
      onlineUsers={quantityOnlineUsers}
      activeUsersList={activeUsersList}
    />
  );
}

function ChatInput({ value, onChangeText, onSend }) {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
        onChange={(e) => onChangeText(e)}
        className="w-full border-2 border-gray-300 rounded-lg h-10 ps-3 pe-10 outline-none"
      />
      <Icon
        icon="mdi:send"
        onClick={onSend}
        className="absolute text-primary cursor-pointer hover:text-blue-500 right-3"
        width="20"
      />
    </div>
  );
}

function EditorInner({ yjs, user, room, onlineUsers, activeUsersList }) {
  const comment = useCommentStore((state) => state.comment);
  const addCommentFromSocket = useCommentStore(
    (state) => state.addCommentFromSocket,
  );
  const socket = getSocket();

  const [typedMessage, setTypedMessage] = useState("");
  const addCommentFromMe = useCommentStore((state) => state.addCommentFromMe);

  const [typingUsers, setTypingUsers] = useState({}); // เก็บรายชื่อคนที่กำลังพิมพ์อยู่ เช่น { "user_1": "Somchai" }
  const isTypingRef = useRef(false); // ใช้จำสถานะตัวเองว่าตอนนี้กำลังพิมพ์อยู่ไหม
  const timeoutRef = useRef(null); // ใช้เก็บเลเซอร์นับเวลาถอยหลังการหยุดพิมพ์


  // check user typing
  useEffect(()=> {
    console.log("typingUsers", typingUsers)
  }, [typingUsers])

  // auto scroll
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comment, typingUsers]);

  // send comment
  const handleSend = () => {
    if (!typedMessage.trim()) return;

    // 🚩 จังหวะกดส่ง: สั่งหยุดพิมพ์ทันที ไม่ต้องรอครบ 2 วินาที
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isTypingRef.current = false;
    socket?.emit("stop_typing");

    addCommentFromMe(typedMessage, room?._id);

    setTypedMessage("");
  };

  const handleTypingChange = (e) => {

    console.log("typing fn is working")
    setTypedMessage(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket?.emit("typing");
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket?.emit("stop_typing");
    }, 5000);
  };

  //event user typing
  useEffect(() => {
    if (!socket) return;

    socket.on("user_typing", ({ userId, username }) => {
      console.log(`user_typing ${userId} and ${username}`);
      setTypingUsers((prev) => ({ ...prev, [userId]: username }));
    });

    socket.on("user_stop_typing", ({ userId }) => {
      console.log("user_stop_typing", {userId});
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    socket.on("received_comment", ({ newComment }) => {
      addCommentFromSocket(newComment);
    });

    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("received_comment");
    };
  }, [room?._id, user?._id]);

  // convert object of user typing to array
  const typingUserNames = Object.values(typingUsers);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
          heading: { levels: [1, 2, 3] },
          bulletList: true,
          orderedList: true,
          blockquote: true,
        }),
        Underline,
        Collaboration.configure({
          document: yjs.ydoc,
          field: "content", // 🚩 ปรับให้ชื่อฟิลด์โครงสร้างตรงกับโมเดลเบหลังบ้าน
        }),
        CollaborationCursor.configure({
          provider: yjs.provider,
          user: {
            name: user?.username || "Guest",
            color: user?.avatar || "#4893e8",
          },
          render(user) {
            const cursor = document.createElement("span");
            cursor.classList.add("collab-cursor");
            cursor.style.borderColor = user.color;

            const label = document.createElement("div");
            label.classList.add("collab-cursor-label");
            label.style.backgroundColor = user.color;

            const dot = document.createElement("span");
            dot.classList.add("collab-cursor-dot");

            label.appendChild(dot);
            label.appendChild(document.createTextNode(user.name));
            cursor.appendChild(label);
            return cursor;
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "prose max-w-none focus:outline-none",
        },
      },
    },
    [yjs],
  );

  if (!editor) return null;

  return (
    <div className="w-full h-full sm:p-0 sm:pt-0 overflow-y-auto">
      <div className="">
        <div className="w-full flex items-center justify-between p-5 px-8 bg-third border-b-2 border-gray-200">
          <div className="text-2xl font-semibold">{room?.name || ""}</div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-1 my-4 -space-x-4">
              {activeUsersList?.slice(0, 5).map((member) => (
                <div
                  key={member._id}
                  style={{ borderColor: member?.avatar }}
                  className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Icon
                    icon="mdi:account"
                    style={{ color: member?.avatar }}
                    width="30"
                  />
                </div>
              ))}
              {activeUsersList?.length > 5 && (
                <div className="flex-none bg-gray-200 border-2 border-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 z-0">
                  +{activeUsersList.length - 5}
                </div>
              )}
            </div>
            <button className="bg-primary cursor-pointer hover:bg-blue-500 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-sm font-semibold text-white">
              <Icon icon="mdi:share" width="20" />
              Share
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-1 rounded-lg text-secondary">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              {onlineUsers || 1} online
            </div>
          </div>
        </div>
        {/* toolbar */}
        <div className="flex justify-center">
          <div className="w-full min-w-100 max-w-260 ">
            <div className="w-250 top-0 py-5 gap-3">
              <div className="w-full flex py-3 px-3 rounded-md shadow-sm bg-gray-100 border border-slate-200">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive("bold") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  title="Bold (Ctrl+B)"
                >
                  <Icon icon="mdi:format-bold" width="20" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive("italic") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  title="Italic (Ctrl+I)"
                >
                  <Icon icon="mdi:format-italic" width="20" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive("underline") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  title="Underline (Ctrl+U)"
                >
                  <Icon icon="mdi:format-underline" width="20" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive("strike") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  title="Strikethrough"
                >
                  <Icon icon="mdi:format-strikethrough-variant" width="20" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive("code") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  title="Inline Code"
                >
                  <Icon icon="mdi:code-tags" width="20" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" /> {/* เส้นคั่น */}
                {/* --- Group 2: Headings --- */}
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={`p-2 rounded font-bold ${editor.isActive("heading", { level: 1 }) ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                >
                  H1
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={`p-2 rounded font-bold ${editor.isActive("heading", { level: 2 }) ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                >
                  H2
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" /> {/* เส้นคั่น */}
                {/* --- Group 3: Lists & Blocks --- */}
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                >
                  <Icon icon="mdi:format-list-bulleted" width="20" />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                >
                  <Icon icon="mdi:format-list-numbered" width="20" />
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                >
                  <Icon icon="mdi:format-quote-close" width="20" />
                </button>
                <div className="flex-1 " /> {/* ดันปุ่มที่เหลือไปทางขวา */}
                {/* --- Group 4: Clear Formatting --- */}
                <button
                  onClick={() =>
                    editor.chain().focus().unsetAllMarks().clearNodes().run()
                  }
                  className="p-2 rounded hover:bg-red-100 text-red-400"
                  title="Clear Formatting"
                >
                  <Icon icon="mdi:format-clear" width="20" />
                </button>
              </div>
            </div>
            <div className="w-fit overflow-auto no-scrollbar h-fit max-h-150">
              <EditorContent
                editor={editor}
                className="border border-slate-300 w-250 h-300"
              />
            </div>
          </div>

          <div className="sticky z-0 top-0 w-70 h-fit">
            <div className="flex flex-col pt-4">
              <span className="flex items-center gap-2 font-semibold">
                Comments <Icon icon="mdi:comment" className="" />
              </span>
              <div className="flex flex-col border-gray-300 border-2 rounded-lg w-full h-130 my-4 p-5 overflow-auto no-scrollbar">
                {(comment?.comments || comment || []).map((c) => {
                  const isMe = c?.sender?._id === user?._id;

                  return (
                    <div
                      key={c?._id || Math.random()}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] border border-gray-200 px-5 py-2 my-3 rounded-xl shadow-sm ${
                          isMe
                            ? "bg-blue-50/60 border-blue-200 rounded-tr-none"
                            : "bg-white rounded-tl-none"
                        }`}
                      >
                        <div
                          className={`flex gap-2 items-center mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            style={{ borderColor: c?.sender?.avatar }}
                            className="flex-none border-2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer bg-white"
                          >
                            <Icon
                              icon="mdi:account"
                              color={c?.sender?.avatar}
                              width="30"
                            />
                          </div>

                          <div
                            className={`flex flex-col leading-tight ${isMe ? "items-end" : "items-start"}`}
                          >
                            <span className="font-bold text-sm text-slate-800">
                              {isMe ? "You" : c?.sender?.username}
                            </span>
                            <span className="font-normal text-[10px] text-gray-400">
                              {formatChatTime(c.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{ borderColor: c?.sender?.avatar }}
                          className={`py-2 px-4 text-sm text-slate-700 whitespace-pre-wrap wrap-break-word ${
                            isMe
                              ? "border-e-2 me-1 text-right"
                              : "border-s-2 ms-1"
                          }`}
                        >
                          {c.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="h-6 text-sm text-gray-500 italic px-2 rounded-md bg-gray-100">
                  {typingUserNames.length > 0 && (
                    <span className="">
                      {typingUserNames.join(", ")}{" "}
                      {typingUserNames.length === 1 ? "is" : "are"} typing...
                    </span>
                  )}
                </div>
                <div ref={messagesEndRef} />{" "}
                {/* จุดปักหมุดสำหรับ Auto Scroll */}
              </div>
              <div className="flex flex-col justify-center relative">
                <ChatInput
                  value={typedMessage}
                  onChangeText={handleTypingChange}
                  onSend={handleSend}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
