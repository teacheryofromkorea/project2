

// 🧮 Pity System (천장 시스템)
// 중복 누적 횟수에 따라 가챠 보상을 보정하는 규칙 정의

/**
 * 천장 규칙 정의
 * threshold: 중복 누적 횟수
 * guaranteeRarity: 이 횟수 이상이면 보장되는 최소 rarity
 */
export const PITY_RULES = [
  {
    threshold: 3,
    guaranteeRarity: "rare",
    label: "Rare 이상 확정",
  },
  {
    threshold: 5,
    guaranteeRarity: "epic",
    label: "Epic 확정",
  },
];

/**
 * 현재 duplicate_count 기준으로
 * 적용 가능한 가장 강한 천장 규칙 반환
 */
export function getActivePityRule(duplicateCount = 0) {
  return (
    [...PITY_RULES]
      .sort((a, b) => b.threshold - a.threshold)
      .find((rule) => duplicateCount >= rule.threshold) || null
  );
}

/**
 * 천장 진행 상태 계산 (UI 표시용)
 * @returns { current, target, remaining, isReady }
 */
export function getPityProgress(duplicateCount = 0) {
  const finalRule = [...PITY_RULES].sort(
    (a, b) => b.threshold - a.threshold
  )[0];

  const current = Math.min(duplicateCount, finalRule.threshold);
  const target = finalRule.threshold;
  const remaining = Math.max(target - duplicateCount, 0);

  return {
    current,
    target,
    remaining,
    isReady: remaining === 0,
  };
}