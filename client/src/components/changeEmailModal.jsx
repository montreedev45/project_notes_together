import { Icon } from "@iconify/react";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import StatusModal from "./statusModal";
import toast from "react-hot-toast";

function ChangeEmailModal({ isOpen, onClose }) {
  const checkDuplicateEmail = useAuthStore(
    (state) => state.checkDuplicateEmail,
  );
  const changeEmail = useAuthStore((state) => state.changeEmail);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const [formData, setFormData] = useState({
    newEmail: "",
    currentPassword: "",
  });

  const handleClose = () => {
    setStep(1);
    setFormData({ newEmail: "", currentPassword: "" });
    setOtp(new Array(6).fill(""));
    setErrorMsg("");
    onClose();
  };

  const submitOtp = async (verifyCode) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        temporalyToken: localStorage.getItem("temporalyToken"), // หมายเหตุ: คำว่า temporary สะกดผิดอยู่ (หาก Backend ใช้คำนี้ ปล่อยไว้ได้ครับ)
        verifyCode,
      };
      const toastId = toast.loading("Changing Email...")
      const res = await changeEmail(payload);

      if (res.success) {
        toast.success("Changed email successful", {id: toastId})
        handleClose(); // ใช้ handleClose ที่เคลียร์ทุกอย่างไว้แล้วได้เลย
      } else {
        toast.remove(toastId)
        //toast.error("Changed email failed", {id: toastId})
        setModalConfig({
          isOpen: true,
          type: "error",
          title: "Change Failed",
          message:
            res.message ||
            "An error occurred while changing the data. Please try again.",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillOtp = async (element, index) => {
    if (isNaN(element.value)) return;

    // อัปเดตค่าใน Array
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus ช่องถัดไป
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }

    // เมื่อกรอกครบ 6 ตัว ให้เรียกฟังก์ชันกลาง
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      await submitOtp(fullOtp);
    }
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    const characters = pasteData.split("");

    characters.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });

    setOtp(newOtp);
    const fullOtp = newOtp.join("");

    const nextIndex = Math.min(characters.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();

    // ถ้าวางแล้วครบ 6 ตัว ให้เรียกฟังก์ชันกลาง
    if (fullOtp.length === 6) {
      await submitOtp(fullOtp);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const toastId = toast.loading("Checking email...")
      const res = await checkDuplicateEmail(formData);

      if (res.success) {
        toast.success("Checked email successful", {id: toastId})
        setStep(2);
      } else {
        toast.error(`${res?.message || "Checked email fail"}`, {id: toastId})
        //setErrorMsg(res?.message);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="select-none fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <div
          className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl ring-1 ring-slate-900/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Change Email</h2>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
              >
                <Icon icon="mdi:close" width="22" className="text-slate-500" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mt-6  text-black">
                {step === 1 ? (
                  <>
                    <div className="flex flex-col gap-5 mx-6 ">
                      <input
                        autoComplete="off"
                        type="email"
                        value={formData.newEmail}
                        onChange={handleChange}
                        name="newEmail"
                        placeholder="New email"
                        className="flex-1 py-2 px-4 text-lg rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white outline-none text-slate-500 transition-colors"
                      />
                      <div className="relative flex items-center">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={handleChange}
                          name="currentPassword"
                          placeholder="Current password"
                          className="flex-1 py-2 px-4 text-lg rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white outline-none text-slate-500 transition-colors"
                        />
                        <Icon
                          icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"}
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          width="20"
                          className="text-gray-300 absolute right-3 cursor-pointer"
                        />
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="w-full py-3 text-lg cursor-pointer button-primary rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-transform"
                        >
                          {isLoading ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                    <div
                      className="p-6 mx-6 my-6  bg-yellow "
                      style={{ userSelect: "none" }}
                    >
                      A verification code will be sent to your new email
                      address. Please enter the verification code in the field
                      below.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-6  text-black">
                      <div className="p-6 mx-6 my-6  bg-yellow text-center font-semibold text-lg">
                        <span>Verify identity</span>
                        <div className=" flex items-center justify-center gap-3 mt-5">
                          {otp.map((data, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              onPaste={index === 0 ? handlePaste : undefined}
                              type="text"
                              maxLength="1"
                              className=" w-10 h-12 border-2 rounded-lg text-center text-xl font-semibold focus:border-blue-500 outline-none"
                              value={data}
                              onChange={(e) => handleFillOtp(e.target, index)}
                              onKeyDown={(e) => {
                                // ถ้ากด Backspace ให้ถอยกลับไปช่องก่อนหน้า
                                if (
                                  e.key === "Backspace" &&
                                  !otp[index] &&
                                  e.target.previousSibling
                                ) {
                                  e.target.previousSibling.focus();
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </>
  );
}

export default ChangeEmailModal;
