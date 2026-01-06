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
import { AnimatePresence } from "framer-motion"; // 🔹 Import AnimatePresence
import TopNav from "./components/TopNav";
import { LockProvider } from "./context/LockContext";
import PageTransition from "./components/common/PageTransition"; // 🔹 Import PageTransition

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
    <PageTransition>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-[260px,1fr,260px] gap-6 w-full max-w-[1700px] flex-1 mx-auto min-h-0">
          <RoutineSidebar />
          <AttendanceBoard />
          <MissionSidebar />
        </div>
      </div>
    </PageTransition>
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
      className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-500 ${isStatsPage
        ? "bg-[#0a051a] text-white" // Deep Space Void
        : "text-slate-800 bg-slate-50"
        }`}
    >

      {/* 🌌 Stats Page Background (Cosmic Aurora & Geometric Dreams) */}
      {isStatsPage && (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a051a] overflow-hidden">
          {/* 1. Nebula Orbs (Ambient Light) */}
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-violet-600/30 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/30 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-fuchsia-600/20 rounded-full blur-[80px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '4s' }} />

          {/* 2. Tech Grid (Structure) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-60" />

          {/* 4. Cinematic Noise */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
      )}

      {/* Background Layer: Artistic Mesh Gradient (MMCA Style) */}
      {!isStatsPage && (
        <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50">
          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {/* Vibrant Color Orbs (Higher Intensity) */}
          <div className="absolute top-[15%] left-[20%] w-[65vw] h-[65vw] bg-blue-600/40 rounded-full blur-[130px] animate-pulse-slow" />
          <div className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] bg-rose-600/35 rounded-full blur-[110px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[-5%] right-[5%] w-[50vw] h-[50vw] bg-amber-500/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-[15%] left-[-5%] w-[40vw] h-[40vw] bg-cyan-500/35 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

          {/* Central Mixing Point */}
          <div className="absolute top-[35%] right-[15%] w-[40vw] h-[40vw] bg-indigo-600/25 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Toaster position="top-center" />
        <TopNav
          autoSwitchEnabled={autoSwitchEnabled}
          onToggleAutoSwitch={() => setAutoSwitchEnabled((v) => !v)}
          onUserNavigate={handleUserNavigate}
        />

        <main className="flex-1 flex flex-col min-h-0 px-8 pb-10 pt-4">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* 기본 경로 → 출석 탭 */}
              <Route path="/" element={<Navigate to="/attendance" replace />} />

              {/* 출석 (PageTransition inside layout component) */}
              <Route path="/attendance" element={<AttendanceLayout />} />

              {/* 쉬는시간 */}
              <Route path="/break" element={
                <PageTransition>
                  <BreakTimeBoard />
                </PageTransition>
              } />

              {/* 설정 (PageTransition handles generic children) */}
              <Route path="/settings" element={
                <PageTransition>
                  <SettingsLayout />
                </PageTransition>
              }>
                <Route path="students" element={<StudentsPage />} />
                <Route path="timetable" element={<TimeTablePage />} />
                <Route path="seating" element={<SeatingPlanPage />} />
                <Route path="general" element={<GeneralPage />} />
              </Route>

              {/* 기타 탭 */}
              <Route path="/lunch" element={
                <PageTransition>
                  <LunchTimeBoard />
                </PageTransition>
              } />
              <Route path="/class" element={
                <PageTransition>
                  <ClassPage />
                </PageTransition>
              } />
              <Route path="/end" element={
                <PageTransition>
                  <EndTimeBoard />
                </PageTransition>
              } />
              <Route path="/stats" element={
                <PageTransition>
                  <StatsPage />
                </PageTransition>
              } />
              <Route path="/overview" element={
                <PageTransition>
                  <OverviewPage />
                </PageTransition>
              } />
              <Route path="/tools" element={
                <PageTransition>
                  <ToolsPage />
                </PageTransition>
              } />

              {/* 존재하지 않는 경로 → 출석 */}
              <Route path="*" element={<Navigate to="/attendance" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
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