import TopNav from "./components/TopNav";
import RoutineSidebar from "./components/RoutineSidebar";
import MissionSidebar from "./components/MissionSidebar";
import AttendanceBoard from "./components/AttendanceBoard";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-orange-200 text-gray-900">
      <TopNav />

      <main className="flex-1 px-8 pb-8 pt-4">
        <div className="grid grid-cols-[260px,1fr,260px] gap-4">
          <RoutineSidebar />
          <AttendanceBoard />
          <MissionSidebar />
        </div>
      </main>
    </div>
  );
}

export default App;