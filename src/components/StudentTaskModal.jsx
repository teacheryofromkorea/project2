import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function StudentTaskModal({ isOpen, onClose, student, routines, missions }) {
  const [routineStatus, setRoutineStatus] = useState({});
  const [missionStatus, setMissionStatus] = useState({});

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!isOpen || !student) return;

    const fetchStatus = async () => {
      const { data: routineRows } = await supabase
        .from("student_routine_status")
        .select("*")
        .eq("student_id", student.id)
        .eq("date", today);

      const routineMap = {};
      routineRows?.forEach((row) => {
        routineMap[row.routine_id] = row.completed;
      });
      setRoutineStatus(routineMap);

      const { data: missionRows } = await supabase
        .from("student_mission_status")
        .select("*")
        .eq("student_id", student.id)
        .eq("date", today);

      const missionMap = {};
      missionRows?.forEach((row) => {
        missionMap[row.mission_id] = row.completed;
      });
      setMissionStatus(missionMap);
    };

    fetchStatus();
  }, [isOpen, student]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6">

        {/* 제목 */}
        <h2 className="text-xl font-bold mb-4">
          {student.name} 학생 루틴 / 미션 체크
        </h2>

        <div className="grid grid-cols-2 gap-6">

          {/* ---------------------- 좌측: 루틴 체크 ---------------------- */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">🧭 등교 루틴</h3>

            <ul className="space-y-2">
              {routines.map((r) => (
                <li key={r.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={routineStatus[r.id] || false}
                    onChange={(e) =>
                      setRoutineStatus({ ...routineStatus, [r.id]: e.target.checked })
                    }
                  />
                  <span className="text-sm">{r.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------------- 우측: 오늘의 미션 체크 ---------------------- */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">🔥 오늘의 미션</h3>

            <ul className="space-y-2">
              {missions.map((m) => (
                <li key={m.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={missionStatus[m.id] || false}
                    onChange={(e) =>
                      setMissionStatus({ ...missionStatus, [m.id]: e.target.checked })
                    }
                  />
                  <span className="text-sm">{m.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-full bg-gray-300 font-semibold"
            onClick={onClose}
          >
            닫기
          </button>

          <button
            className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold"
            onClick={async () => {
              // Save routines
              for (const rid in routineStatus) {
                const exists = await supabase
                  .from("student_routine_status")
                  .select("*")
                  .eq("student_id", student.id)
                  .eq("routine_id", rid)
                  .eq("date", today);

                if (exists.data && exists.data.length > 0) {
                  await supabase
                    .from("student_routine_status")
                    .update({ completed: routineStatus[rid] })
                    .eq("id", exists.data[0].id);
                } else {
                  await supabase.from("student_routine_status").insert({
                    student_id: student.id,
                    routine_id: rid,
                    completed: routineStatus[rid],
                    date: today,
                  });
                }
              }

              // Save missions
              for (const mid in missionStatus) {
                const exists = await supabase
                  .from("student_mission_status")
                  .select("*")
                  .eq("student_id", student.id)
                  .eq("mission_id", mid)
                  .eq("date", today);

                if (exists.data && exists.data.length > 0) {
                  await supabase
                    .from("student_mission_status")
                    .update({ completed: missionStatus[mid] })
                    .eq("id", exists.data[0].id);
                } else {
                  await supabase.from("student_mission_status").insert({
                    student_id: student.id,
                    mission_id: mid,
                    completed: missionStatus[mid],
                    date: today,
                  });
                }
              }

              onClose();
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentTaskModal;