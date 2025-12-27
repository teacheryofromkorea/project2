import React, { useMemo } from "react";
import { getPetById } from "../../constants/pets";

/**
 * 🐾 PetCollectionSection (C-1.6)
 * - 학생이 보유한 펫 목록 렌더링
 * - 단일 / 다중 선택 대응
 * - C-1 단계: 단순 카드 UI
 */
export default function PetCollectionSection({
  students,
  selectedStudentId,
  selectedStudentIds,
  isMultiSelectMode,
}) {
  // 🎯 선택된 학생 계산
  const selectedStudents = useMemo(() => {
    if (isMultiSelectMode) {
      return students.filter((s) =>
        selectedStudentIds.includes(s.id)
      );
    }
    return students.filter((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId, selectedStudentIds, isMultiSelectMode]);

  const headerLabel =
    selectedStudents.length === 0
      ? "학생 없음"
      : selectedStudents.length === 1
        ? `${selectedStudents[0].name}의 펫`
        : `${selectedStudents.length}명의 펫 컬렉션`;

  // 🐾 선택된 학생들의 펫을 하나의 배열로 합침
  const pets = useMemo(() => {
    return selectedStudents.flatMap((s) => s.pets || []);
  }, [selectedStudents]);

  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🐾 펫 컬렉션</h2>
        <span className="text-sm text-gray-500">
          {headerLabel}
        </span>
      </div>

      {/* 펫 없음 */}
      {pets.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-400">
          <p className="text-sm">
            아직 획득한 펫이 없습니다.
          </p>
          <p className="text-xs mt-1">
            가챠를 통해 펫을 획득할 수 있어요 🐣
          </p>
        </div>
      )}

      {/* 펫 목록 */}
      {pets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {pets.map((petId, index) => {
            const pet = getPetById(petId);

            return (
              <div
                key={`${petId}-${index}`}
                className="rounded-lg border bg-gray-50 p-4 text-center"
              >
                <div className="text-2xl mb-2">
                  {pet?.emoji || "🐾"}
                </div>
                <div className="text-sm font-medium">
                  {pet?.name || petId}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400">
        ※ 다음 단계에서 펫 이름, 이미지, 등급이
        추가될 예정입니다.
      </p>
    </section>
  );
}