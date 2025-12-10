import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function AttendanceLayout() {
  return (
    <div className="grid grid-cols-[260px,1fr,260px] gap-4">
      <RoutineSidebar />
      <AttendanceBoard />
      <MissionSidebar />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;