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
    <div
      onClick={handleSeatClick}
      className={`
        group relative w-full h-full min-h-[100px] rounded-2xl transition-all duration-200 ease-out
        flex flex-col items-center justify-center cursor-pointer
        ${isPresent
          ? "bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md border border-purple-300"
          : "bg-white/90 backdrop-blur-sm border border-gray-200 opacity-90 hover:opacity-100 hover:bg-white hover:scale-[1.02] hover:shadow-lg"
        }
      `}
    >
      {/* 1. 상단: 번호 뱃지 (크기 소폭 축소) */}
      <div
        className={`w-5 h-5 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center flex-none ${student.gender === "male"
          ? "bg-blue-500"
          : student.gender === "female"
            ? "bg-pink-500"
            : "bg-emerald-500"
          }`}
      >
        {student.number != null && (
          <span className="text-[10px] font-black text-white leading-none">
            {student.number}
          </span>
        )}
      </div>

      {/* 2. 중간: 이름 (4글자 초강력 압축) */}
      <div className="flex-none flex items-center justify-center w-full">
        <div
          className={`font-black transition-all duration-200 text-center w-full break-keep ${student.name.length >= 4
            ? "text-sm tracking-tighter leading-none px-0.5"
            : "text-lg tracking-tight"
            } ${isPresent
              ? "text-gray-900"
              : "text-slate-600"
            }`}
        >
          {student.name}
        </div>
      </div>

      {/* 3. 하단: 미션 버튼 (높이 축소) */}
      <div className="w-full px-1 flex-none h-6 mt-0.5">
        {isPresent ? (
          <button
            onClick={(e) => {
              e.stopPropagation(); // ⛔ 출석 토글 방지
              onOpenMission?.(student);
            }}
            className={`
              w-full h-full text-[9px] font-bold uppercase tracking-wider text-white rounded-lg
              bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm hover:shadow-md active:scale-95 transition-all
              ${highlightMission ? "animate-pulse ring-2 ring-purple-300" : ""}
            `}
          >
            미션
          </button>
        ) : (
          /* 결석 시에도 최소 공간 유지 (너무 납작해지지 않게) */
          <div className="w-full h-full opacity-0 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export default Seat;