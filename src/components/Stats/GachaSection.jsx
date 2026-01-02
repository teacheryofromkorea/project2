const FRAGMENTS_BY_RARITY = {
  common: 1,
  rare: 3,
  epic: 6,
  legendary: 10,
};
import React, { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getRandomPet } from "../../constants/pets";
import { getActivePityRule } from "../../constants/pitySystem";
import GachaResultModal from "./GachaResultModal";
import GachaSlotModal from "./GachaSlotModal";
import PetShopModal from "./PetShopModal";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";

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
  onLastDrawnPetChange,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [lastDrawnPet, setLastDrawnPet] = useState(null);
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  // 🛍️ 펫 상점 상태
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopRarity, setShopRarity] = useState("common"); // internal "common"
  const [shopCost, setShopCost] = useState(0);

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

  const totalGachaProgress = selectedStudents.reduce(
    (sum, s) => sum + (s.gacha_progress ?? 0),
    0
  );

  // gacha_progress는 5점 단위로 티켓 지급 → 나머지로 진행 상태 표시
  const progressInCycle = totalGachaProgress % 5;

  // 다음 가챠까지 '항상' 남은 점수 기준
  // (보상 직후에도 다시 5점이 필요하도록 UX 보정)
  const remainingToNext = progressInCycle === 0 ? 5 : 5 - progressInCycle;

  const progressRatio = progressInCycle / 5;

  // 🧩 다음 목표 계산 (UI용)
  const exchangeEntries = Object.entries(FRAGMENT_EXCHANGE_COST);
  const nextTargetEntry = exchangeEntries.find(([_, cost]) => cost > totalFragments);
  const [nextTargetLabel, nextTargetCost] = nextTargetEntry || [null, 0];
  const gapToNextTarget = nextTargetLabel ? nextTargetCost - totalFragments : 0;

  const canDraw = !isDrawing && selectedStudents.length > 0 && totalTickets > 0;

  // 🧩 조각 교환 (상점 열기)
  const handleOpenShop = (rarityLabel) => {
    if (selectedStudents.length !== 1) return;

    const cost = FRAGMENT_EXCHANGE_COST[rarityLabel];
    const internalRarity = RARITY_MAP[rarityLabel];

    setShopRarity(internalRarity);
    setShopCost(cost);
    setIsShopOpen(true);
  };

  // 🛍️ 상점에서 펫 구매 (확정)
  const handleBuyPet = async (pet) => {
    if (selectedStudents.length !== 1) return;
    const student = selectedStudents[0];

    // 비용 재확인
    if ((student.fragments ?? 0) < shopCost) {
      alert("조각이 부족합니다.");
      return;
    }

    // 1. 펫 지급
    const { error: petError } = await supabase.from("student_pets").insert({
      student_id: student.id,
      pet_id: pet.id,
    });

    if (petError) {
      console.error(petError);
      alert("구매에 실패했습니다.");
      return;
    }

    // 2. 조각 차감
    const nextFragments = (student.fragments ?? 0) - shopCost;
    const { error: updateError } = await supabase
      .from("students")
      .update({ fragments: nextFragments })
      .eq("id", student.id);

    if (updateError) {
      console.error(updateError);
      return;
    }

    // 3. UI 갱신 (낙관적 업데이트 or 리페치)
    // 펫 보유 처리를 위해 상위 상태 갱신은 필수
    if (onPetAcquired) {
      onPetAcquired(student.id, pet.id);
    }
    if (onPetAcquired) {
      onPetAcquired(student.id, pet.id);
    }
    // ❗ 학생 데이터 동기화(onStudentsUpdated)는 결과 모달이 닫힌 뒤에 수행 (리마운트 방지)

    // 4. 알림 및 효과
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999, // 모달 위에 뜨도록
    });

    // 결과 모달 띄우기 (PetShopModal 위에 뜨도록 JSX 순서 조정 필요)
    setLastDrawnPet({
      pet: pet,
      isDuplicate: false,
      rewardLabel: null,
    });
    setIsResultOpen(true);
  };

  const handleDraw = async () => {
    if (!canDraw) {
      return;
    }

    setIsDrawing(true);

    try {
      for (const student of selectedStudents) {
        if ((student.gacha_tickets ?? 0) <= 0) {
          continue;
        }

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
          const fragmentReward = FRAGMENTS_BY_RARITY[pet.rarity] ?? 1;
          rewardLabel = `조각 +${fragmentReward}`;

          await supabase
            .from("students")
            .update({
              fragments: (student.fragments ?? 0) + fragmentReward,
              gacha_tickets: student.gacha_tickets - 1,
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

      // ❗ 학생 데이터 동기화는 슬롯/결과 모달이 닫힌 뒤에 수행해야
      // GachaSection 리마운트로 인해 모달이 사라지는 문제를 방지할 수 있음
    }
  };

  const handleSlotFinish = () => {
    setIsSlotOpen(false);

    // 🎯 Use pendingResult which contains isDuplicate logic
    const finalResult = pendingResult;

    setLastDrawnPet(finalResult);

    // 🎯 마지막으로 뽑은 펫 id 즉시 전달 (NEW 배지 / glow)
    if (finalResult?.pet?.id && onLastDrawnPetChange) {
      onLastDrawnPetChange(finalResult.pet.id);
    }

    // ⚡ NEW 배지 즉시 반영을 위한 낙관적 업데이트
    if (
      finalResult?.pet &&
      !finalResult.isDuplicate &&
      onPetAcquired &&
      selectedStudents.length === 1
    ) {
      onPetAcquired(selectedStudents[0].id, finalResult.pet.id);
    }

    setIsResultOpen(true);
    setPendingResult(null);
  };

  const handleResultClose = async () => {
    setIsResultOpen(false);

    // ⛔ 이미 슬롯 종료 시 낙관적 업데이트 완료됨

    // 🎯 슬롯 연출 종료 후 최종 상태 동기화 (중복 호출이지만 안전)
    if (onStudentsUpdated) {
      await onStudentsUpdated();
    }
  };

  return (
    <>
      <section className="rounded-3xl bg-slate-900/60 border-white/10 p-6 space-y-6 text-white shadow-2xl">
        {/* 1단: 상태 요약 (3단 카드) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* 좌: 보유 가챠 티켓 */}
          <div className="rounded-2xl bg-black/40 border border-white/5 p-5 shadow-inner">
            <div className="text-sm text-white/70 mb-1">보유 가챠 티켓</div>
            <div className="text-3xl font-extrabold text-white">{totalTickets}<span className="text-base font-medium ml-1">장</span></div>
          </div>

          {/* 중: 다음 가챠까지 남은 능력치 */}
          <div className="rounded-2xl bg-black/40 border border-white/5 p-5 shadow-inner flex flex-col justify-between">
            <div className="text-sm text-white/70">다음 가챠 티켓까지</div>
            <div className="text-2xl font-bold text-yellow-300">
              {remainingToNext}점
            </div>
            <div className="h-2 mt-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </div>

          {/* 우: 보유 조각 & 다음 목표 */}
          <div className="rounded-2xl bg-black/40 border border-white/5 p-5 shadow-inner flex flex-col justify-between">
            <div>
              <div className="text-sm text-white/70 mb-1">보유 조각</div>
              <div className="text-3xl font-extrabold text-white">{totalFragments}<span className="text-base font-medium ml-1 text-white/50">개</span></div>
            </div>

            {nextTargetLabel ? (
              <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80">
                <span className="font-bold text-yellow-300">{nextTargetLabel}</span>까지 <span className="font-bold text-white">{gapToNextTarget}개</span> 남음!
              </div>
            ) : (
              <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-green-300 font-bold">
                모든 등급 교환 가능!
              </div>
            )}
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
              type="button" // ⛔ form submit 방지
              onClick={handleDraw}
              disabled={!canDraw}
              // 버튼 그림자를 날카로운 shadow-xl로 변경, 모서리는 rounded-lg로 변경
              className={`w-full max-w-md mx-auto py-4 rounded-lg text-xl font-bold transition-all duration-100 transform active:scale-95 ${canDraw
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
                <div>• 조각을 모아 원하는 펫을 확정 입양하세요!</div>
                <div>• 상점에서 모든 펫을 모아보세요.</div>
              </div>
            </div>
          </div>

          {/* 조각 교환 */}
          <div className="rounded-2xl bg-black/30 border border-white/5 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white mb-2">🧩 조각 교환</h3>

            <div className="space-y-3">
              {Object.entries(FRAGMENT_EXCHANGE_COST).map(([rarity, cost]) => {
                const canExchange = totalFragments >= cost;
                // Calculate progress percentage, capped at 100%
                const progressPercent = Math.min((totalFragments / cost) * 100, 100);

                // Color based on rarity
                let barGradient = "from-gray-500 to-gray-400";
                let glowColor = "shadow-gray-500/20";
                if (rarity === "일반") { barGradient = "from-yellow-400 to-orange-400"; glowColor = "shadow-yellow-500/20"; }
                if (rarity === "희귀") { barGradient = "from-blue-400 to-cyan-400"; glowColor = "shadow-blue-500/20"; }
                if (rarity === "영웅") { barGradient = "from-purple-400 to-pink-400"; glowColor = "shadow-purple-500/20"; }
                if (rarity === "전설") { barGradient = "from-red-500 to-rose-500"; glowColor = "shadow-red-500/20"; }

                return (
                  <div key={rarity} className="relative rounded-xl bg-black/40 border border-white/5 p-3 overflow-hidden group">
                    {/* Background Progress Bar */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <div
                        className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{rarity}</span>
                          {canExchange && <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">가능</span>}
                        </div>
                        <div className="text-xs text-white/50 mt-0.5">
                          <span className={canExchange ? "text-green-300 font-bold" : ""}>{Math.min(totalFragments, cost)}</span>
                          <span className="mx-1">/</span>
                          <span>{cost}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!canExchange}
                        onClick={() => handleOpenShop(rarity, cost)}
                        className={`
                      px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg
                      ${canExchange
                            ? `bg-gradient-to-r ${barGradient} text-white hover:scale-105 active:scale-95 ${glowColor}`
                            : "bg-white/5 text-white/20 cursor-not-allowed"}
                    `}
                      >
                        확인
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section >



      <GachaSlotModal
        isOpen={isSlotOpen}
        onClose={() => setIsSlotOpen(false)}
        onResult={handleSlotFinish}
        resultPet={pendingResult?.pet}
        rarity={pendingResult?.pet?.rarity}
      />

      {/* 🛍️ 펫 상점 모달 (먼저 렌더링 -> 아래에 깔림) */}
      <PetShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        rarity={shopRarity}
        cost={shopCost}
        currentFragments={selectedStudents[0]?.fragments ?? 0}
        ownedPetIds={selectedStudents[0]?.pets ?? []}
        onBuy={handleBuyPet}
      />

      {/* 🎁 결과 모달 (나중에 렌더링 -> 상점 위에 뜸) */}
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