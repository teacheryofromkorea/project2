import React, { useEffect, useState } from "react";

/**
 * 🎁 GachaResultModal (C-4)
 * - 가챠 결과를 보여주는 단순 모달
 * - 연출 최소 / UX 명확
 */
export default function GachaResultModal({
  isOpen,
  pet,
  onClose,
}) {
  if (!isOpen || !pet) return null;

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isOpen || !pet) return;

    // 🎵 rarity별 사운드
    const soundMap = {
      common: "/sounds/common.mp3",
      rare: "/sounds/rare.mp3",
      epic: "/sounds/epic.mp3",
    };

    const audioSrc = soundMap[pet.rarity];
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }

    // 🎆 폭죽 (Rare 이상)
    if (pet.rarity === "epic" || pet.rarity === "rare") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, pet]);

  const rarityStyle =
    pet.rarity === "epic"
      ? {
          bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700",
          ring: "ring-4 ring-purple-400",
          animation: "animate-bounce",
          label: "🟣 EPIC",
          labelColor: "text-purple-100",
        }
      : pet.rarity === "rare"
      ? {
          bg: "bg-gradient-to-br from-blue-500 to-cyan-500",
          ring: "ring-2 ring-blue-300",
          animation: "animate-pulse",
          label: "🔵 RARE",
          labelColor: "text-blue-100",
        }
      : {
          bg: "bg-white",
          ring: "ring-0",
          animation: "",
          label: "🟢 COMMON",
          labelColor: "text-green-600",
        };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 🎆 Confetti */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {Array.from({ length: pet.rarity === "epic" ? 40 : 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute block h-2 w-2 animate-ping rounded-full"
              style={{
                background:
                  pet.rarity === "epic" ? "#c084fc" : "#60a5fa",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* Dim background */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={`relative z-10 w-80 rounded-2xl p-6 text-center shadow-2xl ${rarityStyle.bg} ${rarityStyle.ring}`}
      >
        <div className="text-sm text-white/80 mb-1">
          🎉 획득!
        </div>

        {/* 🎯 Pity (천장) message */}
{pet.pityLabel && (
  <div className="mb-2 rounded-md bg-black/30 px-3 py-2 text-xs font-bold text-yellow-200 animate-pulse">
    🔥 천장 발동!<br />
    <span className="text-yellow-100">
      {pet.pityLabel}
    </span>
  </div>
)}

        {/* Rarity label */}
        <div
          className={`text-xs font-bold mb-3 tracking-widest ${rarityStyle.labelColor}`}
        >
          {rarityStyle.label}
        </div>

        <div
          className={`text-7xl mb-4 drop-shadow-xl ${rarityStyle.animation}`}
        >
          {pet.emoji || "🐾"}
        </div>

        <div className="text-lg font-bold mb-6 text-white">
          {pet.name}
        </div>

        {/* Duplicate reward message */}
        {pet.isDuplicate && (
          <div className="mb-4 text-sm font-semibold text-yellow-200">
            ♻️ 중복! 보상 획득<br />
            <span className="text-yellow-100">
              {pet.rewardLabel}
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-black/30 py-2 text-white font-semibold hover:bg-black/40 transition"
          autoFocus
        >
          확인
        </button>
      </div>
    </div>
  );
}