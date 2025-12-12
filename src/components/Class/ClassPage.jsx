import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ClassTimeBoard from "./ClassTimeBoard";
import ClassStudentPanel from "./ClassStudentPanel";
import useClassTimeBlockSelection from "../../hooks/useClassTimeBlockSelection";

function ClassPage() {
  const [classBlocks, setClassBlocks] = useState([]);
  const [students, setStudents] = useState([]); // TODO: 다음 단계(C)에서 students 테이블 fetch 연결

  // 🔹 교시별 상점 상태 (key: studentId, value: 상점 개수)
  const [periodPoints, setPeriodPoints] = useState({});

  // 🔹 수업 중 선택된 학생들 (다중 선택)
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

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

  // 🔹 상점 증가 함수 (D-2단계에서 사용)
  const addPoint = (studentId) => {
    setPeriodPoints((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) + 1,
    }));
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  // 🔹 이 교시 상점 누적 저장 (D-3)
  const savePeriodPoints = async () => {
    if (!selectedClassBlockId) {
      alert("저장할 수업 교시가 없습니다.");
      return;
    }

    const entries = Object.entries(periodPoints)
      .filter(([, point]) => point > 0)
      .map(([studentId, point]) => ({
        student_id: studentId,
        class_block_id: selectedClassBlockId,
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        delta: point,
        reason: "수업 상점",
      }));

    if (entries.length === 0) {
      alert("저장할 상점이 없습니다.");
      return;
    }

    const { error } = await supabase
      .from("student_point_history")
      .insert(entries);

    if (error) {
      console.error("상점 저장 오류:", error);
      alert("상점 저장 중 오류가 발생했습니다.");
      return;
    }

    alert("이 교시 상점이 저장되었습니다.");

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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">📚 수업 시간 모드</h1>
        <p className="text-gray-600 text-sm">
          수업시간 block 선택 로직 테스트 화면입니다.
        </p>
      </div>

      {/* 🔹 수업시간 선택 / 상태 */}
      <ClassTimeBoard
        classBlocks={classBlocks}
        selectedClassBlockId={selectedClassBlockId}
        onSelectClassBlock={selectClassBlockManually}
      />

      {/* 🔹 실제 수업시간 UI 골격 */}
      <div className="grid grid-cols-12 gap-4 mt-6 min-h-[420px]">
        {/* 좌측: 학생 리스트 영역 */}
        <div className="col-span-3">
          <ClassStudentPanel
            students={students}
            periodPoints={periodPoints}
            onAddPoint={addPoint}
            selectedStudentIds={selectedStudentIds}
            onToggleSelect={toggleStudentSelection}
          />
        </div>

        {/* 중앙: 수업 콘텐츠 영역 */}
        <div className="col-span-6 bg-white/70 rounded-2xl shadow p-4 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            📖 수업 콘텐츠
          </h3>
          <p className="text-xs text-gray-400 text-center">
            PDF / 이미지 / iframe 수업자료 표시 영역
          </p>
        </div>

        {/* 우측: 수업 도구 패널 */}
        <div className="col-span-3 bg-white/70 rounded-2xl shadow p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            🧰 수업 도구
          </h3>

          <button
            onClick={savePeriodPoints}
            className="w-full py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
          >
            이 교시 상점 저장
          </button>

          <p className="text-xs text-gray-400">
            현재 교시에서 지급된 상점을 누적 기록으로 저장합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClassPage;