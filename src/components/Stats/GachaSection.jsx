import React, { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getRandomPet } from "../../constants/pets";

/**
 * 🎰 GachaSection (B-2)
 * - 티켓 ≥ 1 → 버튼 활성
 * - 클릭 시 티켓 1장 차감
 * - 이후 상위에서 students 재-fetch
 */
export default function GachaSection({
  students,
  selectedStudentId,
  selectedStudentIds,
  isMultiSelectMode,
  onStudentsUpdated,
}) {
  const [isDrawing, setIsDrawing] = useState(false);

  // 🎯 선택된 학생 계산
  const selectedStudents = useMemo(() => {
    if (isMultiSelectMode) {
      return students.filter((s) =>
        selectedStudentIds.includes(s.id)
      );
    }
    return students.filter((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId, selectedStudentIds, isMultiSelectMode]);

  const studentLabel =
    selectedStudents.length === 0
      ? "학생 없음"
      : selectedStudents.length === 1
        ? selectedStudents[0].name
        : `${selectedStudents.length}명 선택됨`;

  const totalTickets = selectedStudents.reduce(
    (sum, s) => sum + (s.gacha_tickets ?? 0),
    0
  );

  const canDraw =
    !isDrawing &&
    selectedStudents.length > 0 &&
    totalTickets > 0;

  const handleDraw = async () => {
    if (!canDraw) return;

    setIsDrawing(true);

    try {
      for (const student of selectedStudents) {
        if ((student.gacha_tickets ?? 0) <= 0) continue;

        // 1️⃣ 랜덤 펫 선택
        const pet = getRandomPet();

        // 2️⃣ 펫 지급 (student_pets insert)
        await supabase.from("student_pets").insert({
          student_id: student.id,
          pet_id: pet.id,
        });

        // 3️⃣ 가챠 티켓 차감
        await supabase
          .from("students")
          .update({
            gacha_tickets: student.gacha_tickets - 1,
          })
          .eq("id", student.id);
      }

      // 4️⃣ students 재-fetch 요청
      if (onStudentsUpdated) {
        await onStudentsUpdated();
      }
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🎰 가챠</h2>
        <span className="text-sm text-gray-500">
          {studentLabel}
        </span>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-gray-50">
          <div className="text-sm text-gray-500 mb-1">
            보유 가챠 티켓
          </div>
          <div className="text-2xl font-bold">
            {totalTickets}
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-gray-50">
          <div className="text-sm text-gray-500 mb-1">
            상태
          </div>
          <div className="text-sm font-medium text-gray-600">
            {isDrawing ? "뽑는 중..." : "대기중"}
          </div>
        </div>
      </div>

      {/* 액션 영역 */}
      <div className="flex justify-end">
        <button
          onClick={handleDraw}
          disabled={!canDraw}
          className={`px-4 py-2 rounded ${
            canDraw
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {isDrawing ? "뽑는 중..." : "가챠 뽑기"}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        ※ 현재 단계에서는 티켓 차감만 처리됩니다.
      </p>
    </section>
  );
}