import { Icon } from "@iconify/react";
import { useState } from "react";
import CreateRoomModal from "../components/createRoomModal";
import JoinRoomModal from "../components/joinRoomModal";
import RoomCard from "../components/roomCard";

function Dashboard() {
  const [isOpenCreateRoomModal, setIsOpenCreateRoomModal] = useState(false);
  const [isOpenJoinRoomModal, setIsOpenJoinRoomModal] = useState(false);
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);

  const is = () => {
    setIsOpenFilterModal(!isOpenFilterModal);
    console.log(isOpenFilterModal);
  };

  const loopTime = Array.from({ length: 15 });

  return (
    <>
      <div className="p-12 pt-8 pb-0">
        <span className="font-bold text-3xl ">My Rooms</span>
        <div className="mt-5 flex items-center gap-5">
          <button
            onClick={() => setIsOpenCreateRoomModal(true)}
            className="button-primary flex items-center rounded-lg font-semibold hover:scale-105 transition-transform cursor-pointer"
          >
            <Icon icon="mdi:plus" width="30" />
            Create Room
          </button>
          <CreateRoomModal
            isOpen={isOpenCreateRoomModal}
            onClose={() => setIsOpenCreateRoomModal(false)}
          />
          <button
            onClick={() => setIsOpenJoinRoomModal(true)}
            className="button-primary flex items-center rounded-lg font-semibold bg-third text-secondary hover:scale-105 transition-transform cursor-pointer border-2 gap-2"
          >
            <Icon icon="fa:chain" width="20" />
            Join Room
          </button>
          <JoinRoomModal
            isOpen={isOpenJoinRoomModal}
            onClose={() => setIsOpenJoinRoomModal(false)}
          />
          <div className="bg-white flex items-center  rounded-xl relative">
            <Icon
              icon="mdi:search"
              width="25"
              height="25"
              className="absolute left-2 text-secondary cursor-pointer"
            />
            <input
              type="text"
              placeholder="Search room or code"
              className="py-2 ps-9 rounded-lg outline-0 font-medium text-secondary border-2 border-secodary w-80"
            />
          </div>
          <Icon
            icon="mdi:sort"
            width="30"
            className="text-secondary hover:scale-105 transition-transform cursor-pointer"
          />
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
                    <button className="w-full text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                      owner
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                      shaered
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                      public
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                      private
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-200 mt-5 h-140 overflow-auto rounded-2xl p-6 grid grid-cols-5 grid-rows-auto gap-9 place-items-center">
          {loopTime.map((_, index) => (
            <RoomCard key={index} index={index} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
