import { useEffect } from "react";
import { Outlet, useParams , useNavigate} from "react-router-dom";
import useRoomStore from "../store/useRoomStore";
import SettingRoomSidebar from "../components/settingRoom-sidebar";
import useAuthStore from "../store/useAuthStore";

function SettingRoomLayout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const getMyRooms = useRoomStore((state) => state.getMyRooms);
  const myRooms = useRoomStore((state) => state.myRooms);
  const roomData = myRooms.find((r) => r._id === id);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // รอให้ข้อมูลโหลดเสร็จก่อนค่อยเช็ก
    if (roomData && user) {
      const ownerId = roomData.owner?._id; 
      const userId = user._id;
      const isOwner = ownerId === userId

      if (!isOwner) {
        navigate(`/notes-together/explore`);
      }
    }
  }, [roomData, user, navigate]);

  useEffect(() => {
    getMyRooms();
  }, []);

  return (
    <>
      <div className="p-4 md:p-8 lg:p-12 pb-0 flex flex-col h-full">
        <span className="flex items-center gap-2 font-bold text-2xl md:text-3xl text-slate-800">
          Room Setting
        </span>
        <div className="border-2 border-gray-200 mt-5 rounded-2xl flex flex-col min-[1024px]:flex-row overflow-hidden bg-white min-h-125">
          <SettingRoomSidebar id={id} />
          <div className="flex-1 flex flex-col md:flex-row border-t xl:border-t-0 xl:border-l border-gray-200 ">
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
              <Outlet context={{ roomData, myRooms }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingRoomLayout;
