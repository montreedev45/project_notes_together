import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRoomStore from "../store/useRoomStore";

function JoinLink() {
  const joinLink = useRoomStore((state) => state.joinLink);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const { shareLinkToken, role } = useParams();
  const navigate = useNavigate();
  const hasJoin = useRef(false);

  useEffect(() => {
    const executeJoin = async () => {
      if (shareLinkToken && role && !hasJoin.current) {
        hasJoin.current = true;

        try {
          const res = await joinLink(shareLinkToken, role);
          if (res.success === true && res.data?._id) {
            setStatus("success");
            navigate(`/notes-together/${res.data._id}/${role}`, {
              replace: true,
            });
          } else {
            setErrorMsg(res?.message)
            setStatus(res?.status);
          }
        } catch (error) {
          setStatus("error");
        }
      }
    };

    executeJoin();
  }, [shareLinkToken, role, joinLink, navigate]);

  if (status === 403 || status === "403") {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <h1 className="text-lg font-semibold text-red-500">
          <p>{errorMsg ?? "Access to the room has been denied."}</p>
        </h1>
        <button
          onClick={() => navigate("/notes-together/explore")}
          className="btn btn-outline cursor-pointer"
        >
          return home
        </button>
      </div>
    );
  }

  if (status === "error" || status === 404 || status === "404") {
    console.log("status", status);
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-gray-600">
          An error occurred. The room or sharing link you are looking for was not found.
        </p>
        <button
          onClick={() => navigate("/notes-together/explore")}
          className="btn btn-outline btn-sm"
        >
          return home
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg mb-4 text-blue-500"></span>
        <p className="animate-pulse text-gray-500">
          going to the room...
        </p>
      </div>
    </div>
  );
}

export default JoinLink;