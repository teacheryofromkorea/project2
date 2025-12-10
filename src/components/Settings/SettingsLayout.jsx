import { NavLink, Outlet } from "react-router-dom";

export default function SettingsLayout() {
  const tabs = [
    { label: "학생 명단", path: "students" },
    { label: "시간표 설정", path: "timetable" },
    { label: "일반 설정", path: "general" },
  ];

  return (
    <div className="p-6 w-full h-full flex flex-col gap-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-3 border-b pb-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-t-lg font-semibold ${
                isActive
                  ? "bg-white shadow border"
                  : "bg-gray-200 hover:bg-gray-300"
              }`
            }
            end
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* 실제 페이지 내용 */}
      <div className="flex-1 bg-white rounded-xl shadow p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}