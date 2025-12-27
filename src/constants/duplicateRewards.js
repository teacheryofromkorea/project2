// ♻️ C-6 중복 펫 보상 규칙
// 중복 펫이 나왔을 때 지급할 보상 정의

/**
 * 보상 정책:
 * - common  → 티켓 +1
 * - rare    → 티켓 +2
 * - epic    → 티켓 +3
 */
export const DUPLICATE_REWARD_BY_RARITY = {
  common: {
    tickets: 1,
    label: "🎟 가챠 티켓 +1",
  },
  rare: {
    tickets: 2,
    label: "🎟 가챠 티켓 +2",
  },
  epic: {
    tickets: 3,
    label: "🎟 가챠 티켓 +3",
  },
};

/**
 * rarity에 따른 중복 보상 조회
 * @param {string} rarity - common | rare | epic
 */
export function getDuplicateReward(rarity) {
  return (
    DUPLICATE_REWARD_BY_RARITY[rarity] || {
      tickets: 0,
      label: "",
    }
  );
}
