import Seat from "./Seat";

const GROUP_COLOR_MAP = {
  A: "border-blue-500 bg-blue-50",
  B: "border-green-500 bg-green-50",
  C: "border-purple-500 bg-purple-50",
  D: "border-orange-500 bg-orange-50",
};

function SeatGrid({
  seats,
  attendanceMap,
  onToggleAttendance,
  onOpenMission,
  totalCols,
}) {
  // 최대 row / col 계산 → grid 크기 자동 결정
  const maxRow = Math.max(...seats.map((s) => s.row));
  const maxCol = Math.max(...seats.map((s) => s.col));

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${totalCols || maxCol}, minmax(0, 1fr))`,
      }}
    >
      {seats.map((seat) => {
        const student = seat.students || null;
        const isPresent = student
          ? attendanceMap[student.id] === true
          : false;

        return (
          <Seat
            key={seat.id}
            seat={seat}
            student={student}
            isPresent={isPresent}
            onToggleAttendance={onToggleAttendance}
            onOpenMission={onOpenMission}
          />
        );
      })}
    </div>
  );
}

export default SeatGrid;