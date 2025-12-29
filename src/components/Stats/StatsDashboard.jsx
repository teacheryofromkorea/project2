import React, { useState, useEffect } from "react";
import CoreStatsSection from "./CoreStatsSection";
import GachaSection from "./GachaSection";
import PetCollectionSection from "./PetCollectionSection";
import { petSets } from "../../constants/pets";

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

  const [ownedPetIds, setOwnedPetIds] = useState([]);

  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId
  );

  useEffect(() => {
    setOwnedPetIds(selectedStudent?.pets || []);
  }, [selectedStudentId, selectedStudent]);

  const headerTitle = isMultiSelectMode
    ? `선택된 학생 ${selectedStudentIds.length}명`
    : selectedStudent
      ? `${selectedStudent.name}의 성장`
      : "학생을 선택하세요";

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-[#3B1C6E] via-[#4B237F] to-[#2A0F45]">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white">{headerTitle}</h1>
        <p className="mt-1 text-sm text-purple-200">
          성장 포인트를 관리하고 가챠로 보상을 획득하세요
        </p>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-10 space-y-8">
        {/* Core Stats */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
          <CoreStatsSection
            students={students}
            selectedStudentId={selectedStudentId}
            selectedStudentIds={selectedStudentIds}
            isMultiSelectMode={isMultiSelectMode}
          />
        </div>

        {/* Gacha Section */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
          <GachaSection
            students={students}
            selectedStudentId={selectedStudentId}
            selectedStudentIds={selectedStudentIds}
            isMultiSelectMode={isMultiSelectMode}
            onGachaResult={(pet) => {
              setOwnedPetIds((prev) => {
                if (prev.includes(pet.id)) return prev;
                return [...prev, pet.id];
              });
            }}
          />
        </div>

        {/* Pet Collections */}
        <div className="space-y-8">
          {petSets.map((set) => (
            <div
              key={set.id}
              className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
            >
              <PetCollectionSection
                set={set}
                ownedPetIds={ownedPetIds}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;