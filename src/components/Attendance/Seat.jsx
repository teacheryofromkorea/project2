import { useEffect, useRef, useState } from "react";

const Seat = ({
  seat,
  student,
  status = 'unchecked', // 'present', 'unchecked', or detailed status string
  onToggleAttendance,
  onOpenMission,
  alwaysActiveMission = false,
}) => {
  // ... (keep existing state/useEffect) ...
  const [highlightMission, setHighlightMission] = useState(false);
  const prevStatusRef = useRef(status);

  const isActive = status === 'present';
  // Detailed status means not present and not unchecked
  const isDetailedStatus = status !== 'present' && status !== 'unchecked';
  // Disabled (visual) if detailed status is effectively absent type? 
  // Actually user wants to see the status label. Click behavior:
  // If detailed status -> user can still click seat to toggle? 
  // AttendanceBoard logic says markPresent toggles between present/unchecked.
  // We probably want clicking the seat to still toggle or open unchecked modal?
  // Existing logic: markPresent toggles status.
  // If detailed status is set, toggling might reset to present or unchecked. 
  // Let's keep click handler simple: onToggleAttendance triggers the toggle logic in parent.

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

  const handleSeatClick = () => {
    if (!student) return;
    // Allow toggle even if detailed status (to undo it easily)
    onToggleAttendance?.(student);
  };

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

  // 스타일 결정 로직
  // 1) Active (출석): 보라색, 활성
  // 2) Detailed (결석 등): 해당 상태 컬러
  // 3) Inactive (미체크): 흰색

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
    // Use the color from config for border/bg, but simpler
    containerStyle = `border ${statusInfo.color.split(' ')[2]} ${statusInfo.color.split(' ')[0]} cursor-pointer opacity-90`;
    badgeStyle = "bg-gray-400";
    nameStyle = "text-gray-600";
  } else {
    // Unchecked
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

      {/* 3. 하단: 미션 푸터 버튼 OR 상세 상태 표시 */}
      <div className="w-full flex-none">
        {statusInfo ? (
          // 상세 상태 표시 (Footer Label)
          // 상세 상태 표시 (Footer Label)
          <div className={`w-full py-2 text-[10px] font-bold text-center border-t tracking-widest uppercase flex items-center justify-center gap-1 ${statusInfo.color.replace('bg-', 'bg-opacity-50 ')}`}>
            {statusInfo.label.length <= 4 && <span>{statusInfo.icon}</span>}
            <span className={`${statusInfo.label.length > 4 ? "tracking-tighter scale-90" : ""}`}>
              {statusInfo.label}
            </span>
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
              w-full py-2 text-[10px] font-bold uppercase tracking-widest
              transition-all border-t
              ${isActive || alwaysActiveMission
                ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 active:brightness-90 border-purple-200/50 cursor-pointer"
                : "text-indigo-400 bg-white border-indigo-100 cursor-default" // 비활성 (미체크) - 클릭해도 반응 X (이름표 눌러서 출석해야 함)
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