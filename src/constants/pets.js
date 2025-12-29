// 🐾 Pet Data and Sets Configuration

export const petsData = [
  { id: "pet_01", name: "병아리", emoji: "🐣", rarity: "common", setId: "forest" },
  { id: "pet_02", name: "강아지", emoji: "🐶", rarity: "common", setId: "forest" },
  { id: "pet_03", name: "고양이", emoji: "🐱", rarity: "rare", setId: "forest" },
  { id: "pet_04", name: "토끼", emoji: "🐰", rarity: "rare", setId: "forest" },
  { id: "pet_05", name: "드래곤", emoji: "🐲", rarity: "epic", setId: "magic" },
  { id: "pet_06", name: "돌고래", emoji: "🐬", rarity: "common", setId: "ocean" },
  { id: "pet_07", name: "문어", emoji: "🐙", rarity: "rare", setId: "ocean" },
  { id: "pet_08", name: "독수리", emoji: "🦅", rarity: "rare", setId: "sky" },
  { id: "pet_09", name: "페가수스", emoji: "🐴", rarity: "epic", setId: "sky" },
  { id: "pet_10", name: "유니콘", emoji: "🦄", rarity: "epic", setId: "magic" },
  { id: "pet_11", name: "우주인", emoji: "👨‍🚀", rarity: "rare", setId: "space" },
  { id: "pet_12", name: "외계인", emoji: "👽", rarity: "epic", setId: "space" },
{ id: "pet_13", name: "전설의 용", emoji: "🐉", rarity: "legendary", setId: "legend" },
];

export const petSets = [
  { id: "forest", name: "숲속 세트" },
  { id: "ocean", name: "바다 세트" },
  { id: "sky", name: "하늘 세트" },
  { id: "magic", name: "마법 세트" },
  { id: "space", name: "우주 세트" },
  { id: "legend", name: "전설 세트" },
];

// 🧭 Get pet metadata by petId
export function getPetById(petId) {
  return petsData.find((pet) => pet.id === petId) || null;
}

// 🧭 Get all pets in a specific set
export function getPetsBySet(setId) {
  return petsData.filter((pet) => pet.setId === setId);
}

// 🧭 Get owned pets filtered by setId
export function getOwnedPetsBySet(ownedPetIds, setId) {
  return ownedPetIds
    .map((id) => getPetById(id))
    .filter((pet) => pet && pet.setId === setId);
}

// 🎲 Get random pet by rarity (used in Gacha)
export function getRandomPet(options = {}) {
  const { rarity } = options;

  // 전체 풀 또는 rarity 필터 풀 구성
  const pool = rarity
    ? petsData.filter((pet) => pet.rarity === rarity)
    : petsData;

  if (!Array.isArray(pool) || pool.length === 0) {
    console.warn("[getRandomPet] No pet found for rarity:", rarity);
    return null;
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected || null;
}