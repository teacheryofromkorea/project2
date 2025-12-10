import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopNav from "./components/TopNav";

import RoutineSidebar from "./components/Attendance/RoutineSidebar";
import MissionSidebar from "./components/Attendance/MissionSidebar";
import AttendanceBoard from "./components/Attendance/AttendanceBoard";

import BreakTimeBoard from "./components/Break/BreakTimeBoard";

import SettingsBoard from "./components/Settings/SettingsBoard";
import StudentsManage from "./components/Settings/StudentsManage";
import TimeTable from "./components/Settings/TimeTable";
import GeneralSettings from "./components/Settings/GeneralSettings";

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

            {/* 설정 (중첩 라우팅) */}
            <Route path="/settings" element={<SettingsBoard />}>
              <Route path="students" element={<StudentsManage />} />
              <Route path="timetable" element={<TimeTable />} />
              <Route path="general" element={<GeneralSettings />} />

              {/* /settings 접속 시 기본 값 */}
              <Route index element={<Navigate to="students" replace />} />
            </Route>

            {/* 존재하지 않는 경로 → 출석 */}
            <Route path="*" element={<Navigate to="/attendance" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;