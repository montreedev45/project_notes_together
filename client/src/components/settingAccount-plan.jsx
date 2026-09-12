import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import usePlanStore from "../store/usePlanStore";

function SettingAccountPlan() {
  const user = useAuthStore((state) => state.user);
  const plans = usePlanStore((state) => state.plans);

  const getPlan = usePlanStore((state) => state.getPlan);
  const upgradePlan = usePlanStore((state) => state.upgradePlan);

  const plansReverse = [...plans].reverse();

  useEffect(() => {
    getPlan();
  }, []);

  const handleSelectPlan = (planId, planName) => {
    if (window.confirm(`do you want to change to the ${planName} plan?`)) {
      upgradePlan(planId);
    }
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
                onClick={() => handleSelectPlan(p._id, p.plan)}
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
    </>
  );
}

export default SettingAccountPlan;
