import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import image_hero from "../assets/image_hero.png";
import ForgotPasswordModal from "../components/forgotPasswordModal.jsx";
import useAuthStore from "../store/useAuthStore.js";

function Login() {
  const navigate = useNavigate();
  const [isOpenForgotPasswordModal, setIsOpenForgotPasswordModal] =
    useState(false);
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData);

    if (result?.success) {
      navigate("/notes-together/dashboard");
    } else {
      alert(result?.message || "Login failed");
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
          <div className="relative gap-2 mt-5 mb-3 flex items-center w-full ">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              value={formData.password}
              placeholder="Password"
              className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray rounded-lg w-full"
            />
            <Icon
              icon="mdi:key"
              width="20"
              className="text-gray absolute left-3"
            />
            <Icon
              icon="mdi:eye"
              onClick={handleShowPassword}
              width="20"
              className="text-gray absolute right-3 cursor-pointer"
            />
          </div>
          <span
            onClick={() => setIsOpenForgotPasswordModal(true)}
            className="text-end w-full font-semibold text-primary mb-4 cursor-pointer"
          >
            Forgot password?
          </span>
          <ForgotPasswordModal
            isOpen={isOpenForgotPasswordModal}
            onClose={() => setIsOpenForgotPasswordModal(false)}
          />
          <button
            onClick={handleSubmit}
            className="button-primary w-full py-2 rounded-lg font-medium hover:scale-105 transition-transform cursor-pointer"
          >
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
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-primary">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
