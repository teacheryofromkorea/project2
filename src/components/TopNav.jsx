import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useLock } from "../context/LockContext";
import { useAuth } from "../contexts/AuthContext";
import LockButton from "./LockButton";
import { LogOut } from "lucide-react";

function TopNav({ autoSwitchEnabled, onToggleAutoSwitch, onUserNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isStatsPage = location.pathname.startsWith("/stats");
  const { locked } = useLock();
  const { user, signOut } = useAuth();

  const tabs = useMemo(
    () => [
      { label: "등교", path: "/attendance" },
      { label: "휴식", path: "/break" },
      { label: "점심", path: "/lunch" },
      { label: "수업", path: "/class" },
      { label: "하교", path: "/end" },
      { label: "칭찬", path: "/stats" },
      { label: "현황", path: "/overview" },
      { label: "도구", path: "/tools" },
      { label: "설정", path: "/settings/students" }
    ],
    []
  );

  // 현재 URL 과 매칭되는지 확인
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={
        isStatsPage
          ? "bg-black/20 backdrop-blur-md border-b border-white/5"
          : "bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      }
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.path}
              onClick={() => {
                if (locked) return;
                onUserNavigate(tab.path);
              }}
              disabled={locked}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${locked
                ? "text-gray-400 cursor-not-allowed"
                : isActive(tab.path)
                  ? isStatsPage
                    ? "bg-white/90 text-indigo-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] ring-1 ring-white/50"
                    : "bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100"
                  : isStatsPage
                    ? "text-indigo-200/60 hover:text-white hover:bg-white/10"
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
            <span className={isStatsPage ? "text-xs text-indigo-200/60" : "text-xs text-gray-600"}>
              자동 전환
            </span>
            <button
              type="button"
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

          {/* 로그아웃 버튼 */}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isStatsPage
                  ? "text-red-300 hover:bg-red-500/20 hover:text-red-200"
                  : "text-red-500 hover:bg-red-50 hover:text-red-600"
                }`}
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

export default TopNav;