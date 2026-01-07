import { useEffect, useRef, useState } from "react";

const Seat = ({
  seat,
  student,
  status = 'unchecked', // 'present', 'unchecked', or detailed status string
  disabled = false,
  progress = null, // ✅ { completed, total }
  onToggleAttendance,
  onOpenMission,
  alwaysActiveMission = false,
}) => {
  // ... (keep existing state/useEffect) ...
  const [highlightMission, setHighlightMission] = useState(false);
  const prevStatusRef = useRef(status);

  const isActive = status === 'present';

  useEffect(() => {
    if (!student) return;

    // Pulse animation when becoming present
    if (prevStatusRef.current !== 'present' && status === 'present') {
      setHighlightMission(true);
      const timer = setTimeout(() => setHighlightMission(false), 1000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status, student]);

  if (!student) {
    return (
      <div className="h-full rounded-2xl bg-white/60 border border-white/60 flex items-center justify-center min-h-[80px]">
        <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase"></span>
      </div>
    );
  }

  // Define Status Display Config (Similar to AttendanceStatsSection but simpler styles for card)
  const STATUS_CONFIG = {
    "sick-absent": { label: "질병결석", icon: "🏥", color: "bg-blue-50 text-blue-600 border-blue-200" },
    "sick-late": { label: "질병지각", icon: "🏥", color: "bg-blue-50 text-blue-600 border-blue-200" },
    "sick-early-leave": { label: "질병조퇴", icon: "🏥", color: "bg-blue-50 text-blue-600 border-blue-200" },
    "authorized-absent": { label: "인정결석", icon: "📋", color: "bg-purple-50 text-purple-600 border-purple-200" },
    "authorized-late": { label: "인정지각", icon: "📋", color: "bg-purple-50 text-purple-600 border-purple-200" },
    "authorized-early-leave": { label: "인정조퇴", icon: "📋", color: "bg-purple-50 text-purple-600 border-purple-200" },
    "unauthorized-absent": { label: "미인정결석", icon: "❌", color: "bg-red-50 text-red-600 border-red-200" },
    "unauthorized-late": { label: "미인정지각", icon: "❌", color: "bg-red-50 text-red-600 border-red-200" },
    "unauthorized-early-leave": { label: "미인정조퇴", icon: "❌", color: "bg-red-50 text-red-600 border-red-200" },
  };

  const statusInfo = STATUS_CONFIG[status];

  // Disabled Style Logic
  // If disabled, apply opacity and grayscale, and prevent clicks.
  const containerDisabledStyle = disabled ? "opacity-80 grayscale cursor-not-allowed pointer-events-none" : "";

  let containerStyle = "";
  let badgeStyle = "";
  let nameStyle = "";

  if (isActive) {
    // Present
    containerStyle = "bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md border border-purple-300 cursor-pointer";
    badgeStyle = student.gender === "male" ? "bg-blue-500" : student.gender === "female" ? "bg-pink-500" : "bg-emerald-500";
    nameStyle = "text-gray-900";
  } else if (statusInfo) {
    // Detailed Status (Sick, Late, etc)
    containerStyle = `border ${statusInfo.color.split(' ')[2]} ${statusInfo.color.split(' ')[0]} cursor-pointer opacity-90`;
    badgeStyle = "bg-gray-400";
    nameStyle = "text-gray-600";
  } else {
    // Unchecked
    containerStyle = "bg-white border border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-md";
    badgeStyle = "bg-slate-400";
    nameStyle = "text-slate-600";
  }

  // Override if disabled
  if (disabled) {
    containerStyle = "bg-gray-50 border border-gray-200 cursor-not-allowed shadow-none";
    badgeStyle = "bg-gray-300";
    nameStyle = "text-gray-400 decoration-gray-300"; // Optional line-through? maybe too much
  }

  const handleSeatClick = () => {
    if (!student || disabled) return;
    onToggleAttendance?.(student);
  };

  return (
    <div
      onClick={handleSeatClick}
      className={`
        group relative w-full h-full min-h-[100px] rounded-2xl transition-all duration-200 ease-out
        flex flex-col items-center justify-between overflow-hidden
        ${containerStyle}
        ${containerDisabledStyle}
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

      {/* 3. 하단: 미션 푸터 버튼 OR 상세 상태 표시 */}
      <div className="w-full flex-none">
        {statusInfo ? (
          // 상세 상태 표시 (Footer Label)
          <div className={`w-full py-2 text-[10px] font-bold text-center border-t tracking-widest uppercase flex items-center justify-center gap-1 ${statusInfo.color.replace('bg-', 'bg-opacity-50 ')}`}>
            {statusInfo.label.length <= 4 && <span>{statusInfo.icon}</span>}
            <span className={`${statusInfo.label.length > 4 ? "tracking-tighter scale-90" : ""}`}>
              {statusInfo.label}
            </span>
          </div>
        ) : (disabled && status === 'unchecked') ? (
          // [New] Disabled Unchecked Label
          <div className="w-full py-2 text-[10px] font-bold text-center border-t border-gray-200 tracking-widest uppercase flex items-center justify-center gap-1 bg-gray-100 text-gray-400">
            <span>미체크</span>
          </div>
        ) : (
          // 미션 버튼 (Checking not detailed status)
          <button
            onClick={(e) => {
              e.stopPropagation(); // 좌석 클릭 이벤트 전파 방지

              // 미션 모달 열기: 출석 상태이거나 alwaysActiveMission일 때만
              if (isActive || alwaysActiveMission) {
                onOpenMission?.(student);
              }
            }}
            className={`
              relative w-full py-2 text-[10px] font-bold uppercase tracking-widest
              transition-all border-t overflow-hidden
              ${isActive || alwaysActiveMission
                ? (progress && progress.total > 0 && progress.completed === progress.total)
                  ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white border-green-200/50 cursor-pointer hover:brightness-105" // 완료됨
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-purple-200/50 cursor-pointer hover:brightness-105" // 진행중
                : "text-indigo-400 bg-white border-indigo-100 cursor-default" // 비활성
              }
              ${highlightMission && isActive ? "animate-pulse" : ""}
            `}
          >
            {/* Progress Bar (진행 중일 때만 백그라운드 오버레이) */}
            {(isActive || alwaysActiveMission) && progress && progress.total > 0 && progress.completed < progress.total && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-500 ease-out"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            )}

            {/* 텍스트 라벨 */}
            <span className="relative z-10 flex items-center justify-center gap-1">
              {(isActive || alwaysActiveMission) && progress && progress.total > 0 && progress.completed > 0 ? (
                progress.completed === progress.total ? (
                  <><span>완료!</span><span>✨</span></>
                ) : (
                  <span>{progress.completed} / {progress.total}</span>
                )
              ) : (
                <span>미션</span>
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Seat;