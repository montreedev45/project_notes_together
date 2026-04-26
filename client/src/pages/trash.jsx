import { Icon } from "@iconify/react";
import { useState, useMemo, useEffect } from "react";
import RoomCard from "../components/roomCard";
import { data } from "react-router-dom";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function Trash() {
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);

  const [isSorting, setIsSorting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getTrashRooms = useRoomStore((state) => state.getTrashRooms);
  const trashRooms = useRoomStore((state) => state.trashRooms);
  const user = useAuthStore((state) => state.user);

  const sortedRooms = useMemo(() => {
    if (!Array.isArray(trashRooms)) return [];

    const result = [...trashRooms];
    return isSorting ? result.reverse() : result;
  }, [trashRooms, isSorting]);

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
      <div className="p-12 pt-8 pb-0">
        <span className="font-bold text-3xl ">Trash</span>
        <div className="mt-5 flex items-center gap-5">
          <div className="bg-white flex items-center  rounded-xl relative">
            <Icon
              icon="mdi:search"
              width="25"
              height="25"
              className="absolute left-2 text-secondary cursor-pointer"
            />
            <input
              type="text"
              placeholder="Search room name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 ps-9 rounded-lg outline-0 font-medium text-secondary border-2 border-secodary w-80"
            />
          </div>
          <button
            onClick={() => setIsSorting(!isSorting)}
            title={isSorting ? "Sort by Newest" : "Sort by Oldest"}
          >
            <Icon
              icon={isSorting ? "mdi:sort-descending" : "mdi:sort-ascending"}
              width="30"
              className="text-secondary hover:scale-105 transition-transform cursor-pointer"
            />
          </button>
        </div>

        <div className="bg-gray-200 mt-5 h-140 overflow-auto rounded-2xl p-6 grid grid-cols-5 grid-rows-auto gap-9 place-items-start">
          {sortedRooms.map((room) => (
            <RoomCard key={room._id} data={room} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Trash;
