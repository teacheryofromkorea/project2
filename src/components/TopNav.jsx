import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useLock } from "../context/LockContext";
import LockButton from "./LockButton";

function TopNav({ autoSwitchEnabled, onToggleAutoSwitch, onUserNavigate }) {
  const location = useLocation();
  const isStatsPage = location.pathname.startsWith("/stats");
  const { locked } = useLock();

  const tabs = useMemo(
    () => [
      { label: "등교", path: "/attendance" },
      { label: "쉬는시간", path: "/break" },
      { label: "점심", path: "/lunch" },
      { label: "수업", path: "/class" },
      { label: "하교", path: "/end" },
      { label: "능력치", path: "/stats" },
      { label: "현황", path: "/overview" },
      { label: "도구", path: "/tools" },
      { label: "설정", path: "/settings/students" }
    ],
    []
  );

  // 현재 URL 과 매칭되는지 확인
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header
      className={
        isStatsPage
          ? "bg-white/60 backdrop-blur-md border-b border-white/40"
          : "bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      }
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              type="button" // ⛔ submit 방지
              key={tab.path}
              onClick={() => {
                if (locked) return;
                onUserNavigate(tab.path);
              }}
              disabled={locked}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${locked
                  ? "text-gray-400 cursor-not-allowed"
                  : isActive(tab.path)
                    ? "bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">

          <LockButton />

          {/* 자동 탭 전환 스위치 */}
          <div className="flex items-center gap-2">
            <span className={isStatsPage ? "text-xs text-gray-300" : "text-xs text-gray-600"}>
              자동 전환
            </span>
            <button
              type="button" // ⛔ submit 방지
              onClick={onToggleAutoSwitch}
              className={`relative w-10 h-5 rounded-full transition ${autoSwitchEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${autoSwitchEnabled ? "left-5" : "left-0.5"
                  }`}
              />
            </button>
          </div>

          <span
            className={
              isStatsPage
                ? "inline-flex items-center rounded-full bg-purple-700/80 text-white px-3 py-1 text-xs font-semibold"
                : "inline-flex items-center rounded-full bg-purple-600 text-white px-3 py-1 text-xs font-semibold"
            }
          >
            필수 세팅 가이드
          </span>
          <div className={isStatsPage ? "text-gray-300 text-xs" : "text-gray-700 text-xs"}>
            11:39
          </div>
        </div>

      </div>
    </header>
  );
}

export default TopNav;