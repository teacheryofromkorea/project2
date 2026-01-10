import React, { useState, useEffect } from "react";
import CoreStatsSection from "./CoreStatsSection";
import GachaSection from "./GachaSection";
import PetCollectionSection from "./PetCollectionSection";
import PraiseHistorySection from "./PraiseHistorySection";
import { petSets } from "../../constants/pets";

function StatsDashboard({
  students = [],
  selectedStudentId,
  selectedStudentIds = [],
  isMultiSelectMode = false,
  loading = false,
  onStudentsUpdated,
  onOptimisticStatUpdate,
}) {
  const [ownedPetIds, setOwnedPetIds] = useState([]);
  const [lastDrawnPetId, setLastDrawnPetId] = useState(null);
  const [optimisticLog, setOptimisticLog] = useState(null);
  const [externalStatUpdate, setExternalStatUpdate] = useState(null);

  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId
  );

  useEffect(() => {
    if (!selectedStudent) {
      setOwnedPetIds([]);
      return;
    }
    setOwnedPetIds(selectedStudent.pets || []);
  }, [selectedStudentId, selectedStudent?.pets]);

  const handleLogDeleted = (updateData) => {
    // updateData: { studentId, statId, delta }
    setExternalStatUpdate(updateData);

    // reset after a short delay so duplicate updates can be triggered if needed?
    // Actually, useEffect dependency on object identity is enough if we create new object each time.
    // Ideally, we should use a wrapper or ID. 
    // But since deletion is a discrete event, setting it usually triggers the effect once.
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        통계 불러오는 중…
      </div>
    );
  }

  const headerTitle = isMultiSelectMode
    ? `선택된 학생 ${selectedStudentIds.length}명`
    : selectedStudent
      ? `${selectedStudent.name}의 성장`
      : "학생을 선택하세요";

  return (
    <div className="flex-1 h-full overflow-y-auto bg-transparent">
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
        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-indigo-500/10">
          <CoreStatsSection
            students={students}
            selectedStudentId={selectedStudentId}
            selectedStudentIds={selectedStudentIds}
            isMultiSelectMode={isMultiSelectMode}
            onStudentsUpdated={onStudentsUpdated}
            onOptimisticStatUpdate={onOptimisticStatUpdate}
            onOptimisticLog={setOptimisticLog}
            externalStatUpdate={externalStatUpdate}
          />
        </div>

        {/* Praise History - 칭찬 히스토리 (CoreStats 바로 아래) */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-emerald-500/10 h-[500px] overflow-y-auto custom-scrollbar">
          <PraiseHistorySection
            selectedStudentId={isMultiSelectMode ? null : selectedStudentId}
            optimisticLog={optimisticLog}
            onLogDeleted={handleLogDeleted}
          />
        </div>

        {/* Gacha Section */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-purple-500/10">
          <GachaSection
            students={students}
            selectedStudentId={selectedStudentId}
            selectedStudentIds={selectedStudentIds}
            isMultiSelectMode={isMultiSelectMode}
            onStudentsUpdated={onStudentsUpdated}
            onPetAcquired={(studentId, petId) => {
              if (studentId !== selectedStudentId) return;
              setOwnedPetIds((prev) => (prev.includes(petId) ? prev : [...prev, petId]));
            }}
            onLastDrawnPetChange={setLastDrawnPetId}
          />
        </div>

        {/* Pet Collections */}
        <div className="space-y-8">
          {petSets.map((set) => (
            <div
              key={set.id}
              className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-cyan-500/10"
            >
              <PetCollectionSection
                set={set}
                ownedPetIds={ownedPetIds}
                lastDrawnPetId={lastDrawnPetId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;