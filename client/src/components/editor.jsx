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

function Editor() {
  const user = useAuthStore((state) => state.user);

  const [yjs, setYjs] = useState(null);

  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const { roomId, role } = useParams();

  useEffect(() => {
    // 🚩 ใช้ท่อ Socket หลักอันเดิมที่มีอยู่แล้ว ห้ามสร้างใหม่ด้วย connectSocket เคลียร์สายซ้ำซ้อน
    const socket = getSocket();

    if (socket && roomId) {
      console.log("📢 Sending join_room for room:", roomId);
      socket.emit("join_room", { roomId, userId: user._id });
    }

    // 🚩 ตอนออกจากหน้า Editor (Cleanup)
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

  return <EditorInner key={roomId} yjs={yjs} user={user} />;
}

function EditorInner({ yjs, user }) {
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
    <div className="w-full h-full bg-slate-50 pt-0 sm:p-8 sm:pt-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* toolbar */}
        <div className="sticky top-0 z-20 flex px-4 py-4 gap-3 flex-col items-center  bg-white/90 backdrop-blur-md mb-6 rounded-t-lg shadow-sm">
          {/* --- Group 1: Text Styles (Marks) --- */}
          <div className=" w-full flex items-center justify-between px-4 py-2  rounded-md shadow-sm border border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              Live Syncing
            </div>
            <div>
              Room:{" "}
              <span className="font-mono text-indigo-600">
                {yjs.ydoc.guid.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className=" w-full flex py-3 px-3 rounded-md shadow-sm border border-slate-200">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 rounded transition-colors ${editor.isActive("bold") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
              title="Bold (Ctrl+B)"
            >
              <Icon icon="mdi:format-bold" width="20" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 rounded transition-colors ${editor.isActive("italic") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
              title="Italic (Ctrl+I)"
            >
              <Icon icon="mdi:format-italic" width="20" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded transition-colors ${editor.isActive("underline") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
              title="Underline (Ctrl+U)"
            >
              <Icon icon="mdi:format-underline" width="20" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded transition-colors ${editor.isActive("strike") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
              title="Strikethrough"
            >
              <Icon icon="mdi:format-strikethrough-variant" width="20" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded transition-colors ${editor.isActive("code") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
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
              className={`p-2 rounded font-bold ${editor.isActive("heading", { level: 1 }) ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
            >
              H1
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`p-2 rounded font-bold ${editor.isActive("heading", { level: 2 }) ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
            >
              H2
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" /> {/* เส้นคั่น */}
            {/* --- Group 3: Lists & Blocks --- */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
            >
              <Icon icon="mdi:format-list-bulleted" width="20" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
            >
              <Icon icon="mdi:format-list-numbered" width="20" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-slate-200 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
            >
              <Icon icon="mdi:format-quote-close" width="20" />
            </button>
            <div className="flex-1 " /> {/* ดันปุ่มที่เหลือไปทางขวา */}
            {/* --- Group 4: Clear Formatting --- */}
            <button
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
              className="p-2 rounded hover:bg-red-50 text-red-400"
              title="Clear Formatting"
            >
              <Icon icon="mdi:format-clear" width="20" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <EditorContent editor={editor} className=" border border-slate-300" />
      </div>
    </div>
  );
}

export default Editor;
