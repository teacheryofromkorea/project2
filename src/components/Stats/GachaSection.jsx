import React, { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getRandomPet } from "../../constants/pets";
import { getDuplicateReward } from "../../constants/duplicateRewards";
import { getActivePityRule, PITY_RULES } from "../../constants/pitySystem";
import GachaResultModal from "./GachaResultModal";
import GachaSlotModal from "./GachaSlotModal";

// 🎯 rarity 확률 계산 (STEP 1)
function rollRarity() {
  const r = Math.random();
  if (r < 0.01) return "legendary";
  if (r < 0.08) return "epic";
  if (r < 0.30) return "rare";
  return "common";
}

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
  onPetAcquired,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [lastDrawnPet, setLastDrawnPet] = useState(null);
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

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

  // 🧮 천장(중복 누적) 진행 상태 계산
  const pityStatus = useMemo(() => {
    if (selectedStudents.length !== 1) return null;

    const student = selectedStudents[0];
    const duplicateCount = student.duplicate_count ?? 0;

    // 가장 높은 threshold 기준 (예: Epic)
    const finalRule = [...PITY_RULES].sort(
      (a, b) => b.threshold - a.threshold
    )[0];

    const remaining = Math.max(
      finalRule.threshold - duplicateCount,
      0
    );

    return {
      current: duplicateCount,
      target: finalRule.threshold,
      remaining,
      isReady: remaining === 0,
    };
  }, [selectedStudents]);

  // ⚠️ 천장 임박 여부 (다음 뽑기에서 발동)
  const isPityWarning =
    pityStatus &&
    pityStatus.remaining === 1 &&
    !pityStatus.isReady;

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

        // 🎯 현재 중복 누적 카운트
        const duplicateCount = student.duplicate_count ?? 0;

        // 🧮 천장 규칙 확인
        const pityRule = getActivePityRule(duplicateCount);

        // 1️⃣ rarity 결정 (천장 규칙 우선)
        let rarity = rollRarity();
        if (pityRule?.forceRarity) {
          rarity = pityRule.forceRarity;
        }

        // 2️⃣ rarity 기반 펫 선택
        let pet = getRandomPet({ rarity });

        // fallback (안전장치)
        if (!pet) {
          console.warn("[Gacha] Fallback random pet used");
          pet = getRandomPet({});
        }

        // 2️⃣ 중복 여부 확인 (DB 기준)
        const { data: existingPet } = await supabase
          .from("student_pets")
          .select("id")
          .eq("student_id", student.id)
          .eq("pet_id", pet.id)
          .maybeSingle();

        let rewardLabel = null;
        let pityLabel = pityRule?.label ?? null;

        if (existingPet) {
          // ♻️ 중복 → 보상 + 중복 카운트 증가
          const reward = getDuplicateReward(pet.rarity);
          rewardLabel = reward.label;

          await supabase
            .from("students")
            .update({
              gacha_tickets:
                (student.gacha_tickets ?? 0) + reward.tickets - 1,
              duplicate_count: duplicateCount + 1,
            })
            .eq("id", student.id);
        } else {
          // 🎉 신규 펫 → 지급 + 티켓 차감 + 중복 카운트 리셋
          await supabase.from("student_pets").insert({
            student_id: student.id,
            pet_id: pet.id,
          });

          await supabase
            .from("students")
            .update({
              gacha_tickets: student.gacha_tickets - 1,
              duplicate_count: 0,
            })
            .eq("id", student.id);
        }

        // 3️⃣ 결과 모달 대신 슬롯 연출 시작
        setPendingResult({
          pet,                 // ✅ pet 객체 그대로 전달
          isDuplicate: Boolean(existingPet),
          rewardLabel,
        });
        setIsSlotOpen(true);
      }
    } finally {
      setIsDrawing(false);
    }
  };

  const handleSlotFinish = () => {
    setIsSlotOpen(false);
    setLastDrawnPet(pendingResult);
    setIsResultOpen(true);
    setPendingResult(null);
  };

  const handleResultClose = async () => {
    setIsResultOpen(false);

    // ✅ STEP 1: 결과 확인 후 모달을 닫는 순간, "신규" 펫이면 컬렉션 상태를 즉시 갱신
    if (
      lastDrawnPet?.pet &&
      !lastDrawnPet?.isDuplicate &&
      onPetAcquired &&
      selectedStudents.length === 1
    ) {
      onPetAcquired(selectedStudents[0].id, lastDrawnPet.pet.id);
    }

    // ✅ Supabase 쪽 학생 티켓/천장 카운트 등을 최신으로 다시 받아오기
    if (onStudentsUpdated) {
      await onStudentsUpdated();
    }
  };

  return (
    <>
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

        {/* 🔥 천장 진행 상태 */}
        {pityStatus && (
          <div className="rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 p-3 space-y-2">
            <div className="text-xs font-semibold text-purple-700">
              🔥 천장 보너스 진행 중
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded bg-purple-200 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{
                  width: `${Math.min(
                    (pityStatus.current / pityStatus.target) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-purple-700">
              <span>
                {pityStatus.current} / {pityStatus.target}
              </span>
              <span>
                {pityStatus.isReady
                  ? "✨ 다음 뽑기 Epic 확정!"
                  : `Epic 확정까지 ${pityStatus.remaining}회`}
              </span>
            </div>
          </div>
        )}

        {/* 액션 영역 */}
        <div className="flex justify-end flex-col items-end space-y-1">
          <button
            onClick={handleDraw}
            disabled={!canDraw}
            className={`px-4 py-2 rounded transition relative ${
              canDraw
                ? isPityWarning
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white animate-pulse shadow-lg"
                  : "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isDrawing ? "뽑는 중..." : "가챠 뽑기"}

            {isPityWarning && !isDrawing && (
              <span className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black animate-bounce">
                🔥 천장 임박
              </span>
            )}
          </button>

          {isPityWarning && (
            <p className="text-xs text-purple-600 font-semibold animate-pulse">
              ⚠️ 이번 가챠에서 Epic 확정이 발동될 수 있어요!
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400">
          ※ 결과 모달을 닫으면 신규 펫은 즉시 컬렉션에 반영됩니다.
        </p>
      </section>

      <GachaSlotModal
        isOpen={isSlotOpen}
        onFinish={handleSlotFinish}
        resultPet={pendingResult?.pet}
      />

      <GachaResultModal
        isOpen={isResultOpen}
        pet={lastDrawnPet?.pet ?? null}
        isDuplicate={lastDrawnPet?.isDuplicate ?? false}
        rewardLabel={lastDrawnPet?.rewardLabel ?? null}
        onClose={handleResultClose}
      />
    </>
  );
}