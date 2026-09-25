import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import image_hero from "../assets/image_hero.png";
import ForgotPasswordModal from "../components/forgotPasswordModal.jsx";
import ResetPasswordModal from "../components/resetPasswordModal.jsx";
import useAuthStore from "../store/useAuthStore.js";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

function Login() {
  const navigate = useNavigate();
  const { token, email } = useParams();
  const [isOpenForgotPasswordModal, setIsOpenForgotPasswordModal] =
    useState(false);
  const [isOpenResetPasswordModal, setIsOpenResetPasswordModal] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (token && email) {
      setIsOpenResetPasswordModal(true);
    }
  }, [token, email]);

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
      navigate("/notes-together/explore");
    } else {
      alert(result?.message || "Login failed");
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex w-full justify-center bg-third pt-15 lg:pt-0">
      <div className="max-w-300 w-full flex justify-center items-center px-10 min-[400px]:px-15">
        <div className="flex flex-col lg:flex-row px-10 lg:gap-10 md:p-10  items-center justify-center rounded-xl">
          <div className="max-[400px]:hidden">
            <img src={image_hero} alt="" className="w-80 md:w-110" />
          </div>
          <div className="text-center pt-5 md:p-10 w-full md:w-100">
            <img src="/logo.svg" alt="" className=" " />
            <div className="relative gap-2 mt-5 md:mt-8 flex items-center w-full">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                placeholder="Email"
                className="font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray-300 rounded-lg w-full"
              />
              <Icon
                icon="mdi:email"
                width="20"
                className="text-gray-300 absolute left-3"
              />
            </div>
            <div className="relative gap-2 mt-5 mb-3 flex items-center w-full ">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
                value={formData.password}
                placeholder="Password"
                className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray-300 rounded-lg w-full"
              />
              <Icon
                icon="mdi:key"
                width="20"
                className="text-gray-300 absolute left-3"
              />
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                onClick={handleShowPassword}
                width="20"
                className="text-gray-300 absolute right-3 cursor-pointer"
              />
            </div>
            <span
              onClick={() => setIsOpenForgotPasswordModal(true)}
              className="text-start block w-fit transition-colors font-semibold text-primary hover:text-blue-500 mb-4 cursor-pointer"
            >
              Forgot password?
            </span>
            <ForgotPasswordModal
              isOpen={isOpenForgotPasswordModal}
              onClose={() => setIsOpenForgotPasswordModal(false)}
            />
            <ResetPasswordModal
              isOpen={isOpenResetPasswordModal}
              onClose={() => setIsOpenResetPasswordModal(false)}
              token={token}
              email={email}
            />
            <button
              onClick={(e) => {
                handleSubmit(e);
              }}
              className="button-primary w-full py-2 mb-2 rounded-lg font-medium hover:scale-105 transition-transform cursor-pointer"
            >
              Login
            </button>
            <span className="font-semibold mt-4 block text-gray">or</span>
            <GoogleAuthButton />

            <span className="mt-8 block text-gray font-semibold">
              Don't have an account?
              <Link to="/sign-up" className="text-primary">
                &nbsp; Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
