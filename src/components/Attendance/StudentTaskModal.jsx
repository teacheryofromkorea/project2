import React from "react";
import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

// 🔥 도장 버튼 컴포넌트
function StampButton({ completed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center font-bold
        border-2 
        transition-all duration-200
        ${
          completed
            ? "bg-emerald-500 border-emerald-700 text-white shadow-md scale-110"
            : "bg-white border-gray-300 text-gray-400 hover:scale-105"
        }
      `}
    >
      {completed ? "✅" : "❌"}
    </button>
  );
}

function StudentTaskModal({
  isOpen,
  onClose,
  onSaved,
  student,
  routines = [],
  missions = [],
  showRoutines = true
}) {

  const [routineStatus, setRoutineStatus] = useState({});
  const [missionStatus, setMissionStatus] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      // Attendance 탭: isOpen === false → 실행 안 함
      // Break 탭: isOpen undefined → 실행됨
    if (isOpen === false || !student) return;

    const fetchStatus = async () => {
      const { data: routineRows } = await supabase
        .from("student_routine_status")
        .select("*")
        .eq("student_id", student.id)
        .eq("date", today);

// ---- 루틴 상태 불러오기 (기본값 false 강제) ----
// ---- 루틴 상태 불러오기 ----
const routineMap = {};
routines.forEach((r) => {
  routineMap[r.id] = false;
});
routineRows?.forEach((row) => {
  routineMap[row.routine_id] = row.completed;
});
setRoutineStatus(routineMap);

// ---- ✨ 미션 SELECT 추가 ----
const { data: missionRows } = await supabase
  .from("student_mission_status")
  .select("*")
  .eq("student_id", student.id)
  .eq("date", today);

// ---- 미션 상태 불러오기 ----
const missionMap = {};
missions.forEach((m) => {
  missionMap[m.id] = false;
});
missionRows?.forEach((row) => {
  missionMap[row.mission_id] = row.completed;
});
setMissionStatus(missionMap);
    };

    fetchStatus();
  }, [isOpen, student]);

  // ESC key to close modal
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

// 축하 폭죽 모션

  useEffect(() => {
  const total = routines.length + missions.length;

  const completed =
    Object.values(routineStatus).filter(Boolean).length +
    Object.values(missionStatus).filter(Boolean).length;

  if (total > 0 && completed === total) {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
    });
  }
}, [routineStatus, missionStatus, routines, missions]);

  // isOpen이 명시적으로 false이면 렌더링하지 않음 (Attendance 탭용)
if (typeof isOpen !== "undefined" && !isOpen) return null;

// student가 없으면 렌더링하지 않음 (공통 보호)
if (!student) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // 배경(오버레이) 영역을 클릭했을 때만 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl p-8 border border-white/60">

        {/* 제목 */}
        <h2 className="text-xl font-bold mb-2 flex items-center justify-between">
          <span>🎯 {student.name} 학생 오늘의 도전상황</span>
          {(
            (Object.values(routineStatus).filter(Boolean).length +
              Object.values(missionStatus).filter(Boolean).length) ===
            (routines.length + missions.length)
          ) && (
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm animate-bounce">
              🏅 완료!
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          오늘 루틴과 미션을 체크해 보세요. 모두 완료하면 축하 메시지가 나타나요 🎉
        </p>

        {/* Progress bar */}
        <div className="mb-6 bg-gray-200/70 rounded-full h-3 w-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${(
                ((Object.values(routineStatus).filter(Boolean).length +
                  Object.values(missionStatus).filter(Boolean).length) /
                  (routines.length + missions.length || 1)) *
                100
              ).toFixed(0)}%`,
            }}
          ></div>
        </div>

        {(
          (Object.values(routineStatus).filter(Boolean).length +
            Object.values(missionStatus).filter(Boolean).length) ===
          (routines.length + missions.length)
        ) && (
          <div className="mb-4 p-3 rounded-2xl bg-green-100 text-green-700 font-semibold flex items-center space-x-2 animate-pulse">
            <span>🎉</span>
            <span>오늘 할 일을 모두 완료했어요!</span>
            <span>🏅</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">

          {/* ---------------------- 좌측: 루틴 체크 ---------------------- */}

{showRoutines && (
  <div className="bg-white/70 rounded-2xl p-4 shadow-sm border border-white/60">
    <h3 className="font-semibold mb-3 text-black-700">
      🧭 {routines?.[0]?.routine_title || "등교 루틴"}
    </h3>
    <ul className="space-y-2">
      {routines.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-2">
          <span
            className={`text-lg ${
              routineStatus[r.id]
                ? "text-emerald-700 font-semibold line-through"
                : "text-black-700"
            }`}
          >
            {r.text}
          </span>
          <StampButton
            completed={routineStatus[r.id]}
            onToggle={() =>
              setRoutineStatus({
                ...routineStatus,
                [r.id]: !routineStatus[r.id]
              })
            }
          />
        </li>
      ))}
    </ul>
  </div>
)}

          {/* ---------------------- 우측: 오늘의 미션 체크 ---------------------- */}
          <div className="bg-white/70 rounded-2xl p-4 shadow-sm border border-white/60">
            <h3 className="font-semibold mb-3 text-black-700">
  🔥 {missions?.[0]?.mission_title || "오늘의 미션"}
</h3>

            <ul className="space-y-2">
              {missions.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <span
                    className={`text-lg ${
                      missionStatus[m.id]
                        ? "text-purple-700 font-semibold line-through"
                        : "text-black-700"
                    }`}
                  >
                    {m.text}
                  </span>
<StampButton
  completed={missionStatus[m.id]}
  onToggle={() => setMissionStatus({ ...missionStatus, [m.id]: !missionStatus[m.id] })}
/>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-5 py-2.5 rounded-full bg-gray-200/80 text-gray-700 font-semibold hover:bg-gray-300 transition"
            onClick={onClose}
          >
            닫기
          </button>

          <button
          
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md hover:shadow-lg hover:translate-y-0.5 transition"
            disabled={saving}
            onClick={async () => {
              if (saving) return;    // 중복 클릭 방지
              setSaving(true);       // 저장 시작
              // if showRoutines is false, skip routine save entirely

              if (!showRoutines) {

                // 1) delete today's mission rows for this student
                await supabase
                  .from("student_mission_status")
                  .delete()
                  .eq("student_id", student.id)
                  .eq("date", today);

                // 2) insert current mission status
                const inserts = Object.entries(missionStatus).map(([mid, completed]) => ({
                  student_id: student.id,
                  mission_id: mid,
                  completed,
                  date: today
                }));

                if (inserts.length > 0) {
                  await supabase.from("student_mission_status").insert(inserts);
                }

                onClose();
                if (onSaved) onSaved();
                return;
              }

              // Save routines (루틴 저장 로직)
await supabase.from("student_routine_status").upsert(
  Object.entries(routineStatus).map(([rid, completed]) => ({
    student_id: student.id,
    routine_id: rid,
    completed,
    date: today
  }))
);

              // Save missions (미션 저장 로직)

              // ------------------------ Save missions (Attendance tab) ------------------------
await supabase.from("student_mission_status").upsert(
  Object.entries(missionStatus).map(([mid, completed]) => ({
    student_id: student.id,
    mission_id: mid,
    completed,
    date: today
  }))
);

              onClose();
              if (onSaved) onSaved();
              setSaving(false);
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