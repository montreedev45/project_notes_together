import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

export const createYjs = (roomId, onReady) => {
  const ydoc = new Y.Doc();

  const provider = new HocuspocusProvider({
    url: "ws://localhost:1234",
    name: roomId,
    document: ydoc,
  });

  provider.on("status", (e) => console.log("status:", e.status));

  // ✅ รอ synced ก่อนค่อย callback
  provider.on("synced", () => {
    console.log("✅ synced");
    onReady({ ydoc, provider });
  });

  provider.on("disconnect", () => console.warn("❌ disconnected"));

  return { ydoc, provider }; // return เพื่อให้ cleanup ได้
};