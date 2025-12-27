// 🐾 C-5 펫 풀 + 등급 / 확률 시스템

// rarity: common | rare | epic
// weight: 가챠 확률 비중 (숫자가 클수록 잘 나옴)
export const PET_POOL = [
  // 🟢 Common (총 비중 60)
  {
    id: "pet_01",
    name: "🐣 병아리",
    rarity: "common",
    weight: 30,
  },
  {
    id: "pet_02",
    name: "🐶 강아지",
    rarity: "common",
    weight: 30,
  },

  // 🔵 Rare (총 비중 30)
  {
    id: "pet_03",
    name: "🐱 고양이",
    rarity: "rare",
    weight: 20,
  },
  {
    id: "pet_04",
    name: "🐰 토끼",
    rarity: "rare",
    weight: 10,
  },

  // 🟣 Epic (총 비중 10)
  {
    id: "pet_05",
    name: "🐲 드래곤",
    rarity: "epic",
    weight: 10,
  },
];

// 🎲 가중치 기반 랜덤 펫 추출
export function getRandomPet() {
  const totalWeight = PET_POOL.reduce(
    (sum, pet) => sum + pet.weight,
    0
  );

  let random = Math.random() * totalWeight;

  for (const pet of PET_POOL) {
    random -= pet.weight;
    if (random <= 0) {
      return pet;
    }
  }

  // fallback (이론상 도달하지 않음)
  return PET_POOL[0];
}

// 🧭 pet_id로 펫 메타데이터 조회
export function getPetById(petId) {
  return PET_POOL.find((pet) => pet.id === petId) || null;
}