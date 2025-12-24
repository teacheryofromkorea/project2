import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// ✅ 기본 상태에서 모둠이 확실히 구분되도록 대비를 올린 팔레트
const GROUP_COLOR_MAP = {
  A: "border-blue-600 bg-blue-200",
  B: "border-green-600 bg-green-200",
  C: "border-purple-600 bg-purple-200",
  D: "border-orange-600 bg-orange-200",
};

// "1조", "2조" 같은 임의 모둠명도 색을 받도록 안전한(정적 클래스) 팔레트
const GROUP_STYLE_PALETTE = [
  "border-blue-600 bg-blue-200",
  "border-green-600 bg-green-200",
  "border-purple-600 bg-purple-200",
  "border-orange-600 bg-orange-200",
  "border-pink-600 bg-pink-200",
  "border-teal-600 bg-teal-200",
  "border-amber-600 bg-amber-200",
];

// 문자열 해시(결정적) → 팔레트 인덱스
const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
};

const getGroupStyleClass = (groupName) => {
  if (!groupName) return null;

  // 딱 매핑된 키면 우선 적용
  if (GROUP_COLOR_MAP[groupName]) return GROUP_COLOR_MAP[groupName];

  // 나머지는 팔레트에서 결정적으로 고르기
  const idx = hashString(groupName) % GROUP_STYLE_PALETTE.length;
  return GROUP_STYLE_PALETTE[idx];
};

function SeatEditorGrid({
  onSeatEmptyClick,
  onSeatOccupiedClick,
  hoveredStudentId,
  onSeatHover,
  onSeatHoverOut,
  isGroupEditMode = false,
  selectedSeatIds = [],
  onToggleSeatSelect,
  previewRows,
  previewCols,
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

  const effectiveRows = previewRows ?? maxRow;
  const effectiveCols = previewCols ?? maxCol;

  // 미리보기용 좌석 생성 (늘어날 경우)
  const seatMap = new Map(seats.map((s) => [`${s.row}-${s.col}`, s]));
  const previewSeats = [];

  for (let r = 1; r <= effectiveRows; r++) {
    for (let c = 1; c <= effectiveCols; c++) {
      const key = `${r}-${c}`;
      if (seatMap.has(key)) {
        previewSeats.push(seatMap.get(key));
      } else {
        previewSeats.push({
          id: `preview-${key}`,
          row: r,
          col: c,
          isPreviewAdd: true,
        });
      }
    }
  }

  return (
    <div
      className="grid gap-1.5 bg-indigo-50/40 p-2 rounded-xl"
      style={{
        gridTemplateRows: `repeat(${effectiveRows}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${effectiveCols}, minmax(0, 1fr))`,
      }}
    >
      {previewSeats.map((seat) => {
        const isPreviewAdd = seat.isPreviewAdd;
        const isPreviewRemove =
          !isPreviewAdd &&
          (seat.row > effectiveRows || seat.col > effectiveCols);

        const groupStyle = getGroupStyleClass(seat.group_name) || "border-gray-300 bg-white";
        const hasGroup = Boolean(seat.group_name);

        const student = seat.students;
        const isEmptySeat = !student;

        const genderBarClass =
          student?.gender === "male"
            ? "bg-blue-500"
            : student?.gender === "female"
            ? "bg-pink-400"
            : "";

        const isHoveredStudent =
          student?.id && hoveredStudentId && student.id === hoveredStudentId;
        const isSelectedSeat = selectedSeatIds.includes(seat.id);

        const isSameGroupHovered =
          seat.group_name &&
          seats.some(
            (s) =>
              s.group_name === seat.group_name &&
              s.students?.id === hoveredStudentId
          );

        return (
          <div
            key={seat.id}
            onClick={() => {
              if (isPreviewAdd || isPreviewRemove) {
                return;
              }
              // ✅ 모둠 편집 모드: 선택/해제만 (학생 배치/자리 비우기 잠금)
              if (isGroupEditMode) {
                if (onToggleSeatSelect) {
                  onToggleSeatSelect(seat.id);
                }
                return;
              }

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
              cursor-pointer

              ${isPreviewAdd ? "border-dashed border-indigo-400 bg-indigo-50 text-gray-300" : ""}
              ${isPreviewRemove ? "bg-gray-200 opacity-40" : ""}

              ${isEmptySeat
                ? "border-dashed bg-gray-50 text-gray-400 hover:bg-indigo-50"
                : groupStyle
              }

              ${!isEmptySeat && hasGroup ? "shadow-inner" : ""}

              ${isGroupEditMode ? "hover:brightness-95" : ""}

              ${isSameGroupHovered ? "brightness-95" : ""}

              ${isHoveredStudent ? "ring-2 ring-indigo-400 z-10" : ""}

              ${isSelectedSeat ? "ring-2 ring-orange-400 z-10" : ""}
            `}
          >
            {!isEmptySeat && seat.group_name && (
              <span className="absolute top-1 left-1 text-[8px] font-bold text-white bg-black/40 px-1 rounded">
                {seat.group_name}
              </span>
            )}

            {isPreviewAdd ? (
              <>
                <div className="text-lg leading-none mb-1">＋</div>
                <div className="text-[11px] text-gray-400">
                  추가될 자리
                </div>
              </>
            ) : isEmptySeat ? (
              <>
                <div className="text-lg leading-none mb-1">＋</div>
                <div className="text-[11px] text-gray-400">
                  빈 자리
                </div>
              </>
            ) : (
              <>
                {student?.number != null && (
                  <div className="text-[9px] text-gray-500 leading-none">
                    {student.number}번
                  </div>
                )}
                <div className="text-xs text-gray-800 leading-tight text-center truncate w-full">
                  {student.name}
                </div>

                {/* 성별 컬러 바 */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-[4px] rounded-b-lg ${genderBarClass}`}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SeatEditorGrid;