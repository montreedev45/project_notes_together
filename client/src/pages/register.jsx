import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import image_hero from "../assets/image_hero.png";
import useAuthStore from "../store/useAuthStore.js";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const register = useAuthStore((state) => state.register);

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
      navigate("/notes-together/explore");
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
      <div className="min-h-screen flex w-full justify-center bg-third pt-15 lg:pt-0">
        <div className="max-w-300 w-full flex justify-center items-center px-10 min-[400px]:px-15">
          <div className="flex flex-col lg:flex-row px-10 lg:gap-10 md:p-10  items-center justify-center rounded-xl">
            <div className="max-[400px]:hidden">
              <img src={image_hero} alt="" className="w-80 md:w-110" />
            </div>
            <div className="text-center pt-5 md:p-10 w-full md:w-100">
              <img src="/logo.svg" alt="" className="w-80 md:w-110" />
              <div className="relative gap-2 mt-8 flex items-center w-full ">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray-300 rounded-lg w-full"
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
                  className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray-300 rounded-lg w-full"
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

              <div className="relative gap-2 mt-5 mb-5 flex items-center w-full ">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className=" font-normal ps-10 py-2 text-gray-400 outline-0 border-2 border-gray-300 rounded-lg w-full"
                />
                <Icon
                  icon="mdi:key"
                  width="20"
                  className="text-gray absolute left-3"
                />
                <Icon
                  onClick={handleShowConfirmPassword}
                  icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                  width="20"
                  className="text-gray absolute right-3 cursor-pointer"
                />
              </div>

              <button
                onClick={(e) => {
                  handleSubmit(e);
                }}
                className="button-primary w-full py-2 mb-2 rounded-lg font-medium hover:scale-105 transition-transform cursor-pointer"
              >
                Register
              </button>
              <span className="font-semibold mt-4 block text-gray">or</span>
              <GoogleAuthButton />

              <span className="mt-8 block text-gray font-semibold">
                Already have an account?
                <Link to="/login" className="text-primary">
                  &nbsp; Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
