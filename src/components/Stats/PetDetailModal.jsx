import React, { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";

export default function PetDetailModal({ pet, isOpen, onClose }) {
  const [displayPet, setDisplayPet] = useState(pet);

  useEffect(() => {
    if (pet) setDisplayPet(pet);
  }, [pet]);

  // isOpen check handled by BaseModal
  if (!displayPet) return null;

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
  }[displayPet.rarity];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <div
        className={`relative w-[360px] rounded-[28px]
  bg-gradient-to-br from-[#24123f] via-[#1b0f2e] to-[#120b24]
  p-7 text-white
  transition-all duration-500 ease-out
  animate-scaleIn
  ${rarityStyle.glow}
  shadow-2xl border border-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white transition p-2"
        >
          ✕
        </button>

        {/* Emoji */}
        <div className="flex justify-center mt-6 mb-4 relative">
          <div className="absolute inset-0 flex justify-center items-center blur-2xl opacity-60">
            <span className="text-7xl">{displayPet.emoji}</span>
          </div>
          <div className="relative text-7xl drop-shadow-2xl scale-110">
            {displayPet.emoji}
          </div>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold text-center mb-1 text-white">
          {displayPet.name}
        </h2>

        {/* Rarity badge */}
        <div className="flex justify-center mb-6">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase
  bg-white/5 backdrop-blur-md border border-white/10
  ${rarityStyle.text}`}
          >
            {rarityStyle.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-center text-sm leading-relaxed text-blue-100/70 px-4 mt-2 mb-6">
          {displayPet.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex justify-center border-t border-white/5 pt-4">
          <span className="text-[10px] text-white/30 tracking-widest font-light">
            SET · {displayPet.setId.toUpperCase()}
          </span>
        </div>
      </div>
    </BaseModal>
  );
}