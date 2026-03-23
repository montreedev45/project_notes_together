import { useEffect, useState } from "react";
import api from "../services/api.js";

function Profile() {
  const [profiledata, setProfiledata] = useState(null);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await api.get("/user/profile");
        setProfiledata(res.data.user);
        alert("fetch success");
      } catch (error) {
        alert("fetch error");
      }
    };

    fetchdata();
  }, []);
  return <div>{profiledata?._id}</div>;
}

export default Profile;
