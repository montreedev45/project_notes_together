import { Icon } from "@iconify/react";
function Dashboard() {
  return (
    <>
      <div className="p-5 pt-3">
        <span className="font-bold text-3xl ">My Rooms</span>
        <div className="mt-5 flex items-center gap-5">
          <button className="button-primary flex items-center rounded-lg font-semibold">
            <Icon icon="mdi:plus" width="30" />
            Create Room
          </button>
          <button className="button-primary flex items-center rounded-lg font-semibold bg-third text-secondary border-2 gap-2">
            <Icon icon="fa:chain" width="20" />
            Join Room
          </button>
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
          <Icon icon="mdi:sort" width="30" className="text-secondary" />
          <Icon icon="mdi:filter" width="30" className="text-secondary" />
        </div>
        <div className="bg-gray-200 mt-5 rounded-2xl p-10 grid grid-cols-5 grid-rows-2 gap-15 place-items-center">
          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>

          <div className="w-55 bg-white shadow-2xl p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Icon icon="mdi:folder" width="50" className="text-green" />
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
            </div>
            <span className="text-2xl font-semibold">marketing</span>
            <p className="text-secondary text-sm font-medium">
              discuss about tasking and meeting
            </p>
            <div className="flex items-center gap-1 my-4">
              <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-orange" width="30" />
              </div>
              <span className="text-lg font-semibold text-secondary">+ 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-secondary text-sm">
                <div className="w-3 h-3 rounded-full bg-green-400"></div> 2
                online
              </span>
              <span className="text-sm text-secondary">edited 5 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
