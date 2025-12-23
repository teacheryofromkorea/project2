import Seat from "./Seat";

const GROUP_COLOR_MAP = {
  A: "border-blue-500 bg-blue-50",
  B: "border-green-500 bg-green-50",
  C: "border-purple-500 bg-purple-50",
  D: "border-orange-500 bg-orange-50",
};

function SeatGrid({ seats, attendanceMap, onSeatClick, totalCols }) {
  // 최대 row / col 계산 → grid 크기 자동 결정
  const maxRow = Math.max(...seats.map(s => s.row));
  const maxCol = Math.max(...seats.map(s => s.col));

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${totalCols || maxCol}, minmax(0, 1fr))`
      }}
    >
      {seats.map(seat => {
        const student = seat.students || null;
        const isPresent = student
          ? attendanceMap[student.id] === true
          : false;

        const groupStyle =
          seat.group_name && GROUP_COLOR_MAP[seat.group_name]
            ? GROUP_COLOR_MAP[seat.group_name]
            : "border-gray-300 bg-white";

        return (
          <button
            key={seat.id}
            onClick={() => onSeatClick(seat)}
            className={`
              relative aspect-square rounded-xl border
              flex flex-col items-center justify-center
              text-sm font-semibold transition
              ${groupStyle}
              ${isPresent ? "ring-2 ring-emerald-500" : "hover:brightness-95"}
            `}
          >
            {seat.group_name && (
              <span className="absolute top-1 left-1 text-[10px] font-bold text-gray-600">
                {seat.group_name}
              </span>
            )}

            <span className="text-base">
              {student ? student.name : "빈 자리"}
            </span>

            {student && (
              <span className="text-[11px] mt-1 text-gray-500">
                {isPresent ? "출석 ✔" : "미출석"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SeatGrid;