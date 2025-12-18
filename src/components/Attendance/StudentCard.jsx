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
    <div className="relative rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 p-3 shadow-sm flex flex-col justify-between">

      {/* 🔥 출석번호 배지 */}
      {number != null && (
        <div className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
          {number}
        </div>
      )}

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
  );
}

export default StudentCard;