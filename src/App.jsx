import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import TopNav from "./components/TopNav";
import { LockProvider } from "./context/LockContext";

import RoutineSidebar from "./components/Attendance/RoutineSidebar";
import MissionSidebar from "./components/Attendance/MissionSidebar";
import AttendanceBoard from "./components/Attendance/AttendanceBoard";

import BreakTimeBoard from "./components/Break/BreakTimeBoard";
import LunchTimeBoard from "./components/Lunch/LunchTimeBoard";

import ClassPage from "./components/Class/ClassPage";
import EndTimeBoard from "./components/End/EndTimeBoard";
import StatsPage from "./components/Stats/StatsPage";
import OverviewPage from "./components/Overview/OverviewPage";
import ToolsPage from "./components/Tools/ToolsPage";

import SettingsLayout from "./components/Settings/SettingsLayout";
import StudentsPage from "./components/Settings/Students/StudentsPage";
import TimeTablePage from "./components/Settings/TimeTable/TimeTablePage";
import SeatingPlanPage from "./components/Settings/Seating/SeatingPlanPage";
import GeneralPage from "./components/Settings/General/GeneralPage";

import useCurrentTimeBlock from "./hooks/useCurrentTimeBlock";

function AttendanceLayout() {
  return (
    <div className="grid grid-cols-[260px,1fr,260px] gap-4">
      <RoutineSidebar />
      <AttendanceBoard />
      <MissionSidebar />
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStatsPage = location.pathname.startsWith("/stats");
  const autoNavigatedRef = useRef(false);
  const prevPathRef = useRef(location.pathname);
  const userNavigatingRef = useRef(false);
  const { activeBlock, loading } = useCurrentTimeBlock();

  // 자동 탭 전환 토글 (기본값: ON)
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(() => {
    return localStorage.getItem("autoTabSwitch") !== "off";
  });

  // 자동전환 UX 규칙:
  // 1) 자동전환 ON 시, 현재 시간에 해당하는 탭으로 즉시 이동
  // 2) 자동전환에 의해 이동된 이후, 사용자가 직접 탭/드롭다운을 조작하면 자동전환 OFF
  useEffect(() => {
    if (loading || !activeBlock) return;
    if (!autoSwitchEnabled) return;
    if (location.pathname.startsWith("/settings")) return;

    const map = {
      arrival: "/attendance",
      break: "/break",
      class: "/class",
      lunch: "/lunch",
      end: "/end",
    };

    const nextPath = map[activeBlock.block_type];
    if (!nextPath) return;

    if (location.pathname !== nextPath) {
      autoNavigatedRef.current = true;
      navigate(nextPath, { replace: true });
      toast.success("시간표에 따라 화면이 자동 전환되었습니다");
    }
  }, [activeBlock, loading, autoSwitchEnabled, location.pathname, navigate]);

  // 사용자 수동 이동 감지 → 자동전환 OFF
  useEffect(() => {
    // Ignore if path did not actually change
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    if (location.pathname.startsWith("/settings")) return;

    // If this route change was initiated via our explicit user handler, just consume the flag
    if (userNavigatingRef.current) {
      userNavigatingRef.current = false;
      return;
    }

    // If the last navigation was automatic, consume the flag and exit
    if (autoNavigatedRef.current) {
      autoNavigatedRef.current = false;
      return;
    }

    // User-initiated navigation → disable auto switch
    if (autoSwitchEnabled) {
      setAutoSwitchEnabled(false);
      toast("자동전환이 해제되었습니다");
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("autoTabSwitch", autoSwitchEnabled ? "on" : "off");
  }, [autoSwitchEnabled]);

  const handleUserNavigate = (nextPath) => {
    // Mark this navigation as user-initiated so we can avoid extra side-effects
    userNavigatingRef.current = true;

    // If auto-switch is currently enabled, disable it BEFORE navigating
    if (autoSwitchEnabled) {
      setAutoSwitchEnabled(false);
      toast("자동전환이 해제되었습니다");
    }

    navigate(nextPath);
  };

  return (
    <div
      className={
        `min-h-screen flex flex-col text-gray-900 ` +
        (isStatsPage
          ? "bg-gradient-to-br from-[#2b145f] via-[#3b1d7a] to-[#5b2fa6]"
          : "bg-gradient-to-br from-pink-200 via-purple-200 to-orange-200")
      }
    >
      <Toaster position="top-center" />
      <TopNav
        autoSwitchEnabled={autoSwitchEnabled}
        onToggleAutoSwitch={() => setAutoSwitchEnabled((v) => !v)}
        onUserNavigate={handleUserNavigate}
      />

      <main className="flex-1 min-h-0 px-8 pb-8 pt-4">
        <Routes>
          {/* 기본 경로 → 출석 탭 */}
          <Route path="/" element={<Navigate to="/attendance" replace />} />

          {/* 출석 */}
          <Route path="/attendance" element={<AttendanceLayout />} />

          {/* 쉬는시간 */}
          <Route path="/break" element={<BreakTimeBoard />} />

          {/* 설정 */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route path="students" element={<StudentsPage />} />
            <Route path="timetable" element={<TimeTablePage />} />
            <Route path="seating" element={<SeatingPlanPage />} />
            <Route path="general" element={<GeneralPage />} />
          </Route>

          {/* 기타 탭 */}
          <Route path="/lunch" element={<LunchTimeBoard />} />
          <Route path="/class" element={<ClassPage />} />
          <Route path="/end" element={<EndTimeBoard />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/tools" element={<ToolsPage />} />

          {/* 존재하지 않는 경로 → 출석 */}
          <Route path="*" element={<Navigate to="/attendance" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LockProvider>
        <AppContent />
      </LockProvider>
    </BrowserRouter>
  );
}