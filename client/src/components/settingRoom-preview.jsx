import { Icon } from "@iconify/react";

function SettingRoomPreview({ roomData }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <span className="text-lg font-bold text-red-500 uppercase tracking-wider">
        Live Preview
      </span>
      <div className="w-full max-w-70 bg-white shadow-lg p-5 rounded-2xl border border-gray-100 flex flex-col pointer-events-none select-none">
        <div className="flex items-center justify-between mb-3">
          <Icon
            icon="mdi:folder"
            width="45"
            style={{ color: roomData?.color || "#cbd5e1" }}
          />
          <div className="flex items-center gap-1.5">
            {roomData?.isPrivate && (
              <Icon icon="mdi:lock" className="text-slate-700" width={18} />
            )}
            <Icon
              icon="mdi:dots-horizontal"
              width="28"
              className="text-gray-400"
            />
          </div>
        </div>

        <span className="text-xl font-bold text-slate-800 truncate">
          {roomData?.name || "Room Name"}
        </span>

        <p className="text-slate-500 mt-1 text-sm wrap-break-word line-clamp-2 h-10">
          {roomData?.description || "No description provided."}
        </p>

        <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-3">
          {roomData?.isPeopleJoinRoom && (
            <div className="flex items-center -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center relative z-10"
                >
                  <Icon
                    icon="mdi:account"
                    className="text-gray-400"
                    width="20"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              {roomData?.isOnlineStatus && (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>2 online</span>
                </>
              )}
            </span>
            <span>{roomData?.isLastEditTime && "edited 5 min ago"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingRoomPreview;
