import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { createYjs } from "../lib/yjs";

const getUserColor = (name = "guest") => {
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];
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
        <div className="animate-pulse text-slate-400 font-medium">Connecting to sync server...</div>
      </div>
    );
  }

  return <EditorInner key={roomId} yjs={yjs} user={user} />;
}

function EditorInner({ yjs, user }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
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
        class: "prose prose-slate bg-white shadow-xl border border-slate-200 rounded-lg mx-auto",
      },
    },
  }, [yjs]);

  if (!editor) return null;

  return (
    <div className="w-full h-full bg-slate-50 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar จำลอง (ตกแต่งเพิ่มได้ที่นี่) */}
        <div className="mb-4 flex items-center justify-between px-4 py-2 bg-white rounded-md shadow-sm border border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            Live Syncing
          </div>
          <div>Room: <span className="font-mono text-indigo-600">{yjs.ydoc.guid.slice(0, 8)}</span></div>
        </div>

        {/* Editor Area */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default Editor;