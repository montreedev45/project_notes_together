import { Icon } from "@iconify/react";
import { useState, useMemo, useEffect } from "react";
import RoomCard from "../components/roomCard";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function Trash() {
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);

  const [isSorting, setIsSorting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getTrashRooms = useRoomStore((state) => state.getTrashRooms);
  const trashRooms = useRoomStore((state) => state.trashRooms);
  const permanentlyDeleteAll = useRoomStore(
    (state) => state.permanentlyDeleteAll,
  );
  const user = useAuthStore((state) => state.user);

  const sortedRooms = useMemo(() => {
    if (!Array.isArray(trashRooms)) return [];

    const result = [...trashRooms];
    return isSorting ? result.reverse() : result;
  }, [trashRooms, isSorting]);

  const handleDeleteAllRoom = () => {
    if (
      window.confirm(
        "Are you sure delete all room? once deleted, it cannot be retore",
      )
    ) {
      permanentlyDeleteAll();
    }
  };

  //initial load
  useEffect(() => {
    if (trashRooms.length === 0) {
      getTrashRooms();
    }
  }, []);

  //search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // ยิง API โดยส่งทั้งค่า Filter ปัจจุบัน และคำค้นหา
      getTrashRooms(searchTerm);
    }, 500); // รอ 500ms หลังหยุดพิมพ์ถึงจะยิง API

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <>
      <div className="p-4 md:p-8 lg:p-12 pb-0 flex flex-col h-full">
        <span className="font-bold text-2xl lg:text-3xl block text-slate-800">
          Trash
        </span>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {sortedRooms.length !== 0 && (
            <div className="flex justify-end items-center px-6 py-2.5 text-xl font-medium rounded-lg bg-red-500 text-white transition-colors">
              <button
                onClick={handleDeleteAllRoom}
                className="flex items-center cursor-pointer "
              >
                <Icon icon="mdi:trash" className="" width="18" />
                <span className="text-sm">Delete All</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="bg-white flex items-center rounded-xl relative grow">
              <Icon
                icon="mdi:search"
                width="24"
                className="absolute left-3 text-secondary cursor-pointer"
              />
              <input
                type="text"
                placeholder="Search room name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2.5 ps-10 pr-4 rounded-lg outline-none font-medium text-secondary border-2 border-gray-300 focus:border-primary w-full lg:max-w-120 transition-colors"
              />
            </div>

            <button
              onClick={() => setIsSorting(!isSorting)}
              title={isSorting ? "Sort by Newest" : "Sort by Oldest"}
            >
              <Icon
                icon={isSorting ? "mdi:sort-descending" : "mdi:sort-ascending"}
                width="30"
                className="text-secondary hover:scale-110 transition-transform cursor-pointer"
              />
            </button>
          </div>
        </div>

        <div className="bg-third mt-6 flex-1 overflow-y-auto no-scrollbar rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start justify-items-center">
          {sortedRooms.map((room) => (
            <RoomCard key={room._id} data={room} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Trash;
