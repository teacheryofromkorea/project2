import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ClassTimeBoard from "./ClassTimeBoard";
import ClassStudentPanel from "./ClassStudentPanel";
import useClassTimeBlockSelection from "../../hooks/useClassTimeBlockSelection";
import ClassResourceBoard from "./ClassResourceBoard";

function ClassPage() {
  const [classBlocks, setClassBlocks] = useState([]);
  const [students, setStudents] = useState([]); // TODO: 다음 단계(C)에서 students 테이블 fetch 연결

  // 🔹 교시별 상점 상태 (key: studentId, value: 상점 개수)
  const [periodPoints, setPeriodPoints] = useState({});

  // 🔹 수업 중 선택된 학생들 (다중 선택)
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // 🔹 toast 메시지
  const [toast, setToast] = useState(null);

  // 🔹 현재 선택된 수업 교시 (ClassTimeBoard의 source of truth)
  const {
    selectedClassBlockId,
    selectedClassBlock,
    selectClassBlockManually,
  } = useClassTimeBlockSelection(classBlocks);

  // 🔹 교시가 바뀌면 상점 초기화 (진짜 기준)
  useEffect(() => {
    if (!selectedClassBlockId) return;
    setPeriodPoints({});
  }, [selectedClassBlockId]);

  // 🔹 교시 변경 시 학생 선택도 초기화
  useEffect(() => {
    setSelectedStudentIds(new Set());
  }, [selectedClassBlockId]);

  // 🔹 상점 증가 함수 (개별)
  const addPoint = (studentId) => {
    setPeriodPoints((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) + 1,
    }));
  };

  // 🔹 벌점 감소 함수 (개별만 허용)
  const removePoint = (studentId) => {
    setPeriodPoints((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) - 1,
    }));
  };

  // 🔹 선택 학생 일괄 상점 지급 (선택 없으면 전체 학생)
  const addPointBulk = () => {
    const targetStudentIds =
      selectedStudentIds.size > 0
        ? Array.from(selectedStudentIds)
        : students.map((s) => s.id);

    if (targetStudentIds.length === 0) return;

    setPeriodPoints((prev) => {
      const next = { ...prev };
      targetStudentIds.forEach((id) => {
        next[id] = (next[id] || 0) + 1;
      });
      return next;
    });
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // 🔹 이 교시 상점 누적 저장 (D-3)
  const savePeriodPoints = async () => {
    if (!selectedClassBlockId) {
      showToast("저장할 수업 교시가 없습니다.", "error");
      return;
    }

    const entries = Object.entries(periodPoints)
      .filter(([, point]) => point !== 0)
      .map(([studentId, point]) => ({
        student_id: studentId,
        class_block_id: selectedClassBlockId,
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        delta: point,
        reason: "수업 상점",
      }));

    if (entries.length === 0) {
      showToast("저장할 상점이 없습니다.", "error");
      return;
    }

    const { error } = await supabase
      .from("student_point_history")
      .insert(entries);

    if (error) {
      console.error("상점 저장 오류:", error);
      showToast("상점 저장 중 오류가 발생했습니다.", "error");
      return;
    }

    showToast("이 교시 상점이 저장되었습니다.", "success");

    // 상태 초기화
    setPeriodPoints({});
    setSelectedStudentIds(new Set());
  };

  // 수업시간 block 불러오기 (time_blocks 중 block_type === "class")
  useEffect(() => {
    const fetchClassBlocks = async () => {
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .eq("block_type", "class")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("수업시간 block 불러오기 실패", error);
        return;
      }

      setClassBlocks(data || []);
    };

    fetchClassBlocks();
  }, []);

  // 학생 목록 불러오기
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("number", { ascending: true });

      if (error) {
        console.error("학생 목록 불러오기 실패", error);
        return;
      }

      setStudents(data || []);
    };

    fetchStudents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6  space-y-6">


      {/* 수업시간 선택 */}
      <ClassTimeBoard
        classBlocks={classBlocks}
        selectedClassBlockId={selectedClassBlockId}
        onSelectClassBlock={selectClassBlockManually}
      />

      {/* 메인 수업 화면 */}
      <div className="grid grid-cols-12 gap-6 min-h-[520px]">
        {/* 좌측: 학생 리스트 */}
        <div className="col-span-3 bg-white/70 rounded-2xl shadow p-4">
          <ClassStudentPanel
            students={students}
            periodPoints={periodPoints}
            onAddPoint={addPoint}
            onRemovePoint={removePoint}
            selectedStudentIds={selectedStudentIds}
            onToggleSelect={toggleStudentSelection}
          />
        </div>

        {/* 중앙: 수업 콘텐츠 */}
        <div className="col-span-6 bg-white/70 rounded-2xl shadow p-4">
          <ClassResourceBoard />
        </div>

        {/* 우측: 수업 도구 */}
        <div className="col-span-3 bg-white/70 rounded-2xl shadow p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
            🧰 수업 도구
          </h3>

          <button
            onClick={addPointBulk}
            disabled={students.length === 0}
            className={`w-full py-2 rounded-lg text-sm font-semibold
              ${
                students.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
          >
            {selectedStudentIds.size > 0
              ? "선택 학생 상점 +1"
              : "전체 학생 상점 +1"}
          </button>

          <button
            onClick={savePeriodPoints}
            disabled={Object.keys(periodPoints).length === 0}
            className={`w-full py-2 rounded-lg text-sm font-semibold
              ${
                Object.keys(periodPoints).length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
          >
            이 교시 상점 저장
          </button>

          <p className="text-xs text-gray-400">
            현재 교시에서 지급된 상점을 누적 기록으로 저장합니다.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow text-sm
            ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-gray-900 text-white"
            }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ClassPage;
