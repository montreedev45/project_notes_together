import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

export const createYjs = (roomId, onReady) => {
  const ydoc = new Y.Doc();
  let isFirstSync = true; // 🚩 ใช้ปักธงกั้นประตูไว้

  const provider = new HocuspocusProvider({
    url: "ws://localhost:1234",
    name: roomId,
    document: ydoc,
  });

  provider.on("status", (e) => console.log("Hocuspocus status:", e.status));

  // ✅ รอ synced ก่อนค่อย callback
  provider.on("synced", () => {
    console.log("✅ Hocuspocus Synced");

    // 🚩 ส่ง callback กลับไปหา React เฉพาะรอบแรกที่เปิดห้องเท่านั้น
    if (isFirstSync) {
      onReady({ ydoc, provider });
      isFirstSync = false; // ปิดประตูทันที
    }
  });

  provider.on("disconnect", () => console.warn("❌ Hocuspocus disconnected"));

  return { ydoc, provider }; // return ออกไปเพื่อให้ useEffect ใน React สั่งทำลายล้าง (cleanup) ได้
};