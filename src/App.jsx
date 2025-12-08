
import TopNav from "./components/TopNav";
import RoutineSidebar from "./components/Attendance/RoutineSidebar";
import MissionSidebar from "./components/Attendance/MissionSidebar";
import AttendanceBoard from "./components/Attendance/AttendanceBoard";
import BreakTimeBoard from "./components/Break/BreakTimeBoard";  // ✨ 새로 만들 파일
import { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("attendance");

  useEffect(() => {
  const saved = localStorage.getItem("activeTab");
  if (saved) {
    setActiveTab(saved);
  }
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-orange-200 text-gray-900">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-8 pb-8 pt-4">

        {activeTab === "attendance" && (
          <div className="grid grid-cols-[260px,1fr,260px] gap-4">
            <RoutineSidebar />
            <AttendanceBoard />
            <MissionSidebar />
          </div>
        )}

        {activeTab === "break" && (
          <BreakTimeBoard />
        )}

      </main>
    </div>
  );
  
}



export default App;