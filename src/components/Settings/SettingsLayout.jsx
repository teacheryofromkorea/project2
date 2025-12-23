import { NavLink, Outlet } from "react-router-dom";

export default function SettingsLayout() {
  const tabs = [
    { label: "🧑‍🎓 학생 명단", path: "students" },
    { label: "⏰ 시간표 설정", path: "timetable" },
    { label: "🪑 자리 배치", path: "seating" },
    { label: "⚙️ 일반 설정", path: "general" },
  ];

  return (
    <div className="w-full h-[85vh] flex flex-col gap-6 p-8 backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-xl">
      {/* 탭 네비게이션 */}
<div className="w-full flex justify-center">
  <div className="w-full max-w-xl mx-auto 
                  backdrop-blur-xl bg-white/20 border border-white/30 
                  rounded-full shadow-xl p-4 flex items-center gap-2 h-9 bg-gradient-to-r from-white/30 via-purple-100/20 to-white/30 transition-all duration-500">

    {tabs.map((tab) => (
      <NavLink
        key={tab.path}
        to={tab.path}
        className={({ isActive }) =>
          `flex-1 text-center transition rounded-full px-4 py-2 font-medium text-sm ${
            isActive
              ? "bg-white border border-white/60 shadow-lg text-gray-900 backdrop-blur-xl transform transition-all duration-300 scale-[1.02] bg-gradient-to-r from-white to-purple-50"
              : "bg-white/10 border border-white/20 text-gray-700 hover:bg-white/20 backdrop-blur-md hover:scale-[1.01] transition-all duration-300"
          }`
        }
        end
      >
        {tab.label}
      </NavLink>
    ))}
  </div>
</div>

      {/* 실제 페이지 내용 */}
      <div className="flex-1 min-h-0 backdrop-blur-xl bg-white/30 border border-white/30 rounded-3xl shadow-xl p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}