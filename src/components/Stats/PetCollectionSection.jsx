import React, { useEffect, useMemo, useRef, useState } from "react";
import { petsData } from "../../constants/pets";
import PetDetailModal from "./PetDetailModal";

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
  const [selectedPet, setSelectedPet] = useState(null);
  const [justUnlockedPetId, setJustUnlockedPetId] = useState(null);
  const prevOwnedRef = useRef(new Set(ownedPetIds));
  const cardRefs = useRef({});

  useEffect(() => {
    if (!selectedPet) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedPet(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPet]);

  const setPets = useMemo(() => {
    return petsData.filter((pet) => pet.setId === set.id);
  }, [set.id]);

  useEffect(() => {
    const prev = prevOwnedRef.current;
    const next = new Set(ownedPetIds);

    // Find newly added petIds
    const added = [];
    for (const id of next) {
      if (!prev.has(id)) added.push(id);
    }

    // Save current as previous for next run
    prevOwnedRef.current = next;

    if (added.length === 0) return;

    // Highlight the newest acquisition that belongs to this set
    const addedInThisSet = added
      .map((id) => setPets.find((p) => p.id === id))
      .filter(Boolean);

    if (addedInThisSet.length === 0) return;

    const newest = addedInThisSet[addedInThisSet.length - 1];
    setJustUnlockedPetId(newest.id);

    // Scroll the unlocked card into view for instant feedback
    const el = cardRefs.current[newest.id];
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }

    const t = window.setTimeout(() => {
      setJustUnlockedPetId(null);
    }, 2200);

    return () => window.clearTimeout(t);
  }, [ownedPetIds, setPets]);

  if (!set || !set.id) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#2b1650] to-[#1b0f33] p-6 space-y-5 shadow-xl">
      {/* 세트 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {set.theme} {set.name}
        </h2>
        <span className="text-xs text-white/60">
          {
            ownedPetIds.filter((id) =>
              setPets.some((p) => p.id === id)
            ).length
          }
          /{setPets.length}
        </span>
      </div>

      {/* 슬롯 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {setPets.map((pet) => {
          const owned = ownedPetIds.includes(pet.id);
          const isJustUnlocked = pet.id === justUnlockedPetId;

          const rarityGlow = {
            common: "shadow-white/10",
            rare: "shadow-blue-400/30",
            epic: "shadow-purple-400/40",
            legendary: "shadow-yellow-300/50",
          }[pet.rarity];

          const starCount = {
            common: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
          }[pet.rarity];

          return (
            <div
              key={pet.id}
              ref={(el) => {
                if (!el) return;
                cardRefs.current[pet.id] = el;
              }}
              className={`relative rounded-xl border p-4 text-center ${
                owned ? "cursor-pointer" : "cursor-not-allowed"
              }
transition-all duration-300 ease-out
${
  owned
    ? `bg-white text-gray-900 shadow-lg ${rarityGlow}
       hover:-translate-y-2 hover:scale-[1.04]
       hover:shadow-2xl`
    : "bg-[#24123f] border-white/10 text-white/40"
}
${owned && pet.rarity === "legendary" ? "animate-pulse" : ""}
${isJustUnlocked ? "ring-4 ring-emerald-300/70 shadow-[0_0_45px_rgba(16,185,129,0.55)] scale-[1.06]" : ""}
group`}
              onClick={() => {
                if (owned) setSelectedPet(pet);
              }}
            >
              {isJustUnlocked && (
                <div className="absolute -top-2 -right-2 z-20 rounded-full bg-emerald-400 px-2 py-1 text-[10px] font-extrabold tracking-wide text-black shadow-lg">
                  NEW
                </div>
              )}
              {owned && pet.rarity !== "common" && (
                <div className={`absolute inset-0 rounded-xl ring-2 ring-offset-2 ring-offset-transparent
    ${
      pet.rarity === "rare"
        ? "ring-blue-400/40"
        : pet.rarity === "epic"
        ? "ring-purple-400/50"
        : "ring-yellow-300/60"
    }`} />
              )}

              {/* 잠금 오버레이 */}
              {!owned && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm text-xl">
                  🔒
                </div>
              )}

              {/* 아이콘 */}
              <div
                className={`text-4xl mb-2 transition-all duration-300
${owned ? "group-hover:scale-125 group-hover:rotate-6" : "scale-90"}
`}
                aria-label={owned ? pet.name : "Locked pet"}
              >
                {owned ? pet.emoji : "❔"}
              </div>

              {/* 이름 */}
              <div className="text-sm font-semibold mb-1 transition-opacity duration-300 group-hover:opacity-90">
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
      <PetDetailModal
        pet={selectedPet}
        isOpen={!!selectedPet}
        onClose={() => setSelectedPet(null)}
      />
    </section>
  );
}