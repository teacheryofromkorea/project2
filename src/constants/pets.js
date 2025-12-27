// 🐾 C-2 MVP 펫 풀
export const PET_POOL = [
  { id: "pet_01", name: "🐣 병아리" },
  { id: "pet_02", name: "🐶 강아지" },
  { id: "pet_03", name: "🐱 고양이" },
];

// 랜덤 펫 1개 선택
export function getRandomPet() {
  const index = Math.floor(Math.random() * PET_POOL.length);
  return PET_POOL[index];
}

// 🧭 pet_id로 펫 메타데이터 조회
export function getPetById(petId) {
  return PET_POOL.find((pet) => pet.id === petId) || null;
}