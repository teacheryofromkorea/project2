import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 자동 탭 전환 토글 상태 (localStorage 연동)
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(() => {
    return localStorage.getItem("autoTabSwitch") !== "off";
  });

  useEffect(() => {
    localStorage.setItem("autoTabSwitch", autoSwitchEnabled ? "on" : "off");
  }, [autoSwitchEnabled]);

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

          {/* 자동 탭 전환 스위치 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">자동 전환</span>
            <button
              onClick={() => setAutoSwitchEnabled((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition ${
                autoSwitchEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
                  autoSwitchEnabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

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