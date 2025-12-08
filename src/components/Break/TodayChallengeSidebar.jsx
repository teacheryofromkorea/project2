import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TodayChallengeSidebar({
  students = [],
  missions = [],
  studentMissionStatus = [],
  onOpenModal,
}) {
  const [incompleteStudents, setIncompleteStudents] = useState([]);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

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

      <p className="text-xs text-gray-500 mb-1">
        아직 오늘의 미션을 다 끝내지 못한 친구들이에요.
      </p>

      <div className="space-y-2 h-auto overflow-y-auto">
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
                      missions.filter((m) => {
                        const done = studentMissionStatus.some(
                          (row) =>
                            row.student_id === student.id &&
                            row.mission_id === m.id &&
                            row.completed === true
                        );
                        return !done;
                      }).length
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