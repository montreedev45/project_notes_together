import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import api from "../services/api.js";
import image_hero from "../assets/image_hero.png";
import Editor from "../components/editor.jsx";

function Login() {

  return (
    <div className="w-full mt-22 flex justify-center bg-third">
      <div className="max-w-300 w-full flex justify-between items-center px-20 mt-16 mb-20">
        <div className="p-10">
          <img src={image_hero} alt="" className="w-130" />
        </div>
        <div className="flex flex-col p-10 my-10 items-center bg-white rounded-lg shadow-2xl">
          <img src="/logo.svg" alt="" className="w-70" />
          <div className="relative gap-2 mt-8 flex items-center w-full ">
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
          <div className="relative gap-2 mt-5 mb-3 flex items-center w-full ">
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
          <span className="text-end w-full font-semibold text-primary mb-4 cursor-pointer">
            Forgot password?
          </span>
          <button className="button-primary w-full py-2 rounded-lg font-medium hover:scale-105 transition-transform cursor-pointer">
            Login
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
            Don't have an account? <Link to="/sign-up" className="text-primary">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
