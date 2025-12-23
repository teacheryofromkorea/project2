import { useState, useEffect } from "react";
import SeatEditorGrid from "./SeatEditorGrid";
import StudentListPanel from "./StudentListPanel";
import { supabase } from "../../../lib/supabaseClient";

function SeatingPlanPage() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [totalCols, setTotalCols] = useState(0);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [groupInput, setGroupInput] = useState("");

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
  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">🪑 자리 배치 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          교실 좌석 배치와 학생 자리를 설정하는 화면입니다.
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4 p-4 rounded-xl border bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">행</span>
          <input
            type="number"
            min={1}
            value={totalRows}
            onChange={(e) => setTotalRows(Number(e.target.value))}
            className="w-20 px-2 py-1 rounded border text-sm"
            disabled={loadingSettings}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">열</span>
          <input
            type="number"
            min={1}
            value={totalCols}
            onChange={(e) => setTotalCols(Number(e.target.value))}
            className="w-20 px-2 py-1 rounded border text-sm"
            disabled={loadingSettings}
          />
        </div>

        <button
          disabled={loadingSettings}
          onClick={async () => {
            const ok = window.confirm(
              "교실 구조를 변경하면 기존 좌석과 배정이 모두 초기화됩니다.\n계속할까요?"
            );
            if (!ok) return;

            // 1) get settings row id
            const { data: settingsRow, error: fetchError } = await supabase
              .from("classroom_settings")
              .select("id")
              .limit(1)
              .single();

            if (fetchError) {
              console.error(fetchError);
              return;
            }

            // 2) update settings with WHERE clause
            const { error: updateError } = await supabase
              .from("classroom_settings")
              .update({
                total_rows: totalRows,
                total_cols: totalCols,
              })
              .eq("id", settingsRow.id);

            if (updateError) {
              console.error(updateError);
              return;
            }

            // 2) delete all existing seats
            const { error: deleteError } = await supabase
              .from("classroom_seats")
              .delete()
              .neq("id", "00000000-0000-0000-0000-000000000000");

            if (deleteError) {
              console.error(deleteError);
              return;
            }

            // 3) recreate seats
            const newSeats = [];
            for (let r = 1; r <= totalRows; r++) {
              for (let c = 1; c <= totalCols; c++) {
                newSeats.push({
                  row: r,
                  col: c,
                  label: `${r}-${c}`,
                });
              }
            }

            const { error: insertError } = await supabase
              .from("classroom_seats")
              .insert(newSeats);

            if (insertError) {
              console.error(insertError);
              return;
            }

            // 4) refresh UI
            setSelectedSeats([]);
            setSelectedStudent(null);
            setRefreshKey((k) => k + 1);
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          적용
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            // find next position: append to the max col of the last row
            const { data, error } = await supabase
              .from("classroom_seats")
              .select("row, col")
              .order("row", { ascending: false })
              .order("col", { ascending: false })
              .limit(1);

            if (error) {
              console.error(error);
              return;
            }

            const nextRow = data?.[0]?.row ?? 1;
            const nextCol = (data?.[0]?.col ?? 0) + 1;

            const { error: insertError } = await supabase
              .from("classroom_seats")
              .insert({
                row: nextRow,
                col: nextCol,
                label: `${nextRow}-${nextCol}`,
              });

            if (insertError) {
              console.error(insertError);
              return;
            }

            setRefreshKey((k) => k + 1);
          }}
          className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          좌석 추가
        </button>
      </div>

      {/* 메인 레이아웃 */}
      <div className="flex gap-6">
        {/* 좌측: 학생 목록 영역 */}
        <div className="w-72 shrink-0 rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-3">학생 목록</h2>

          <StudentListPanel
            onStudentSelect={(student) => {
              setSelectedStudent(student);
            }}
          />

          {selectedStudent && (
            <div className="mt-4 text-xs text-gray-500">
              선택된 학생: {selectedStudent.name}
            </div>
          )}
        </div>

        {/* 우측: 좌석 배치 영역 */}
        <div className="flex-1 rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-3">좌석 배치</h2>

          <SeatEditorGrid
            key={refreshKey}
            totalCols={totalCols}
            onSeatSelect={(seats) => {
              setSelectedSeats(seats);
            }}
          />

          {selectedSeats.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700">
              🟦 선택됨: {selectedSeats.length}개 좌석
            </div>
          )}

          {selectedSeats.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="모둠 이름 (A, B, 1조 등)"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && groupInput) {
                    e.preventDefault();
                    document.getElementById("group-apply-btn")?.click();
                  }
                }}
                className="px-3 py-2 rounded-lg border text-sm w-44"
              />

              <button
                id="group-apply-btn"
                disabled={!groupInput}
                onClick={async () => {
                  const ok = window.confirm(
                    `선택한 ${selectedSeats.length}개 좌석을 '${groupInput}' 모둠으로 지정할까요?`
                  );
                  if (!ok) return;

                  const ids = selectedSeats.map((s) => s.id);

                  const { error } = await supabase
                    .from("classroom_seats")
                    .update({ group_name: groupInput })
                    .in("id", ids);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setGroupInput("");
                  setSelectedSeats([]);
                  setRefreshKey((k) => k + 1);
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                모둠 지정
              </button>

              <button
                onClick={async () => {
                  const ok = window.confirm(
                    `선택한 ${selectedSeats.length}개 좌석의 모둠을 해제할까요?`
                  );
                  if (!ok) return;

                  const ids = selectedSeats.map((s) => s.id);

                  const { error } = await supabase
                    .from("classroom_seats")
                    .update({ group_name: null })
                    .in("id", ids);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setSelectedSeats([]);
                  setRefreshKey((k) => k + 1);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition"
              >
                모둠 해제
              </button>

              <button
                onClick={async () => {
                  const ok = window.confirm(
                    `⚠️ 선택한 ${selectedSeats.length}개의 좌석을 삭제합니다.\n이 작업은 되돌릴 수 없습니다.\n정말 삭제할까요?`
                  );
                  if (!ok) return;

                  const ids = selectedSeats.map((s) => s.id);

                  const { error } = await supabase
                    .from("classroom_seats")
                    .delete()
                    .in("id", ids);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setSelectedSeats([]);
                  setRefreshKey((k) => k + 1);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
              >
                선택 좌석 삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeatingPlanPage;