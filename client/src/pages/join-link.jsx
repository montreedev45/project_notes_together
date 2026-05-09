import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRoomStore from "../store/useRoomStore";

function JoinLink() {
  const joinLink = useRoomStore((state) => state.joinLink);
  const [status, setStatus] = useState("loading"); 
  const { roomId, role } = useParams();
  const navigate = useNavigate();
  const hasJoin = useRef(false);

  useEffect(() => {
    const executeJoin = async () => {
      if (roomId && role && !hasJoin.current) {
        hasJoin.current = true;

        try {
          const res = await joinLink(roomId, role);
          console.log(res)
          
          if (res?.success) {
            setStatus("success");
            navigate(`/notes-together/${roomId}/${role}`);
          } else {
            setStatus(res?.status || "error");
          }
        } catch (error) {
          setStatus("error");
        }
      }
    };

    executeJoin();
  }, [roomId, role, joinLink, navigate]);

  if (status === 403) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <h1 className="text-lg font-semibold text-red-500">Access to the room has been denied.</h1>
        <button onClick={() => navigate("/notes-together/explore")} className="btn btn-outline">กลับหน้าหลัก</button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>เกิดข้อผิดพลาด ไม่พบห้องที่คุณกำลังมองหา</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg mb-4"></span>
        <p className="animate-pulse">กำลังพาท่านเข้าสู่ห้องพัก...</p>
      </div>
    </div>
  );
}

export default JoinLink;