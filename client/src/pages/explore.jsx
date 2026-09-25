import { Icon } from "@iconify/react";
import { useState, useEffect, useMemo } from "react";
import CreateRoomModal from "../components/createRoomModal";
import JoinRoomModal from "../components/joinRoomModal";
import RoomCard from "../components/roomCard";
import useRoomStore from "../store/useRoomStore";

function Explore() {
  const [isOpenCreateRoomModal, setIsOpenCreateRoomModal] = useState(false);
  const [isOpenJoinRoomModal, setIsOpenJoinRoomModal] = useState(false);
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getAllRooms = useRoomStore((state) => state.getAllRooms);
  const rooms = useRoomStore((state) => state.rooms);

  const sortedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    const result = [...rooms];
    return isSorting ? result.reverse() : result;
  }, [rooms, isSorting]);

  const handleFilter = (e) => {
    setActiveFilter(e.currentTarget.name);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getAllRooms(activeFilter, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeFilter, getAllRooms]);

  return (
    <div className="p-4 md:p-8 lg:p-12 pb-0 flex flex-col h-full">
      <span className="font-bold text-2xl lg:text-3xl block text-slate-800">
        Explore
      </span>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsOpenCreateRoomModal(true)}
            className="button-primary flex-1 lg:flex-none flex justify-center items-center rounded-lg font-semibold hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer py-2 px-4"
          >
            <Icon icon="mdi:plus" width="24" className="md:w-7.5" />
            <span className="ml-1">Create Room</span>
          </button>

          <button
            onClick={() => setIsOpenJoinRoomModal(true)}
            className="button-primary flex-1 lg:flex-none flex justify-center items-center rounded-lg font-semibold bg-third text-secondary hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer border-2 gap-2 py-2 px-4"
          >
            <Icon icon="fa:chain" width="16" className="md:w-5" />
            <span>Join Room</span>
          </button>
        </div>

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
              icon={"mdi:sort"}
              width="30"
              className="text-secondary hover:scale-110 transition-transform cursor-pointer"
            />
          </button>

          <div className="relative">
            <Icon
              onClick={() => setIsOpenFilterModal(!isOpenFilterModal)}
              icon="mdi:filter"
              width="30"
              className="text-secondary hover:scale-110 transition-transform cursor-pointer"
            />

            {isOpenFilterModal && (
              <div className="absolute right-0 top-10 z-50 select-none">
                <div className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg p-2 relative">
                  <div className="absolute right-3 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45"></div>
                  <ul className="relative z-10 flex flex-col gap-1">
                    {["all", "owner", "joined", "public", "private"].map(
                      (filter) => (
                        <li key={filter}>
                          <button
                            name={filter}
                            onClick={(e) => {
                              handleFilter(e);
                              setIsOpenFilterModal(false);
                            }}
                            className={`w-full text-left px-4 py-1.5 font-medium rounded-lg text-sm transition-colors capitalize ${
                              activeFilter === filter
                                ? "bg-blue-100 text-blue-600"
                                : "text-slate-500 hover:bg-gray-100 hover:text-black"
                            }`}
                          >
                            {filter}
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-third mt-6 flex-1 overflow-y-auto no-scrollbar rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start justify-items-center">
        {sortedRooms.map((room) => (
          <RoomCard key={room._id} data={room} />
        ))}
      </div>

      <CreateRoomModal
        isOpen={isOpenCreateRoomModal}
        onClose={() => setIsOpenCreateRoomModal(false)}
      />
      <JoinRoomModal
        isOpen={isOpenJoinRoomModal}
        onClose={() => setIsOpenJoinRoomModal(false)}
      />
    </div>
  );
}

export default Explore;
