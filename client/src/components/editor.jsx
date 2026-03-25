import { useState, useEffect } from "react";
import { useEditor, EditorContext, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import debounce from "lodash.debounce";
import { getNote, saveNote } from "../services/note";
import socket from "../socket.js";

function Editor({ roomId = "69c132eab358289d365fc24b" }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  let isRemote = false;

  //join room
  useEffect(() => {
    if (!roomId) return;
    socket.emit("join-room", roomId);
  }, [roomId]);

  //send data
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      if (isRemote) return;
      const json = editor.getJSON();

      socket.emit("send-changes", {
        roomId,
        content: json,
      });
    };

    editor.on("update", updateHandler);

    return () => {
      editor.off("update", updateHandler);
    };
  }, [editor, roomId]);

  //receive data
  useEffect(() => {
    if (!editor) return;

    const receiveHandler = (content) => {
      isRemote = true;
      editor.commands.setContent(content, false);
      isRemote = false;
    };

    socket.on("receive-changes", receiveHandler);

    return () => {
      socket.off("receive-changes", receiveHandler);
    };
  }, [editor]);

  //load content
  const fetch_note = async () => {
    const res = await getNote(roomId);
    editor.commands.setContent(res.data.content);
  };

  //auto save
  const save = debounce(async () => {
    const json = editor.getJSON();
    await saveNote(roomId, json);
  }, 2000);

  //cursor system
  editor.on("selectionUpdate", () => {
    const { from, to } = editor.state.selection;

    socket.emit("cursor:update", { roomId, userId, from, to });
  });

  editor.on("cursor:broadcast", (cursor) => {
    //setPosition(cursor)
  });
  useEffect(() => {
    fetch_note();
  }, [editor, roomId]);

  return (
    <div>
      <div className="mb-2 space-x-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default Editor;
