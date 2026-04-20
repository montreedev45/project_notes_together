import { Icon } from "@iconify/react";
import { useState } from "react";

function ChangeEmailModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); //1 is change email step , 2 is confirm code step
  const [otp, setOtp] = useState(new Array(6).fill(""));
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setStep(1);
  };

  const handleFillOtp = (element, index) => {
    if (isNaN(element.value)) return false; // รับเฉพาะตัวเลข

    // อัปเดตค่าใน Array
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Logic: เมื่อพิมพ์เสร็จ ให้เลื่อนไปช่องถัดไปอัตโนมัติ (Auto-focus)
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }

    // เมื่อกรอกครบ 6 ตัว ให้เรียก API ทันที
    if (newOtp.join("").length === 6) {
      alert("api send otp is working");
      //verifyOTP(newOtp.join(""));
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">change email</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-6  text-black">
          {step === 1 ? (
            <>
              <div className="flex gap-5 items-center mx-6 ">
                <input
                  type="text"
                  placeholder="New email"
                  className="flex-1 py-2 outline-none px-4 text-lg rounded-lg border-2 border-gray text-secondary"
                />

                <button
                  onClick={() => setStep(2)}
                  className="cursor-pointer bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Send
                </button>
              </div>
              <div className="p-6 mx-6 my-6  bg-yellow">
                Didn’t receive code? Resend in 30sA verification code will be
                sent to your new email address. Please enter the verification
                code in the field below.
              </div>
            </>
          ) : (
            <>
              <div className="mt-6  text-black">
                <div className="p-6 mx-6 my-6  bg-yellow text-center font-semibold text-lg">
                  <span>Verify identity</span>
                  <div className=" flex items-center justify-center gap-3 mt-5">
                    {otp.map((data, index) => (
                      <>
                        <input
                          key={index}
                          id={`otp-${index}`}
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
                        
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangeEmailModal;
