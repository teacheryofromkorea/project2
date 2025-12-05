import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TodayChallengeSidebar({
  students = [],
  missions = [],
  studentMissionStatus = [],
  onOpenModal,
}) {
  const [incompleteStudents, setIncompleteStudents] = useState([]);

  useEffect(() => {
    // 미완료 기준: 미션을 하나라도 미완료한 학생
    const allMissionIds = missions.map((m) => m.id);

    const calc = students.filter((student) => {
      // 오늘 완료한 미션들
      const done = studentMissionStatus
        .filter(
          (row) => row.student_id === student.id && row.completed === true
        )
        .map((row) => row.mission_id);

      // 하나라도 미완료(true)면 포함
      return allMissionIds.some((id) => !done.includes(id));
    });

    setIncompleteStudents(calc);
  }, [students, missions, studentMissionStatus]);

  return (
    <div className="bg-white/70 rounded-2xl shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">🚀 오늘의 도전</h3>
        <span className="text-xs text-gray-500">
          미완료 {incompleteStudents.length}명
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-1">
        아직 오늘의 미션을 다 끝내지 못한 친구들이에요.
      </p>

      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {incompleteStudents.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            모두 완료했어요! 🎉
          </div>
        ) : (
          incompleteStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => onOpenModal && onOpenModal(student)}
            >
              <span className="font-semibold text-gray-800">
                {student.name}
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