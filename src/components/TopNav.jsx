import { useNavigate, useLocation } from "react-router-dom";

function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 탭 목록 + 라우팅 매핑
  const tabs = [
    { label: "등교", path: "/attendance" },
    { label: "쉬는시간", path: "/break" },
    { label: "점심", path: "/lunch" },
    { label: "수업", path: "/class" },
    { label: "하교", path: "/end" },
    { label: "능력치", path: "/stats" },
    { label: "현황", path: "/overview" },
    { label: "도구", path: "/tools" },
    { label: "설정", path: "/settings/students" }
  ];

  // 현재 URL 과 매칭되는지 확인
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="bg-white/60 backdrop-blur border-b border-white/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                isActive(tab.path)
                  ? "bg-pink-500 text-white shadow"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center rounded-full bg-purple-600 text-white px-3 py-1 text-xs font-semibold">
            필수 세팅 가이드
          </span>
          <div className="text-gray-700 text-xs">11:39</div>
        </div>

      </div>
    </header>
  );
}

export default TopNav;