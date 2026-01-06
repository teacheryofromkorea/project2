import Seat from "./Seat";

const GROUP_COLOR_MAP = {
  A: "border-blue-500 bg-blue-50",
  B: "border-green-500 bg-green-50",
  C: "border-purple-500 bg-purple-50",
  D: "border-orange-500 bg-orange-50",
};

function SeatGrid({
  seats,
  statusMap = {},   // ✅ 상세 상태 맵 (key: student.id, value: status string)
  activeMap = {},   // ✅ (Simple) 활성/비활성 맵 (key: student.id, value: boolean) - Break/Lunch/End용
  disabledMap = {}, // ✅ 비활성화 맵 (key: student.id, value: boolean) - 결석생 등 아예 클릭 불가 처리
  onToggleAttendance, // 좌석 클릭 시 실행될 함수
  onOpenMission,      // 미션 버튼 클릭 시 실행될 함수
  totalCols,          // 그리드 컬럼 수 (반응형/고정값)
  alwaysActiveMission = false, // true일 경우, 착석 여부(isActive)와 상관없이 미션 버튼을 항상 활성화 (쉬는시간/점심/하교 탭용)
}) {
  // 최대 row / col 계산 → grid 크기 자동 결정
  const maxRow = Math.max(...seats.map((s) => s.row));
  const maxCol = Math.max(...seats.map((s) => s.col));

  return (
    <div
      className="grid gap-4 h-full w-full"
      style={{
        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${totalCols || maxCol}, minmax(0, 1fr))`,
      }}
    >
      {seats.map((seat) => {
        const student = seat.students || null;

        let status = 'unchecked';
        let disabled = false;

        if (student) {
          // 1. Status 결정
          if (statusMap[student.id]) {
            status = statusMap[student.id];
          } else if (activeMap[student.id] !== undefined) {
            status = activeMap[student.id] ? 'present' : 'unchecked';
          }

          // 2. Disabled 결정
          if (disabledMap[student.id]) {
            disabled = true;
          }
        }

        return (
          <Seat
            key={seat.id}
            seat={seat}
            student={student}
            status={status}
            disabled={disabled}
            onToggleAttendance={onToggleAttendance}
            onOpenMission={onOpenMission}
            alwaysActiveMission={alwaysActiveMission} // 자식에게 옵션 전달
          />
        );
      })}
    </div>
  );
}

export default SeatGrid;