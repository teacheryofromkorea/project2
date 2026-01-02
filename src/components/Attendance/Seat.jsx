import { useEffect, useRef, useState } from "react";

function Seat({
  seat,
  student,
  isPresent,
  onToggleAttendance,
  onOpenMission,
}) {
  const [highlightMission, setHighlightMission] = useState(false);
  const prevPresentRef = useRef(isPresent);

  // 출석 상태 변화 감지 → 미션 버튼 첫 등장 강조
  useEffect(() => {
    if (!student) return;

    // false → true 로 바뀌는 순간만
    if (!prevPresentRef.current && isPresent) {
      setHighlightMission(true);

      const timer = setTimeout(() => {
        setHighlightMission(false);
      }, 1000);

      return () => clearTimeout(timer);
    }

    prevPresentRef.current = isPresent;
  }, [isPresent, student]);

  // 빈 자리는 클릭 무시
  const handleSeatClick = () => {
    if (!student) return;
    onToggleAttendance?.(student);
  };

  if (!student) {
    return (
      <div className="h-full rounded-2xl bg-white/60 border border-white/60 flex items-center justify-center min-h-[80px]">
        <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Empty</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSeatClick}
      className={`
        group relative w-full h-full min-h-[100px] rounded-2xl transition-all duration-200 ease-out
        flex flex-col items-center justify-center
        ${isPresent
          ? "bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md border border-purple-300"
          : "bg-white/90 backdrop-blur-sm border border-gray-200 opacity-90 hover:opacity-100 hover:bg-white hover:scale-[1.02] hover:shadow-lg"
        }
      `}
    >
      {/* Active Indicator (Soft Inner Glow) */}
      {isPresent && (
        <div className="absolute inset-0 rounded-2xl bg-white/30 pointer-events-none" />
      )}

      {/* Content */}
      <div className="flex flex-col items-center relative z-10 transition-transform duration-300 group-hover:-translate-y-1">

        {/* Avatar Dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full mb-3 ring-2 ring-white shadow-sm ${student.gender === "male"
            ? "bg-blue-500"
            : student.gender === "female"
              ? "bg-pink-500"
              : "bg-emerald-500"
            }`}
        />

        <div
          className={`text-lg font-extrabold tracking-tight transition-colors ${isPresent
            ? "text-gray-900"
            : "text-slate-600"
            }`}
        >
          {student.name}
        </div>

        {student.number != null && (
          <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
            {student.number.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Mission Button (Pastel Style) */}
      {isPresent && (
        <div className="absolute bottom-3 left-0 w-full flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMission?.(student);
            }}
            className={`
              px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full
              bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm hover:shadow-md hover:scale-105 transition-all
              ${highlightMission ? "animate-pulse ring-2 ring-purple-300" : ""}
            `}
          >
            Mission
          </button>
        </div>
      )}
    </button>
  );
}

export default Seat;