import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import TopNav from "./components/TopNav";

import RoutineSidebar from "./components/Attendance/RoutineSidebar";
import MissionSidebar from "./components/Attendance/MissionSidebar";
import AttendanceBoard from "./components/Attendance/AttendanceBoard";

import BreakTimeBoard from "./components/Break/BreakTimeBoard";

import LunchPage from "./components/Lunch/LunchPage";
import ClassPage from "./components/Class/ClassPage";
import EndPage from "./components/End/EndPage";
import StatsPage from "./components/Stats/StatsPage";
import OverviewPage from "./components/Overview/OverviewPage";
import ToolsPage from "./components/Tools/ToolsPage";

import SettingsLayout from "./components/Settings/SettingsLayout";
import StudentsPage from "./components/Settings/Students/StudentsPage";
import TimeTablePage from "./components/Settings/TimeTable/TimeTablePage";
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
  const { activeBlock, loading } = useCurrentTimeBlock();

  // 자동 탭 전환 토글 (기본값: ON)
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(() => {
    return localStorage.getItem("autoTabSwitch") !== "off";
  });

  // 사용자가 수동으로 탭을 이동했는지 여부
  const [isManualNavigation, setIsManualNavigation] = useState(false);

  useEffect(() => {
    if (loading || !activeBlock) return;

    // 자동 전환 OFF 상태면 아무 것도 하지 않음
    if (!autoSwitchEnabled) return;

    // 설정 페이지에서는 자동 전환 금지
    if (location.pathname.startsWith("/settings")) return;

    // 사용자가 방금 수동으로 이동했으면 자동 전환 금지
    if (isManualNavigation) return;

    const map = {
      arrival: "/attendance",
      break: "/break",
      class: "/class",
      lunch: "/lunch",
      end: "/end",
    };

    const nextPath = map[activeBlock.block_type];
    if (!nextPath) return;

    // 이미 해당 탭이면 이동하지 않음
    if (location.pathname === nextPath) return;

    navigate(nextPath, { replace: true });
  }, [activeBlock, loading, location.pathname, autoSwitchEnabled, isManualNavigation]);

  useEffect(() => {
    // 설정 페이지 이동은 제외
    if (location.pathname.startsWith("/settings")) return;

    // 자동 전환에 의한 이동이 아닌 경우 → 수동 이동으로 간주
    setIsManualNavigation(true);

    const timer = setTimeout(() => {
      setIsManualNavigation(false);
    }, 60 * 1000); // 1분 후 자동 전환 복귀

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("autoTabSwitch", autoSwitchEnabled ? "on" : "off");
  }, [autoSwitchEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-orange-200 text-gray-900">
      <TopNav />

      <main className="flex-1 px-8 pb-8 pt-4">
        <Routes>

          {/* 기본 경로 → 출석 탭 */}
          <Route path="/" element={<Navigate to="/attendance" replace />} />

          {/* 출석 */}
          <Route path="/attendance" element={<AttendanceLayout />} />

          {/* 쉬는시간 */}
          <Route path="/break" element={<BreakTimeBoard />} />


          <Route path="/settings" element={<SettingsLayout />}>
            <Route path="students" element={<StudentsPage />} />
            <Route path="timetable" element={<TimeTablePage />} />
            <Route path="general" element={<GeneralPage />} />
          </Route>


          <Route path="/lunch" element={<LunchPage />} />
          <Route path="/class" element={<ClassPage />} />
          <Route path="/end" element={<EndPage />} />
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
      <AppContent />
    </BrowserRouter>
  );
}