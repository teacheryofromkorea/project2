import RewardSummarySection from "./RewardSummarySection";
import AttendanceStatsSection from "./AttendanceStatsSection";

function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">📊 학급 종합 현황</h1>
        <p className="text-gray-600 text-sm">
          출석, 미션, 루틴, 상벌점 등을 한눈에 확인합니다.
        </p>
      </div>

      {/* 🔹 출결 종합 현황 */}
      <AttendanceStatsSection />

      {/* 🔹 누적 상점 현황 */}
      <RewardSummarySection />
    </div>
  );
}

export default OverviewPage;