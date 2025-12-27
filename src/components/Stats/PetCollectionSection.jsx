import React from "react";
import { petsData } from "../../constants/pets";

/**
 * 🐾 PetCollectionSection (Collection Mode)
 * - 세트 기준 고정 슬롯 컬렉션
 * - 획득 여부에 따라 잠금 / 해제 표현
 * - 피그마 컬렉션 UI 구조 1차 반영
 */
export default function PetCollectionSection({
  set,
  ownedPetIds = [],
}) {
  if (!set || !set.id) {
    return null;
  }
  const setPets = petsData.filter(
    (pet) => pet.setId === set.id
  );

  return (
    <section className="rounded-xl bg-[#3a2468] p-5 space-y-4">
      {/* 세트 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          {set.theme} {set.name}
        </h2>
        <span className="text-xs text-white/60">
          {ownedPetIds.filter((id) =>
            setPets.some((p) => p.id === id)
          ).length}
          /{setPets.length}
        </span>
      </div>

      {/* 슬롯 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {setPets.map((pet) => {
          const owned = ownedPetIds.includes(pet.id);
          const starCount = {
            common: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
          }[pet.rarity];

          return (
            <div
              key={pet.id}
              className={`rounded-lg border p-4 text-center transition
                ${
                  owned
                    ? "bg-white shadow-md"
                    : "bg-[#2a164d] border-white/10 text-white/40"
                }`}
            >
              {/* 아이콘 */}
              <div className="text-2xl mb-2" aria-label={owned ? pet.name : "Locked pet"}>
                {owned ? pet.emoji : "🔒"}
              </div>

              {/* 이름 */}
              <div className="text-sm font-medium mb-1">
                {owned ? pet.name : "???"}
              </div>

              {/* 별 */}
              <div className="flex justify-center gap-0.5 text-yellow-400 text-xs">
                {Array.from({ length: starCount }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}