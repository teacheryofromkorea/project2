import React from "react";
import CoreStatsSection from "./CoreStatsSection";
import GachaSection from "./GachaSection";
import PetCollectionSection from "./PetCollectionSection";

function StatsDashboard({
  students = [],
  selectedStudentId,
  selectedStudentIds = [],
  isMultiSelectMode = false,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        통계 불러오는 중…
      </div>
    );
  }

  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId
  );

  const headerTitle = isMultiSelectMode
    ? `선택된 학생 ${selectedStudentIds.length}명`
    : selectedStudent
      ? `${selectedStudent.name}의 성장`
      : "학생을 선택하세요";

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold">{headerTitle}</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <CoreStatsSection
          students={students}
          selectedStudentId={selectedStudentId}
          selectedStudentIds={selectedStudentIds}
          isMultiSelectMode={isMultiSelectMode}
        />

        <GachaSection
          students={students}
          selectedStudentId={selectedStudentId}
          selectedStudentIds={selectedStudentIds}
          isMultiSelectMode={isMultiSelectMode}
        />

        <PetCollectionSection
          students={students}
          selectedStudentId={selectedStudentId}
          selectedStudentIds={selectedStudentIds}
          isMultiSelectMode={isMultiSelectMode}
        />
      </div>
    </div>
  );
}

export default StatsDashboard;