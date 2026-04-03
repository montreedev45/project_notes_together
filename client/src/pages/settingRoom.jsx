import { Icon } from "@iconify/react";
function SettingRoom() {
  return (
    <>
      <div className="p-12 pt-8 pb-0">
        <span className="flex  items-center gap-2 font-bold text-3xl "><Icon icon="ooui:arrow-previous-ltr" width="28" height="28" />Room Setting</span>
        <div className="bg-gray-200 mt-5 h-140 overflow-auto rounded-2xl p-6 grid grid-cols-5 grid-rows-auto gap-9 place-items-center">
            test
        </div>
      </div>
    </>
  );
}

export default SettingRoom;
