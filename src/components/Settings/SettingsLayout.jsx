import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function SettingsLayout() {
  const tabs = [
    { label: "🧑‍🎓 학생 명단", path: "students", desc: "학생 등록 및 수정" },
    { label: "⏰ 시간표 설정", path: "timetable", desc: "수업 시간 일과표" },
    { label: "🪑 자리 배치", path: "seating", desc: "책상 배치 및 모둠" },
    { label: "⚙️ 일반 설정", path: "general", desc: "앱 테마 및 초기화" },
  ];

  const location = useLocation();

  return (
    <div className="w-full h-[85vh] flex gap-6 p-6 backdrop-blur-3xl bg-white/40 border border-white/40 rounded-[2.5rem] shadow-2xl overflow-hidden">
      {/* 🟢 좌측 사이드바 네비게이션 */}
      <nav className="w-64 flex-none flex flex-col gap-2 p-2 rounded-3xl bg-white/30 border border-white/40 shadow-inner overflow-y-auto">
        <div className="px-4 py-6 mb-2">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">설정</h2>
          <p className="text-sm text-gray-500 font-medium opacity-80 mt-1">Class Routine App</p>
        </div>

        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                ? "bg-white shadow-lg shadow-purple-100/50 text-gray-900 border border-white/60 scale-[1.02]"
                : "text-gray-500 hover:bg-white/40 hover:text-gray-900 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex-1 z-10 ${isActive ? "font-bold" : "font-semibold"}`}>
                  <div className="text-base">{tab.label.split(" ")[0]} <span className="text-sm opacity-90">{tab.label.split(" ").slice(1).join(" ")}</span></div>
                  {/* <div className={`text-[10px] mt-0.5 transition-colors ${isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"}`}>{tab.desc}</div> */}
                </div>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-auto px-4 py-6">
          <div className="text-[10px] text-gray-400 font-medium text-center">
            v1.0.0
          </div>
        </div>
      </nav>

      {/* 🟠 우측 컨텐츠 영역 */}
      <main className="flex-1 bg-white/50 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm overflow-hidden relative group">
        <div className="absolute inset-0 overflow-y-auto p-8 scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
}