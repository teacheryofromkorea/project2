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

  return (
    <button
      onClick={handleSeatClick}
      className={`
        relative rounded-xl border
        flex flex-col items-center justify-center
        aspect-square
        transition
        ${
          student
            ? isPresent
              ? "bg-green-100 border-green-400"
              : "bg-white border-gray-300 hover:bg-gray-50"
            : "bg-gray-100 border-dashed border-gray-300 cursor-default"
        }
      `}
    >
      {student ? (
        <>
          <div className="text-sm font-semibold text-gray-800">
            {student.name}
          </div>

          {student.number != null && (
            <div className="text-xs text-gray-500">
              {student.number}번
            </div>
          )}

          {/* 출석 후에만 미션 버튼 표시 */}
          {isPresent && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // 좌석 클릭 방지
                onOpenMission?.(student);
              }}
              className={`
                mt-2 px-3 py-1
                text-xs font-semibold
                rounded-full
                bg-blue-600 text-white
                hover:bg-blue-700
                transition
                ${
                  highlightMission
                    ? "ring-2 ring-blue-400 ring-offset-2 scale-105"
                    : ""
                }
              `}
            >
              미션
            </button>
          )}
        </>
      ) : (
        <div className="text-xs text-gray-400">
          빈 자리
        </div>
      )}
    </button>
  );
}

export default Seat;