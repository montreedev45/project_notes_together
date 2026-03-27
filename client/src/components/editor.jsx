import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useParams } from 'react-router-dom';
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"; // ✅ default import
import { createYjs } from "../lib/yjs";

function Editor({roomId, user }) {
  // const {roomId} = useParams();
  const [yjs, setYjs] = useState(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let destroyed = false;

    // createYjs รับ callback เมื่อ synced
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

  if (!yjs) return <div>Connecting...</div>;

  // ✅ key บังคับ remount ทุกครั้งที่ yjs instance ใหม่
  return <EditorInner key={roomId} yjs={yjs} user={user} />;
}
const getUserColor = (name = "david") => {
  const colors = [
    "#639922",
    "#185FA5",
    "#993C1D",
    "#533AB7",
    "#0F6E56",
    "#993556",
    "#854F0B",
    "#A32D2D",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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
          cursor.style.cssText = `
            border-left: 2px solid ${user.color};
            margin-left: -1px;
            margin-right: -1px;
            pointer-events: none;
            position: relative;
            word-break: normal;
          `;
          const label = document.createElement("div");
          label.classList.add("collab-cursor-label");
          label.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: -1px;
            background: ${user.color};
            color: #ffffff;
            font-size: 10px;
            font-weight: 500;
            padding: 1px 12px;
            border-radius: 20px;
            white-space: nowrap;
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 5px;
            font-family: sans-serif;
          `;
          const dot = document.createElement("span");
          dot.style.cssText = `
            width: 6px; height: 6px;
            border-radius: 50%;
            background: rgba(23, 250, 23, 0.9);
          `;
          label.appendChild(dot);
          label.appendChild(document.createTextNode(user.name));
          cursor.appendChild(label);
          return cursor;
        },
      }),
    ],
    editable: true,
  });

  if (!editor) return null;
  return <EditorContent editor={editor} style={{backgroundColor:"#b5ceff", width:"100%"}}/>;
}

export default Editor;
