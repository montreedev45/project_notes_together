import { Icon } from "@iconify/react";

function SettingRoomPreview({ roomData }) {
  return (
    <div className="border-s-2 border-gray pt-9 ps-5 flex flex-col justify-start items-center gap-4">
      <span className="text-2xl font-semibold mb-2 rounded-lg">preview</span>
      <div className="w-55 bg-white shadow-md p-3 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <Icon
            icon="mdi:folder"
            width="50"
            style={{ color: roomData?.color }}
          />
          <div className="relative">
            <Icon icon="mdi:menu" width="30" className="text-secondary" />
          </div>
        </div>
        <span className="text-2xl font-semibold">{roomData?.name}</span>
        <p className="text-secondary text-sm font-medium">
          {roomData?.description}
        </p>
        <div className="flex items-center gap-1 my-4">
          {roomData?.isPeopleJoinRoom && (
            <>
              {roomData?.members?.map((m) => (
                <div
                  key={m?.user?._id}
                  style={{ borderColor: m?.user?.avatar }}
                  className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Icon
                    icon="mdi:account"
                    style={{ color: m?.user?.avatar }}
                    width="30"
                  />
                </div>
              ))}
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-secondary text-sm">
            {roomData?.isOnlineStatus && (
              <>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>{" "}
                <span>2 online</span>
              </>
            )}
          </span>
          <span className="text-sm text-secondary">
            {roomData?.isLastEditTime && (
              <>
                <span>edited 5 min ago</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SettingRoomPreview;
