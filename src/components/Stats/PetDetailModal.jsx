import React, { useEffect } from "react";

export default function PetDetailModal({ pet, isOpen, onClose }) {
  if (!isOpen || !pet) return null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const rarityStyle = {
    common: {
      label: "COMMON",
      glow: "shadow-[0_0_20px_rgba(255,255,255,0.15)]",
      text: "text-gray-200",
    },
    rare: {
      label: "RARE",
      glow: "shadow-[0_0_30px_rgba(80,160,255,0.4)]",
      text: "text-blue-300",
    },
    epic: {
      label: "EPIC",
      glow: "shadow-[0_0_40px_rgba(180,120,255,0.5)]",
      text: "text-purple-300",
    },
    legendary: {
      label: "LEGENDARY",
      glow: "shadow-[0_0_50px_rgba(255,215,120,0.6)]",
      text: "text-yellow-300",
    },
  }[pet.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-[360px] rounded-[28px]
  bg-gradient-to-br from-[#24123f] via-[#1b0f2e] to-[#120b24]
  p-7 text-white
  transition-all duration-500 ease-out
  animate-scaleIn
  ${rarityStyle.glow}`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white transition"
        >
          ✕
        </button>

        {/* Emoji */}
        <div className="flex justify-center mt-6 mb-4 relative">
          <div className="absolute inset-0 flex justify-center items-center blur-2xl opacity-60">
            <span className="text-7xl">{pet.emoji}</span>
          </div>
          <div className="relative text-7xl drop-shadow-2xl scale-110">
            {pet.emoji}
          </div>
        </div>

        {/* Name */}
        <h2 className="text-xl font-semibold text-center mb-1">
          {pet.name}
        </h2>

        {/* Rarity badge */}
        <div className="flex justify-center mb-4">
          <span
            className={`rounded-full px-4 py-1 text-xs tracking-[0.3em]
  bg-white/10 backdrop-blur-md border border-white/10
  ${rarityStyle.text}`}
          >
            {rarityStyle.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-center text-sm leading-relaxed text-white/85 px-3 mt-1">
          {pet.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex justify-center">
          <span className="text-xs text-white/40">
            SET · {pet.setId.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}