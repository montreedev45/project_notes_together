import { Icon } from "@iconify/react";
import { useState, useEffect, useMemo } from "react";
import RoomCard from "../components/roomCard";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function Recent() {
  const user = useAuthStore((state) => state.user);
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  // const [recentRoomsState, setRecentRoomsState] = useState([]);

  const [isSorting, setIsSorting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getRecentRooms = useRoomStore((state) => state.getRecentRooms);
  const recentRooms = useRoomStore((state) => state.recentRooms);
  const clearRecentRooms = useRoomStore((state) => state.clearRecentRooms);

  //initial load
  // useEffect(() => {
  //   const data = JSON.parse(localStorage.getItem("recent-rooms") || "[]");
  //   setRecentRoomsState(data);
  // }, []);

  const sortedRooms = useMemo(() => {
    // เช็คว่า rooms มีค่าและเป็น Array หรือไม่ ถ้าไม่ใช่ให้ส่ง Array ว่างกลับไป
    if (!Array.isArray(recentRooms)) return [];

    const result = [...recentRooms];
    return isSorting ? result.reverse() : result;
  }, [recentRooms, isSorting]);

  // filter
  const handleFilter = (e) => {
    const criteria = e.currentTarget.name;
    setActiveFilter(criteria);
    getRecentRooms(criteria);
  };

  //search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // ยิง API โดยส่งทั้งค่า Filter ปัจจุบัน และคำค้นหา
      getRecentRooms(activeFilter, searchTerm, user._id);
    }, 500); // รอ 500ms หลังหยุดพิมพ์ถึงจะยิง API

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeFilter]); // ทำงานเมื่อพิมพ์ หรือเมื่อเปลี่ยน Filter


  const deleteRecentRooms = () =>{
    if (window.confirm(`Are you sure you want to delete recent rooms`)){
      clearRecentRooms();
    }
  }

  return (
    <>
      <div className="p-12 pt-8 pb-0">
        <span className="font-bold text-3xl ">Recent</span>
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
          <Icon
            onClick={() => setIsOpenFilterModal(!isOpenFilterModal)}
            icon="mdi:filter"
            width="30"
            className="text-secondary hover:scale-105 transition-transform cursor-pointer"
          />

          {isOpenFilterModal && (
            <div className="relative  -top-6 z-50 select-none">
              <div className="absolute w-32 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white border-l border-t border-slate-200 -rotate-45"></div>
                <ul className="relative z-10 flex flex-col gap-1">
                  <li>
                    <button
                      name="all"
                      onClick={handleFilter}
                      className={`w-full text-left px-4 py-1.5 font-medium rounded-lg text-sm transition-colors ${
                        activeFilter === "all"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-500 hover:bg-gray-200 hover:text-black"
                      }`}
                    >
                      all
                    </button>
                  </li>
                  <li>
                    <button
                      name="owner"
                      onClick={handleFilter}
                      className={`w-full text-left px-4 py-1.5 font-medium rounded-lg text-sm transition-colors ${
                        activeFilter === "owner"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-500 hover:bg-gray-200 hover:text-black"
                      }`}
                    >
                      owner
                    </button>
                  </li>
                  <li>
                    <button
                      name="joined"
                      onClick={handleFilter}
                      className={`w-full text-left px-4 py-1.5 font-medium rounded-lg text-sm transition-colors ${
                        activeFilter === "joined"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-500 hover:bg-gray-200 hover:text-black"
                      }`}
                    >
                      joined
                    </button>
                  </li>
                  <li>
                    <button
                      name="public"
                      onClick={handleFilter}
                      className={`w-full text-left px-4 py-1.5 font-medium rounded-lg text-sm transition-colors ${
                        activeFilter === "public"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-500 hover:bg-gray-200 hover:text-black"
                      }`}
                    >
                      public
                    </button>
                  </li>
                  <li>
                    <button
                      name="private"
                      onClick={handleFilter}
                      className={`w-full text-left px-4 py-1.5 font-medium rounded-lg text-sm transition-colors ${
                        activeFilter === "private"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-500 hover:bg-gray-200 hover:text-black"
                      }`}
                    >
                      private
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
          <div className="flex w-full justify-end ">
            <button onClick={deleteRecentRooms} className="bg-red text-white font-medium hover:bg-red-400 cursor-pointer transition-all py-2 px-4 gap-2 flex justify-center items-center rounded-md">
              <Icon icon="mdi:trash" width="24" />
              Clear Rooms
            </button>
          </div>
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

export default Recent;
