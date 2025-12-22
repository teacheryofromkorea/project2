import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TodayChallengeSidebar({
  students = [],
  missions = [],
  studentMissionStatus = [],
  routineItems = [],
  studentBreakRoutineStatus = [],
  onOpenModal,
  mode = "break",
}) {
  const getRoutineRowMatchId = (row) =>
    mode === "break" ? row.routine_id : row.routine_item_id;

  const [incompleteStudents, setIncompleteStudents] = useState([]);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  useEffect(() => {
    // 미완료 기준: 미션을 하나라도 미완료한 학생
    const calc = students.filter((student) => {
      const today = new Date().toISOString().slice(0, 10);

      // ⭐ 미완료 미션
      const incompleteMissions = missions.some((m) => {
        const done = studentMissionStatus.some(
          (row) =>
            row.student_id === student.id &&
            row.mission_id === m.id &&
            row.date === today &&
            row.completed === true
        );
        return !done;
      });

      // ⭐ 미완료 쉬는시간 루틴
      const incompleteBreakRoutines = routineItems.some((r) => {
        const done = studentBreakRoutineStatus.some(
          (row) =>
            row.student_id === student.id &&
            getRoutineRowMatchId(row) === r.id &&
            row.date === today &&
            row.completed === true
        );
        return !done;
      });

      // ⭐ 둘 중 하나라도 미완료면 "미실시자"
      return incompleteMissions || incompleteBreakRoutines;
    });

    setIncompleteStudents(calc);
  }, [students, missions, studentMissionStatus, routineItems, studentBreakRoutineStatus, mode]);

  return (
    // ⬇️ 여기의 클래스 이름을 변경했습니다. 80vh -> 85vh
    <div className="bg-white/70 rounded-2xl shadow p-4 flex flex-col gap-3 max-h-[85vh] h-[85vh] overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">🚀 오늘의 도전</h3>
        <button
          className={`relative px-3 py-1 text-xs rounded-full ${showIncompleteOnly ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-600`}
          onClick={() => setShowIncompleteOnly(prev => !prev)}
        >
          <span>{showIncompleteOnly ? "전체 보기" : "미실시자만 보기"}</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
            {incompleteStudents.length}
          </span>
        </button>
      </div>


      <div className="space-y-2 flex-grow min-h-0 overflow-y-auto">
        {(showIncompleteOnly ? incompleteStudents : students).length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            모두 완료했어요! 🎉
          </div>
        ) : (
          (showIncompleteOnly ? incompleteStudents : students).map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => onOpenModal && onOpenModal(student)}
            >
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                {student.name}
                {showIncompleteOnly && (
<span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
  {
    (() => {
      const today = new Date().toISOString().slice(0, 10);

      // ⭐ 미완료 미션
      const incompleteMissions = missions.filter((m) => {
        const done = studentMissionStatus.some(
          (row) =>
            row.student_id === student.id &&
            row.mission_id === m.id &&
            row.completed === true &&
            row.date === today
        );
        return !done;
      }).length;

      // ⭐ 미완료 쉬는시간 루틴 (오늘 날짜 기준)
      const incompleteRoutines = routineItems.filter((r) => {
        const done = studentBreakRoutineStatus.some(
          (row) =>
            row.student_id === student.id &&
            getRoutineRowMatchId(row) === r.id &&
            row.completed === true &&
            row.date === today
        );
        return !done;
      }).length;

      return incompleteMissions + incompleteRoutines;
    })()
  }
</span>
                )}
              </span>
              <button className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs">
                미션
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
