import { Icon } from "@iconify/react";
import useAuthStore from "../store/useAuthStore";
import usePlanStore from "../store/usePlanStore";
import { useOutletContext } from "react-router-dom";
import ConfirmModal from "./confirmModal";
import toast from "react-hot-toast";
import { useState } from "react";

function SettingAccountPlan() {
  const plans = useOutletContext();
  const user = useAuthStore((state) => state.user);
  const upgradePlan = usePlanStore((state) => state.upgradePlan);
  const plansReverse = [...plans].reverse();

  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestChangePlan = (planId, planName) => {
    setSelectedPlan({planId, planName})
    setIsConfirmModal(true);
  };

  const executeChangePlan = async () => {
    if (!selectedPlan) return; // ป้องกันบั๊กกรณีข้อมูลเป้าหมายหายไป

    setIsLoading(true);
    const toastId = toast.loading("Updating plan...");
    try {
      const res = await upgradePlan(selectedPlan?.planId)

      if (res.success) {
        toast.success("Updated plan successfully", { id: toastId });
        setIsConfirmModal(false);
        setSelectedPlan(null);
      } else {
        toast.error(res.message || "Update plan failed", { id: toastId });
        setIsConfirmModal(false);
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsConfirmModal(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <div className="p-4 md:p-8 flex flex-col w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8  w-full max-w-6xl mx-auto place-items-center py-8">
          {plansReverse.map((p) => (
            <div
              key={p._id}
              className="flex flex-col p-6 lg:p-8 w-full max-w-sm bg-white rounded-2xl shadow-lg border-2 border-slate-100 hover:border-primary hover:scale-[1.02] transition-all cursor-default"
            >
              <div>
                <span className="inline-block py-1 px-4 rounded-lg font-medium text-white bg-primary text-sm">
                  {p.plan}
                </span>
                <span className="block py-5 font-bold text-3xl md:text-4xl text-slate-800">
                  ${p.price}{" "}
                  <span className="text-lg text-slate-500 font-medium">
                    / month
                  </span>
                </span>
              </div>

              <button
                onClick={() => handleRequestChangePlan(p._id, p.plan)}
                disabled={user.plan === p.plan}
                className={`mt-2 mb-6 py-3 rounded-xl font-semibold w-full text-center transition-all ${
                  user.plan === p.plan
                    ? "bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-blue-600 hover:shadow-md active:scale-95 cursor-pointer"
                }`}
              >
                {user.plan === p.plan ? "Your Current Plan" : "Get Started"}
              </button>

              <div className="flex flex-col gap-4 pt-5 border-t border-gray-100 flex-1">
                {p.description.map((d, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Icon
                      icon="fluent-emoji-high-contrast:check-mark"
                      className="text-primary shrink-0 mt-0.5"
                      width="20"
                      height="20"
                    />
                    <span className="font-medium text-slate-600 leading-relaxed text-sm">
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmModal}
        onClose={handleCloseModal}
        onConfirm={executeChangePlan}
        title="Confirm Change Plan"
        message={`Are you sure you want to change your plan to ${selectedPlan?.planName}?`}
        isLoading={isLoading}
      />
    </>
  );
}

export default SettingAccountPlan;
