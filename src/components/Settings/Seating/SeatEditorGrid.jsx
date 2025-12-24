import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const GROUP_COLOR_MAP = {
  A: "border-blue-500 bg-blue-50",
  B: "border-green-500 bg-green-50",
  C: "border-purple-500 bg-purple-50",
  D: "border-orange-500 bg-orange-50",
};

function SeatEditorGrid({
  onSeatEmptyClick,
  onSeatOccupiedClick,
  hoveredStudentId,
  onSeatHover,
  onSeatHoverOut,
}) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeats = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("classroom_seats")
        .select(
          `
            id,
            row,
            col,
            label,
            group_name,
            student_id,
            students:students (
              id,
              name,
              number,
              gender
            )
          `
        )
        .order("row", { ascending: true })
        .order("col", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setSeats(data || []);
      setLoading(false);
    };

    loadSeats();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        좌석 불러오는 중…
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        좌석 데이터가 없습니다.
      </div>
    );
  }

  const maxRow = Math.max(...seats.map((s) => s.row));
  const maxCol = Math.max(...seats.map((s) => s.col));

  return (
    <div
      className="grid gap-1.5"
      style={{
        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`,
      }}
    >
      {seats.map((seat) => {
        const groupStyle =
          seat.group_name && GROUP_COLOR_MAP[seat.group_name]
            ? GROUP_COLOR_MAP[seat.group_name]
            : "border-gray-300 bg-white";

        const student = seat.students;

        const isHoveredStudent =
          student?.id && hoveredStudentId && student.id === hoveredStudentId;

        return (
          <div
            key={seat.id}
            onClick={() => {
              // 빈 자리 → 학생 배치
              if (!seat.student_id && onSeatEmptyClick) {
                onSeatEmptyClick(seat);
                return;
              }

              // 배치된 자리 → 자리 비우기(미니 모달 트리거)
              if (seat.student_id && onSeatOccupiedClick) {
                onSeatOccupiedClick(seat);
              }
            }}
            onMouseEnter={() => {
              if (student?.id && onSeatHover) {
                onSeatHover(student.id);
              }
            }}
            onMouseLeave={() => {
              if (onSeatHoverOut) {
                onSeatHoverOut();
              }
            }}
            className={`
              relative h-[72px] rounded-lg border
              flex flex-col items-center justify-center
              px-0.5
              text-xs font-medium
              transition
              ${seat.student_id ? "cursor-pointer hover:bg-gray-100" : "cursor-pointer hover:bg-indigo-50"}
              ${groupStyle}
              ${isHoveredStudent ? "ring-2 ring-indigo-400 z-10" : ""}
            `}
          >
            {seat.group_name && (
              <span className="absolute top-1 left-1 text-[8px] font-bold text-gray-500">
                {seat.group_name}
              </span>
            )}

            {student?.number != null && (
              <div className="text-[9px] text-gray-500 leading-none">
                {student.number}번
              </div>
            )}

            <div className="text-xs text-gray-800 leading-tight text-center truncate w-full">
              {student?.name || "빈 자리"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SeatEditorGrid;