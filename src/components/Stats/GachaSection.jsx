import React, { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getRandomPet } from "../../constants/pets";
import { getDuplicateReward } from "../../constants/duplicateRewards";
import { getActivePityRule } from "../../constants/pitySystem";
import GachaResultModal from "./GachaResultModal";
import GachaSlotModal from "./GachaSlotModal";

// ♻️ 중복 교환 시 조각 환급 비율 (50%)
const DUPLICATE_EXCHANGE_REFUND_RATE = 0.5;

// 🧩 조각 교환 기준 (능력치 5 = 가챠 1 기준 설계)
const FRAGMENT_EXCHANGE_COST = {
  일반: 20,
  희귀: 45,
  영웅: 90,
  전설: 160,
};

// 🔤 UI 한글 등급 → 내부 rarity 매핑
const RARITY_MAP = {
  일반: "common",
  희귀: "rare",
  영웅: "epic",
  전설: "legendary",
};

// 🎯 rarity 확률 계산 (STEP 1)
// ※ hiddenRewardBoost가 없을 때의 기본 확률
function rollRarity() {
  const r = Math.random();
  if (r < 0.01) return "legendary";
  if (r < 0.08) return "epic";
  if (r < 0.30) return "rare";
  return "common";
}

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
      return students.filter((s) => selectedStudentIds.includes(s.id));
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

  const totalFragments = selectedStudents.reduce(
    (sum, s) => sum + (s.fragments ?? 0),
    0
  );

  const exchangeCosts = Object.values(FRAGMENT_EXCHANGE_COST);
  const nextTarget =
    exchangeCosts.find((c) => c > totalFragments) ?? exchangeCosts[exchangeCosts.length - 1];
  const progressRatio = Math.min(totalFragments / nextTarget, 1);

  const canDraw = !isDrawing && selectedStudents.length > 0 && totalTickets > 0;

  // 🧩 조각 교환
  const handleExchange = async (rarityLabel) => {
    if (selectedStudents.length !== 1) return;

    const student = selectedStudents[0];
    const cost = FRAGMENT_EXCHANGE_COST[rarityLabel];
    const internalRarity = RARITY_MAP[rarityLabel];

    if ((student.fragments ?? 0) < cost) return;

    const pet = getRandomPet({ rarity: internalRarity });
    if (!pet) return;

    const { data: existingPet } = await supabase
      .from("student_pets")
      .select("id")
      .eq("student_id", student.id)
      .eq("pet_id", pet.id)
      .maybeSingle();

    let nextFragments = (student.fragments ?? 0) - cost;

    if (existingPet) {
      const refund = Math.floor(cost * DUPLICATE_EXCHANGE_REFUND_RATE);
      nextFragments += refund;
    } else {
      await supabase.from("student_pets").insert({
        student_id: student.id,
        pet_id: pet.id,
      });

      if (onPetAcquired) {
        onPetAcquired(student.id, pet.id);
      }
    }

    await supabase
      .from("students")
      .update({ fragments: nextFragments })
      .eq("id", student.id);

    if (onStudentsUpdated) {
      await onStudentsUpdated();
    }
  };

  const handleDraw = async () => {
    if (!canDraw) return;

    setIsDrawing(true);

    try {
      for (const student of selectedStudents) {
        if ((student.gacha_tickets ?? 0) <= 0) continue;

        const duplicateCount = student.duplicate_count ?? 0;
        const pityRule = getActivePityRule(duplicateCount);

        let rarity = rollRarity();
        if (pityRule?.forceRarity) {
          rarity = pityRule.forceRarity;
        }

        let pet = getRandomPet({ rarity });
        if (!pet) pet = getRandomPet({});

        const { data: existingPet } = await supabase
          .from("student_pets")
          .select("id")
          .eq("student_id", student.id)
          .eq("pet_id", pet.id)
          .maybeSingle();

        let rewardLabel = null;

        if (existingPet) {
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

        setPendingResult({ pet, isDuplicate: Boolean(existingPet), rewardLabel });
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

    if (
      lastDrawnPet?.pet &&
      !lastDrawnPet?.isDuplicate &&
      onPetAcquired &&
      selectedStudents.length === 1
    ) {
      onPetAcquired(selectedStudents[0].id, lastDrawnPet.pet.id);
    }

    if (onStudentsUpdated) {
      await onStudentsUpdated();
    }
  };

  return (
    <>
<section className="rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 space-y-6 text-white shadow-2xl">
  {/* 1단: 상태 요약 */}
  <div className="rounded-2xl bg-black/40 border border-white/5 p-5 flex justify-between items-center shadow-inner">
    <div>
      <div className="text-sm text-white/70 mb-1">보유 가챠 티켓</div>
      <div className="text-2xl font-bold text-white">
        {totalTickets}
      </div>
    </div>
    <div className="text-sm font-medium text-white/80 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isDrawing ? "bg-purple-500 animate-pulse" : "bg-emerald-500"}`} />
      {isDrawing ? "뽑는 중..." : "대기중"}
    </div>
  </div>

{/* 2단: 가챠 머신 (그라데이션 유지, 선명도 극대화) */}
<div className="rounded-3xl bg-gradient-to-br from-purple-800 to-pink-700 p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
  
  {/* 배경의 미세한 하이라이트 효과 제거 (선명도 위해 제거) */}
  
  <div className="relative z-10 space-y-3">
    {/* 제목 텍스트 그림자(drop-shadow-lg) 제거 */}
    <h3 className="text-2xl font-black text-yellow-400">
      ✨ 신비로운 가챠머신 ✨
    </h3>
    {/* 부제목 텍스트 투명도 제거 */}
    <p className="text-base font-semibold text-white">
      능력치 10점마다 쿠폰 1장 지급
    </p>
  </div>

  <div className="relative z-10">
    <button
      onClick={handleDraw}
      disabled={!canDraw}
      // 버튼 그림자를 날카로운 shadow-xl로 변경, 모서리는 rounded-lg로 변경
      className={`w-full max-w-md mx-auto py-4 rounded-lg text-xl font-bold transition-all duration-100 transform active:scale-95 ${
        canDraw
          ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:opacity-95 text-white shadow-xl"
          : "bg-white/10 text-white/40 cursor-not-allowed"
      }`}
    >
      {isDrawing ? (
        <span className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          뽑는 중...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-3">
           <span className="text-base">✩</span>
           <span>🎲 가챠 뽑기</span>
           <span className="text-base">✩</span>
        </span>
      )}
    </button>
  </div>

  {/* 하단 텍스트 투명도 제거 */}
  <div className="relative z-10 text-xs text-white mt-4">
    쿠폰 1장 필요
  </div>
</div>



  {/* 3단: 확률 카드와 조각 교환 그리드 */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* 출현 확률 */}
    <div className="rounded-2xl bg-black/30 border border-white/5 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white">📊 출현 확률</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-3 py-2.5">
          <span>전설</span>
          <span className="font-semibold text-yellow-400">1%</span>
        </div>
        <div className="flex justify-between items-center rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2.5">
          <span>영웅</span>
          <span className="font-semibold text-purple-400">7%</span>
        </div>
        <div className="flex justify-between items-center rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2.5">
          <span>희귀</span>
          <span className="font-semibold text-blue-400">22%</span>
        </div>
        <div className="flex justify-between items-center rounded-xl bg-white/5 border border-white/5 px-3 py-2.5">
          <span>일반</span>
          <span className="font-semibold text-white/80">70%</span>
        </div>

        <hr className="border-white/5 my-3" />

        <div className="space-y-1 text-xs text-white/60 leading-relaxed">
          <div>• 중복 펫은 조각으로 바뀌어요.</div>
          <div>• 조각을 모아 특별 가챠를 돌려요.</div>
          <div>• 선택한 등급의 펫이 랜덤으로 나와요.</div>
        </div>
      </div>
    </div>

    {/* 조각 교환 */}
    <div className="rounded-2xl bg-black/30 border border-white/5 p-5 space-y-5">
      <h3 className="text-sm font-semibold text-white">🧩 조각 교환</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/70">
          <span>현재 조각</span>
          <span>{totalFragments} / {nextTarget}</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {Object.entries(FRAGMENT_EXCHANGE_COST).map(([rarity, cost]) => {
          const canExchange = totalFragments >= cost;
          return (
            <div key={rarity} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
              <span>{rarity} ({cost}조각)</span>
              <button
                disabled={!canExchange}
                onClick={() => handleExchange(rarity)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  canExchange
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                교환
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </div>
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