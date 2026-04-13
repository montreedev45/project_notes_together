import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { createYjs } from "../lib/yjs";
import { Icon } from "@iconify/react";
import Underline from "@tiptap/extension-underline";
const getUserColor = (name = "guest") => {
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function Editor({ roomId, user }) {
  const [yjs, setYjs] = useState(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    const instance = createYjs(roomId, (readyYjs) => {
      if (!destroyed) setYjs(readyYjs);
    });
    instanceRef.current = instance;

    return () => {
      destroyed = true;
      setYjs(null);
      setTimeout(() => {
        instance.provider.destroy();
        instance.ydoc.destroy();
      }, 100);
    };
  }, [roomId]);

  if (!yjs) {
    return (
      <div className="flex items-center justify-center min-h-100">
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
          field: "document",
        }),
        CollaborationCursor.configure({
          provider: yjs.provider,
          user: {
            name: user?.username || "Guest",
            color: getUserColor(user?.username),
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
          // ใช้ Tailwind Typography (prose) ร่วมกับสีพื้นหลังที่ต้องการ
          class: "prose prose-slate lg:prose-xl max-w-none focus:outline-none",
        },
      },
    },
    [yjs],
  );

  if (!editor) return null;

  return (
    <div className="w-full h-full bg-slate-50 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* toolbar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-white/90 backdrop-blur-md border-b mb-4 rounded-t-lg shadow-sm">
          {/* --- Group 1: Text Styles (Marks) --- */}
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
          {/* Underline (ต้องลง Extension เพิ่ม) */}
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
        <div className="mb-4 flex items-center justify-between px-4 py-2 bg-white rounded-md shadow-sm border border-slate-200 text-xs text-slate-500">
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

        {/* Editor Area */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default Editor;
