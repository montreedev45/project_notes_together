import { useState } from "react";
import {Link } from "react-router-dom"
import {Icon} from "@iconify/react"
import api from "../services/api.js";
import image_hero from "../assets/image_hero.png"

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      alert("register success");
    } catch (error) {
      alert("register failed");
    }
  };

  return (
    // <div>
    //   <input type="text" onChange={(e) => setUsername(e.target.value)} />
    //   <input type="text" onChange={(e) => setEmail(e.target.value)} />
    //   <input type="text" onChange={(e) => setPassword(e.target.value)} />
    //   <button onClick={handleRegister}>button</button>
    // </div>

    <>
      <div className="w-full mt-22 flex justify-center bg-third">
        <div className="max-w-300 w-full flex justify-between items-center px-20 mt-6 mb-6">
          <div className="p-10 pt-6">
            <img src={image_hero} alt="" className="w-130" />
          </div>
          <div className="flex flex-col p-10 my-10 items-center bg-white rounded-lg shadow-2xl">
            <img src="/logo.svg" alt="" className="w-70" />
            <div className="relative gap-2 mt-8 flex items-center w-full ">
              <input
                type="text"
                placeholder="Username"
                className=" font-medium ps-10 py-2 text-gray outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:user"
                width="20"
                className="text-gray absolute left-3"
              />
            </div>

            <div className="relative gap-2 mt-5 flex items-center w-full ">
              <input
                type="text"
                placeholder="Email"
                className=" font-medium ps-10 py-2 text-gray outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:email"
                width="20"
                className="text-gray absolute left-3"
              />
            </div>
            
            <div className="relative gap-2 mt-5 flex items-center w-full ">
              <input
                type="text"
                placeholder="Password"
                className=" font-medium ps-10 py-2 text-gray outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:key"
                width="20"
                className="text-gray absolute left-3"
              />
              <Icon
                icon="mdi:eye"
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>

            <div className="relative gap-2 mt-5 mb-5 flex items-center w-full ">
              <input
                type="text"
                placeholder="Confirm Password"
                className=" font-medium ps-10 py-2 text-gray outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:key"
                width="20"
                className="text-gray absolute left-3"
              />
              <Icon
                icon="mdi:eye"
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>

            <button className="button-primary w-full py-2 rounded-lg font-medium hover:scale-105 transition-transform cursor-pointer">
              Sign up
            </button>
            <span className="py-4 font-semibold text-secondary">or</span>
            <span className="text-gray font-semibold border-2 rounded-lg border-gray w-full text-center py-2 flex justify-center hover:scale-105 transition-transform cursor-pointer">
              <Icon
                icon="flat-color-icons:google"
                className="me-1"
                width="22"
                height="22"
              />
              Continue with Google
            </span>

            <span className="mt-8 text-gray font-semibold">
              Already have an account? {" "}
              <Link to="/login"className="text-primary">Login</Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
