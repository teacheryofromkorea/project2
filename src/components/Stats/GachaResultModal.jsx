import React, { useEffect } from "react";

const rarityBackground = {
  common: "from-gray-100 to-gray-200",
  rare: "from-blue-100 to-indigo-200",
  epic: "from-purple-100 to-fuchsia-200",
  legendary: "from-yellow-100 via-amber-100 to-orange-200",
};

const rarityAnimation = {
  common: "animate-fade-in",
  rare: "animate-float-in",
  epic: "animate-dimension-in",
  legendary: "animate-legendary-impact",
};

/**
 * 🎁 GachaResultModal (Figma 카드 스타일)
 *
 * 역할
 * - 가챠 결과 “정보 카드” 전용
 * - 연출은 Slot / World 에서 이미 소비됨
 * - 이 컴포넌트는 정돈 + 강조만 담당
 */

export default function GachaResultModal({
  isOpen,
  pet,
  isDuplicate,
  rewardLabel,
  onClose,
}) {
  if (!isOpen || !pet) return null;

  useEffect(() => {
    // ESC 닫기
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rarityStyle = {
    common: {
      label: "COMMON",
      glow: "rarity-common",
      badge: "🟢",
    },
    rare: {
      label: "RARE",
      glow: "rarity-rare",
      badge: "🔵",
    },
    epic: {
      label: "EPIC",
      glow: "rarity-epic",
      badge: "🟣",
    },
    legendary: {
      label: "LEGENDARY",
      glow: "rarity-legendary",
      badge: "🟡",
    },
  }[pet.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dim */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`relative z-10 w-[360px] rounded-3xl bg-gradient-to-b ${
          rarityBackground[pet.rarity]
        } p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
          rarityAnimation[pet.rarity]
        }`}
      >
        {pet.rarity === "epic" && (
          <div className="absolute inset-0 rounded-3xl bg-purple-300/10 blur-2xl animate-pulse" />
        )}

        {pet.rarity === "legendary" && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-yellow-300/20 via-orange-200/20 to-pink-300/20 animate-pulse" />
        )}

        {/* Rarity */}
        <div className="mb-4 flex flex-col items-center justify-center gap-2 text-[11px] font-extrabold tracking-[0.3em] text-gray-400">
          <div className="flex items-center gap-2">
            <span>{rarityStyle.badge}</span>
            {rarityStyle.label}
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-widest text-gray-300">
            {isDuplicate ? "DUPLICATE" : "NEW PET"}
          </div>
        </div>

        {/* Pet */}
        <div className="relative mb-6 flex justify-center">
          <div
            className={`flex h-36 w-36 items-center justify-center rounded-full bg-white/70 text-7xl shadow-xl backdrop-blur ${rarityStyle.glow} animate-pop-in`}
          >
            {pet.emoji || "🐾"}
          </div>
        </div>

        {/* Name */}
        <div className="mb-2 text-center text-xl font-black text-gray-900">
          {pet.name}
        </div>

        {/* Description */}
        <div className="mb-5 px-4 text-center text-sm leading-relaxed text-gray-500">
          {pet.description || "새로운 친구를 획득했어요!"}
        </div>

        {/* Duplicate Reward */}
        {isDuplicate && (
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 text-center">
            <div className="text-sm font-extrabold text-amber-700">
              ♻️ 중복 보상
            </div>
            <div className="mt-1 text-xs font-medium text-amber-600">
              이미 보유한 펫이에요! {rewardLabel}을 획득했어요.
            </div>
          </div>
        )}

        {/* LEGENDARY Emphasis */}
        {pet.rarity === "legendary" && (
          <div className="mb-4 text-center text-xs font-extrabold tracking-widest text-amber-600 animate-pulse">
            ✨ LEGENDARY AURA ACTIVATED ✨
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-gray-800 active:scale-95"
          autoFocus
        >
          확인
        </button>
      </div>
    </div>
  );
}
// animation helpers expected:
// animate-fade-in        (common)
// animate-float-in       (rare)
// animate-dimension-in   (epic)
// animate-legendary-impact (legendary)
// animate-scale-in
// animate-pop-in