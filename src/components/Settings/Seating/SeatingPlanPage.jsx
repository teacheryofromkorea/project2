import { useEffect, useState } from "react";
import SeatEditorGrid from "./SeatEditorGrid";
import StudentListPanel from "./StudentListPanel";
import StudentSelectModal from "./StudentSelectModal";
import { supabase } from "../../../lib/supabaseClient";

function SeatingPlanPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [totalCols, setTotalCols] = useState(0);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [seatForAssign, setSeatForAssign] = useState(null);
  const [seatToClear, setSeatToClear] = useState(null);
  const [hoveredStudentId, setHoveredStudentId] = useState(null);
  const [isGroupEditMode, setIsGroupEditMode] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [studentRefreshKey, setStudentRefreshKey] = useState(0);

  useEffect(() => {
    if (!seatToClear) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSeatToClear(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [seatToClear]);

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("classroom_settings")
        .select("total_rows, total_cols")
        .limit(1)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setTotalRows(data.total_rows);
      setTotalCols(data.total_cols);
      setLoadingSettings(false);
    };

    loadSettings();
  }, []);

  const toggleSeatSelect = (seatId) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* (공간 확보) 상단 타이틀/설명 제거 */}

      {/* 메인 레이아웃 */}
      <div className="flex gap-6">
        {/* 좌측: 학생 목록(미배치 학생) */}
        <div className="w-72 shrink-0 rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-3">학생 목록</h2>
          <StudentListPanel
            refreshKey={studentRefreshKey}
            hoveredStudentId={hoveredStudentId}
            onStudentHover={(studentId) => setHoveredStudentId(studentId)}
            onStudentHoverOut={() => setHoveredStudentId(null)}
          />
        </div>

        {/* 우측: 좌석 미니맵 */}
        <div className="flex-1 rounded-2xl border bg-white p-3 flex flex-col gap-3">
          {/* 칠판 영역 */}
          <div className="h-10 rounded-lg bg-emerald-900 flex items-center justify-between px-4">
            <span className="text-emerald-100 text-sm font-semibold tracking-wide">
              칠판
            </span>

            <label className="flex items-center gap-2 text-emerald-100 text-xs cursor-pointer">
              <span>모둠 편집</span>
              <input
                type="checkbox"
                checked={isGroupEditMode}
                onChange={(e) => {
                  setIsGroupEditMode(e.target.checked);
                  setSelectedSeatIds([]);
                }}
                className="accent-emerald-400"
              />
            </label>
          </div>

          {/* 좌석 배치 */}
          <SeatEditorGrid
            key={refreshKey}
            previewRows={totalRows}
            previewCols={totalCols}
            hoveredStudentId={hoveredStudentId}
            isGroupEditMode={isGroupEditMode}
            selectedSeatIds={selectedSeatIds}
            onToggleSeatSelect={toggleSeatSelect}
            onSeatEmptyClick={(seat) => {
              if (!isGroupEditMode) setSeatForAssign(seat);
            }}
            onSeatOccupiedClick={(seat) => {
              if (!isGroupEditMode) setSeatToClear(seat);
            }}
            onSeatHover={(studentId) => setHoveredStudentId(studentId)}
            onSeatHoverOut={() => setHoveredStudentId(null)}
          />
          {isGroupEditMode && selectedSeatIds.length > 0 && (
            <div className="sticky bottom-0 mt-3 rounded-xl border bg-indigo-50 px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-semibold text-indigo-700">
                선택 좌석 {selectedSeatIds.length}개
              </span>

              <input
                type="text"
                placeholder="모둠명 (A, 1조 등)"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                className="px-3 py-1.5 rounded-md border text-sm w-32"
              />

              <button
                disabled={!groupNameInput}
                onClick={async () => {
                  const ok = window.confirm(
                    `선택한 ${selectedSeatIds.length}개 좌석을 '${groupNameInput}' 모둠으로 지정할까요?`
                  );
                  if (!ok) return;

                  const { error } = await supabase
                    .from("classroom_seats")
                    .update({ group_name: groupNameInput })
                    .in("id", selectedSeatIds);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setGroupNameInput("");
                  setSelectedSeatIds([]);
                  setRefreshKey((k) => k + 1);
                }}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                모둠 지정
              </button>

              <button
                onClick={async () => {
                  const ok = window.confirm(
                    `선택한 ${selectedSeatIds.length}개 좌석의 모둠을 해제할까요?`
                  );
                  if (!ok) return;

                  const { error } = await supabase
                    .from("classroom_seats")
                    .update({ group_name: null })
                    .in("id", selectedSeatIds);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setSelectedSeatIds([]);
                  setRefreshKey((k) => k + 1);
                }}
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition"
              >
                해제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 행/열 설정 (아래로 내림) */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">행</span>
          <input
            type="number"
            min={1}
            value={totalRows}
            onChange={(e) => setTotalRows(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded border text-sm"
            disabled={loadingSettings}
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">열</span>
          <input
            type="number"
            min={1}
            value={totalCols}
            onChange={(e) => setTotalCols(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded border text-sm"
            disabled={loadingSettings}
          />
        </div>

        <button
          disabled={loadingSettings}
          onClick={async () => {
            const newTotalRows = totalRows;
            const newTotalCols = totalCols;

            if (newTotalRows < totalRows || newTotalCols < totalCols) {
              const ok = window.confirm(
                `행 또는 열을 줄이면
범위를 벗어난 좌석의 학생은
미배치 상태가 됩니다.

계속할까요?`
              );
              if (!ok) return;
            }

            const { data: settingsRow, error: fetchError } = await supabase
              .from("classroom_settings")
              .select("id, total_rows, total_cols")
              .limit(1)
              .single();

            if (fetchError) {
              console.error(fetchError);
              return;
            }

            const { data: seats, error: seatsError } = await supabase
              .from("classroom_seats")
              .select("id, row, col, student_id");

            if (seatsError) {
              console.error(seatsError);
              return;
            }

            const outOfRangeSeatIds = seats
              .filter(
                (s) => s.row > newTotalRows || s.col > newTotalCols
              )
              .map((s) => s.id);

            await supabase
              .from("classroom_seats")
              .update({ student_id: null })
              .or(`row.gt.${newTotalRows},col.gt.${newTotalCols}`);

            if (outOfRangeSeatIds.length > 0) {
              const { error: deleteError } = await supabase
                .from("classroom_seats")
                .delete()
                .in("id", outOfRangeSeatIds);

              if (deleteError) {
                console.error(deleteError);
                return;
              }
            }

            const existingKeySet = new Set(seats.map(s => `${s.row}-${s.col}`));
            const newSeats = [];
            for (let r = 1; r <= newTotalRows; r++) {
              for (let c = 1; c <= newTotalCols; c++) {
                if (!existingKeySet.has(`${r}-${c}`)) {
                  newSeats.push({ row: r, col: c, label: `${r}-${c}` });
                }
              }
            }
            if (newSeats.length > 0) {
              await supabase.from("classroom_seats").insert(newSeats);
            }

            await supabase
              .from("classroom_settings")
              .update({ total_rows: newTotalRows, total_cols: newTotalCols })
              .eq("id", settingsRow.id);

            setRefreshKey((k) => k + 1);
            setStudentRefreshKey((k) => k + 1);
          }}
          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          적용
        </button>
      </div>

      {/* 학생 배치 모달 */}
      {seatForAssign && (
        <StudentSelectModal
          seat={seatForAssign}
          onClose={() => setSeatForAssign(null)}
          onAssigned={() => {
            setSeatForAssign(null);
            setRefreshKey((k) => k + 1);
            setStudentRefreshKey((k) => k + 1); // ⭐ 학생 목록 갱신 신호
          }}
        />
      )}

      {seatToClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setSeatToClear(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white shadow-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-3 text-center">
              자리 비우기
            </h3>

            <p className="text-sm text-gray-600 text-center mb-4">
              <span className="font-medium text-gray-800">
                {seatToClear.students?.number}번 {seatToClear.students?.name}
              </span>
              <br />
              학생의 자리를 비울까요?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSeatToClear(null)}
                className="px-3 py-1.5 rounded-md text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  const { error } = await supabase
                    .from("classroom_seats")
                    .update({ student_id: null })
                    .eq("id", seatToClear.id);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setSeatToClear(null);
                  setRefreshKey((k) => k + 1);
                  setStudentRefreshKey((k) => k + 1); // ⭐ 학생 목록 갱신 신호
                }}
                className="px-3 py-1.5 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 transition"
              >
                자리 비우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatingPlanPage;