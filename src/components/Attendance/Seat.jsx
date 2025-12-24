function Seat({
  seat,
  student,
  isPresent,
  onToggleAttendance,
  onOpenMission,
}) {
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
                e.stopPropagation(); // ⭐ 출석 토글 방지
                onOpenMission?.(student);
              }}
              className="
                mt-2 px-3 py-1
                text-xs font-semibold
                rounded-full
                bg-blue-600 text-white
                hover:bg-blue-700
                transition
              "
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