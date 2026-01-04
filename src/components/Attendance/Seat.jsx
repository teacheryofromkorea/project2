import { useEffect, useRef, useState } from "react";

const Seat = ({
  seat,
  student,
  isActive,     // 활성화 체크 여부 (보라색 표시)
  isDisabled,   // 비활성화 여부 (회색/클릭불가 - 결석 등)
  onToggleAttendance,
  onOpenMission,
  alwaysActiveMission = false, // ✅ 추가: 미션 버튼 항상 활성화 여부
}) => {
  // ... (keep existing state/useEffect) ...
  const [highlightMission, setHighlightMission] = useState(false);
  const prevActiveRef = useRef(isActive);

  // 상태 변화 감지 → 미션 버튼 첫 등장 강조
  useEffect(() => {
    if (!student) return;

    // false → true 로 바뀌는 순간만
    if (!prevActiveRef.current && isActive) {
      setHighlightMission(true);

      const timer = setTimeout(() => {
        setHighlightMission(false);
      }, 1000);

      return () => clearTimeout(timer);
    }

    prevActiveRef.current = isActive;
  }, [isActive, student]);

  const handleSeatClick = () => {
    if (!student || isDisabled) return;
    onToggleAttendance?.(student);
  };

  if (!student) {
    return (
      <div className="h-full rounded-2xl bg-white/60 border border-white/60 flex items-center justify-center min-h-[80px]">
        <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Empty</span>
      </div>
    );
  }

  // 스타일 결정 로직
  // 1) Disabled (결석 or 준비안됨): 회색, 클릭불가
  // 2) Active (체크됨/출석함): 보라색, 활성
  // 3) Inactive (미체크/미출석): 흰색, 클릭가능

  let containerStyle = "";
  let badgeStyle = "";
  let nameStyle = "";
  let buttonStyle = ""; // unused in JSX below but kept for reference if needed

  if (isDisabled) {
    // Disabled State (결석)
    containerStyle = "bg-slate-100 border border-transparent opacity-60 cursor-not-allowed";
    badgeStyle = "bg-slate-300";
    nameStyle = "text-slate-400"; // 이름은 흐리게
    buttonStyle = ""; // 버튼 스타일 사용 안 함/별도 처리
  } else if (isActive) {
    // Active State (체크됨)
    containerStyle = "bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md border border-purple-300 cursor-pointer";
    badgeStyle = student.gender === "male" ? "bg-blue-500" : student.gender === "female" ? "bg-pink-500" : "bg-emerald-500";
    nameStyle = "text-gray-900";
  } else {
    // Inactive (Default) State (미체크)
    containerStyle = "bg-white border border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-md";
    badgeStyle = "bg-slate-400";
    nameStyle = "text-slate-600";
  }

  return (
    <div
      onClick={handleSeatClick}
      className={`
        group relative w-full h-full min-h-[100px] rounded-2xl transition-all duration-200 ease-out
        flex flex-col items-center justify-between overflow-hidden
        ${containerStyle}
      `}
    >
      {/* 1. 상단: 번호 뱃지 */}
      <div className="pt-3 flex-none">
        <div className={`w-5 h-5 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center ${badgeStyle}`}>
          {student.number != null && (
            <span className="text-[10px] font-black text-white leading-none">
              {student.number}
            </span>
          )}
        </div>
      </div>

      {/* 2. 중간: 이름 */}
      <div className="flex-none flex items-center justify-center w-full">
        <div
          className={`font-black transition-all duration-200 text-center w-full break-keep ${student.name.length >= 4
            ? "text-sm tracking-tighter leading-none px-0.5"
            : "text-lg tracking-tight"
            } ${nameStyle}`}
        >
          {student.name}
        </div>
      </div>

      {/* 3. 하단: 미션 푸터 버튼 OR 결석 라벨 */}
      <div className="w-full flex-none">
        {isDisabled ? (
          <div className="w-full py-2 text-[10px] font-bold text-rose-500 text-center bg-rose-50 border-t border-rose-100 tracking-widest uppercase">
            결석
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisabled && (isActive || alwaysActiveMission)) {
                onOpenMission?.(student);
              }
            }}
            className={`
              w-full py-2 text-[10px] font-bold uppercase tracking-widest
              transition-all border-t
              ${isActive || alwaysActiveMission
                ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 active:brightness-90 border-purple-200/50"
                : "text-indigo-600 bg-white hover:bg-indigo-50 border-indigo-100"
              }
              ${highlightMission && isActive ? "animate-pulse" : ""}
            `}
          >
            미션
          </button>
        )}
      </div>
    </div>
  );
};

export default Seat;