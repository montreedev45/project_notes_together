import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import api from "../services/api.js";
import image_hero from "../assets/image_hero.png";
import useAuthStore from "../store/useAuthStore.js";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username?.trim() ||
      !formData.email?.trim() ||
      !formData.password?.trim() ||
      !formData.confirmPassword?.trim()
    ) {
      return alert("Please fill in all fields completely (no spaces allowed).");
    }

    if (formData.password !== formData.confirmPassword) {
      return alert("Please try again: password is not match");
    }

    const result = await register(formData);
    if (result?.success) {
      navigate("/notes-together/dashboard");
    } else {
      alert(result?.message || "register failed");
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
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
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray rounded-lg w-full"
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:email"
                width="20"
                className="text-gray absolute left-3"
              />
            </div>

            <div className="relative gap-2 mt-5 flex items-center w-full ">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:key"
                width="20"
                className="text-gray absolute left-3"
              />
              <Icon
                onClick={handleShowPassword}
                icon="mdi:eye"
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>

            <div className="relative gap-2 mt-5 mb-5 flex items-center w-full ">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray rounded-lg w-full"
              />
              <Icon
                icon="mdi:key"
                width="20"
                className="text-gray absolute left-3"
              />
              <Icon
                onClick={handleShowConfirmPassword}
                icon="mdi:eye"
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="button-primary w-full py-2 rounded-lg font-medium hover:scale-105 transition-transform cursor-pointer"
            >
              Sign up
            </button>
            <span className="py-3 font-semibold text-secondary">or</span>
            <span className="text-gray font-semibold border-2 rounded-lg border-gray w-full text-center py-2 flex justify-center  hover:scale-105 transition-transform cursor-pointer">
              <Icon
                icon="flat-color-icons:google"
                className="me-1"
                width="22"
                height="22"
              />
              Continue with Google
            </span>

            <span className="mt-8 text-gray font-semibold">
              Already have an account?{" "}
              <Link to="/login" className="text-primary">
                Login
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
