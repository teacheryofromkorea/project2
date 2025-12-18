function StudentCard({ 
  name, 
  number,
  isPresent, 
  onToggle,
  pendingRoutines = 0,
  pendingMissions = 0
}) {
  const totalPending = pendingRoutines + pendingMissions;

  return (
    <div className="relative rounded-2xl bg-white overflow-hidden shadow-sm border border-gray-200 flex flex-col justify-between">
      {/* 🎨 곡선 패턴 배경 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-10 -right-10 w-60 h-60 opacity-40"
        >
          <path
            fill="#E0E7FF"
            d="M43.3,-63.4C55.8,-54.7,65.4,-41.7,70.5,-27C75.6,-12.3,76.2,4.1,70.6,17.7C65,31.3,53.1,42.1,39.8,50.6C26.6,59.2,13.3,65.5,-1.6,67.8C-16.5,70.1,-33,68.3,-46.3,59.6C-59.7,50.9,-69.9,35.4,-73.4,18.8C-76.8,2.1,-73.6,-15.7,-65.2,-30.6C-56.7,-45.4,-43,-57.4,-27.7,-64.7C-12.4,-72,-6.2,-74.6,4.6,-81.1C15.3,-87.6,30.7,-98,43.3,-63.4Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      {/* 🔥 출석번호 배지 */}
      {number != null && (
        <div className="absolute -top-2 -right-2 z-20 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          {number}
        </div>
      )}

      <div className="relative z-10 p-4 flex flex-col justify-between h-full">
        <div className="text-sm font-semibold text-gray-800 mb-3 text-center">
          {name}
        </div>

        {totalPending > 0 && (
          <div className="text-[10px] text-gray-500 text-center mb-1">
            미완료 {totalPending}개
          </div>
        )}

        <button
          onClick={onToggle}
          className={`w-full rounded-full py-1.5 text-xs font-semibold transition ${
            isPresent
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {isPresent ? "출석 완료" : "출석"}
        </button>
      </div>
    </div>
  );
}

export default StudentCard;