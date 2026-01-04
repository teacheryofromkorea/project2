import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
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
        ${completed
                    ? "bg-emerald-500 border-emerald-700 text-white shadow-md scale-110"
                    : "bg-white border-gray-300 text-gray-400 hover:scale-105"
                }
      `}
        >
            {completed ? "✅" : "❌"}
        </button>
    );
}

function EndTaskModal({
    isOpen,
    onClose,
    onSaved,
    student,
    routines = [],
    missions = [],
    routineLabel = "하교시간 루틴", // 기본 라벨
}) {
    const [routineStatus, setRoutineStatus] = useState({});
    const [missionStatus, setMissionStatus] = useState({});
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (isOpen) {
            setRoutineStatus({});
            setMissionStatus({});
            setLoaded(false);
        }
    }, [isOpen]);

    // ✅ 루틴/미션 상태 불러오기
    useEffect(() => {
        if (isOpen === false || !student) return;

        const fetchStatus = async () => {
            // ------------------------------
            // 1) 루틴 상태 불러오기 (End 전용)
            // ------------------------------
            let routineMap = {};

            if (routines.length > 0) {
                const { data: routineRows } = await supabase
                    .from("student_end_routine_status")
                    .select("*")
                    .eq("student_id", student.id)
                    .eq("date", today);

                // 화면에 있는 루틴들을 먼저 모두 false 로 초기화
                routines.forEach((r) => {
                    routineMap[r.id] = false;
                });

                // DB에 저장된 상태 반영
                routineRows?.forEach((row) => {
                    // routine_item_id가 있으면 사용, 없으면 routine_id 시도 (안전장치)
                    const itemId = row.routine_item_id || row.routine_id;
                    if (itemId) {
                        routineMap[itemId] = row.completed;
                    }
                });
            }

            setRoutineStatus(routineMap);

            // ------------------------------
            // 2) 미션 상태 불러오기 (공통)
            // ------------------------------
            const { data: missionRows } = await supabase
                .from("student_mission_status")
                .select("*")
                .eq("student_id", student.id)
                .eq("date", today);

            const missionMap = {};
            missions.forEach((m) => {
                missionMap[m.id] = false;
            });
            missionRows?.forEach((row) => {
                missionMap[row.mission_id] = row.completed;
            });

            setMissionStatus(missionMap);
            setLoaded(true);
        };

        fetchStatus();
    }, [isOpen, student, routines, missions]);

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

    // ✅ 먼저 계산
    const totalCount = routines.length + missions.length;

    const completedRoutineCount = routines.filter(
        (r) => routineStatus[r.id]
    ).length;

    const completedMissionCount = missions.filter(
        (m) => missionStatus[m.id]
    ).length;

    const completedCount = completedRoutineCount + completedMissionCount;

    // 🎉 모든 루틴+미션 완료 시 폭죽 효과
    useEffect(() => {
        if (!loaded) return;

        if (totalCount > 0 && completedCount === totalCount) {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.7 },
            });
        }
    }, [loaded, completedCount, totalCount]);

    if (typeof isOpen !== "undefined" && !isOpen) return null;
    if (!student) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="
          bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl
          w-full max-w-3xl
          max-h-[80vh] h-[80vh]
          flex flex-col
          overflow-hidden
          p-8 border border-white/60
        "
            >
                {/* 제목 */}
                <h2 className="text-xl font-bold mb-2 flex items-center justify-between">
                    <span>🎯 {student.name} 학생 하교시간 도전</span>
                    {loaded && totalCount > 0 && completedCount === totalCount && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm animate-bounce">
                            🏅 완료!
                        </span>
                    )}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    하교 전 할 일을 모두 마치고 조심히 귀가하세요! 🏠
                </p>

                {/* Progress bar */}
                <div className="mb-6 bg-gray-200/70 rounded-full h-3 w-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 h-3 rounded-full transition-all duration-500"
                        style={{
                            width: `${!loaded || totalCount === 0
                                ? 0
                                : Math.round((completedCount / totalCount) * 100)
                                }%`,
                        }}
                    ></div>
                </div>

                {loaded && totalCount > 0 && completedCount === totalCount && (
                    <div className="mb-4 p-3 rounded-2xl bg-green-100 text-green-700 font-semibold flex items-center space-x-2 animate-pulse">
                        <span>🎉</span>
                        <span>오늘 할 일을 모두 완료했어요!</span>
                        <span>🏅</span>
                    </div>
                )}

                <div className="flex-grow min-h-0 overflow-y-auto pr-2 grid grid-cols-2 gap-6">
                    {/* ---------------------- 좌측: 루틴 체크 ---------------------- */}
                    <div className="bg-white/70 rounded-2xl p-4 shadow-sm border border-white/60">
                        <h3 className="font-semibold mb-3 text-black-700">
                            🧭 {routineLabel}
                        </h3>
                        <ul className="space-y-2">
                            {routines.map((r) => (
                                <li key={r.id} className="flex items-center justify-between gap-2">
                                    <span
                                        className={`text-lg ${routineStatus[r.id]
                                            ? "text-emerald-700 font-semibold line-through"
                                            : "text-black-700"
                                            }`}
                                    >
                                        {/* 하교 루틴은 'text' 컬럼 사용 */}
                                        {r.text ?? r.content}
                                    </span>
                                    <StampButton
                                        completed={!!routineStatus[r.id]}
                                        onToggle={() =>
                                            setRoutineStatus((prev) => ({
                                                ...prev,
                                                [r.id]: !prev[r.id],
                                            }))
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ---------------------- 우측: 오늘의 미션 체크 ---------------------- */}
                    <div className="bg-white/70 rounded-2xl p-4 shadow-sm border border-white/60">
                        <h3 className="font-semibold mb-3 text-black-700">
                            🔥 {missions?.[0]?.mission_title || "오늘의 미션"}
                        </h3>

                        <ul className="space-y-2">
                            {missions.map((m) => (
                                <li key={m.id} className="flex items-center justify-between gap-2">
                                    <span
                                        className={`text-lg ${missionStatus[m.id]
                                            ? "text-purple-700 font-semibold line-through"
                                            : "text-black-700"
                                            }`}
                                    >
                                        {m.text}
                                    </span>
                                    <StampButton
                                        completed={!!missionStatus[m.id]}
                                        onToggle={() =>
                                            setMissionStatus((prev) => ({
                                                ...prev,
                                                [m.id]: !prev[m.id],
                                            }))
                                        }
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
                            if (saving) return; // 중복 클릭 방지
                            setSaving(true); // 저장 시작

                            try {
                                // -----------------------------
                                // 1) 루틴 저장 (End 전용)
                                // -----------------------------
                                if (routines.length > 0) {
                                    // 오늘 이 학생의 루틴 상태 모두 삭제 후 재삽입
                                    await supabase
                                        .from("student_end_routine_status")
                                        .delete()
                                        .eq("student_id", student.id)
                                        .eq("date", today);

                                    const routineInserts = Object.entries(routineStatus).map(
                                        ([rid, completed]) => ({
                                            student_id: student.id,
                                            routine_item_id: rid, // routine_item_id 컬럼 사용
                                            completed,
                                            date: today,
                                        })
                                    );

                                    const { error } = await supabase
                                        .from("student_end_routine_status")
                                        .insert(routineInserts);

                                    if (error) throw error;
                                }

                                // -----------------------------
                                // 2) 미션 저장 (공통)
                                // -----------------------------
                                await supabase
                                    .from("student_mission_status")
                                    .delete()
                                    .eq("student_id", student.id)
                                    .eq("date", today);

                                const missionInserts = Object.entries(missionStatus).map(
                                    ([mid, completed]) => ({
                                        student_id: student.id,
                                        mission_id: mid,
                                        completed,
                                        date: today,
                                    })
                                );

                                if (missionInserts.length > 0) {
                                    const { error: missionError } = await supabase
                                        .from("student_mission_status")
                                        .insert(missionInserts);

                                    if (missionError) throw missionError;
                                }

                                onClose();
                                if (onSaved) await onSaved();

                            } catch (error) {
                                console.error("하교 루틴 저장 실패:", error);
                                alert("저장에 실패했습니다. 관리자에게 문의하세요:\\n" + (error.message || JSON.stringify(error)));
                            } finally {
                                setSaving(false);
                            }
                        }}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EndTaskModal;
