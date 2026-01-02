import React, { useEffect } from "react";
import { createPortal } from "react-dom";



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
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 🎨 등급별 테마 설정
  const theme = {
    common: {
      bg: "bg-white",
      border: "border-gray-200",
      text: "text-gray-900",
      subText: "text-gray-500",
      badgeData: { label: "일반", icon: "🌱", color: "text-green-600 bg-green-100" },
      glow: "shadow-gray-200",
      btn: "bg-gray-900 text-white hover:bg-gray-800",
      animation: "animate-pop-in",
    },
    rare: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200",
      text: "text-blue-900",
      subText: "text-blue-600/80",
      badgeData: { label: "희귀", icon: "💎", color: "text-blue-600 bg-blue-100" },
      glow: "shadow-blue-200",
      btn: "bg-blue-600 text-white hover:bg-blue-500",
      animation: "animate-float-up",
    },
    epic: {
      bg: "bg-[#1a0b2e]", // Deep Purple Dark Mode style for Epic
      border: "border-purple-500/50",
      text: "text-purple-100",
      subText: "text-purple-300/70",
      badgeData: { label: "영웅", icon: "🔮", color: "text-purple-200 bg-purple-900/50 border border-purple-500/30" },
      glow: "shadow-purple-500/40",
      btn: "bg-purple-600 text-white hover:bg-purple-500",
      animation: "animate-flip-in",
    },
    legendary: {
      bg: "bg-gradient-to-b from-amber-900 to-black",
      border: "border-yellow-500",
      text: "text-yellow-100",
      subText: "text-yellow-200/60",
      badgeData: { label: "전설", icon: "👑", color: "text-yellow-100 bg-yellow-900/50 border border-yellow-500" },
      glow: "shadow-yellow-500/50",
      btn: "bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:brightness-110",
      animation: "animate-legendary-entry",
    },
  }[pet.rarity];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dim Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 pointer-events-auto"
        onClick={onClose}
      />

      {/* ✨ Legendary Background Rays (Screen Wide) */}
      {pet.rarity === "legendary" && (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[150vw] h-[150vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,215,0,0.1)_20deg,transparent_40deg,rgba(255,215,0,0.1)_60deg,transparent_80deg,rgba(255,215,0,0.1)_100deg,transparent_120deg,rgba(255,215,0,0.1)_140deg,transparent_160deg,rgba(255,215,0,0.1)_180deg,transparent_200deg,rgba(255,215,0,0.1)_220deg,transparent_240deg,rgba(255,215,0,0.1)_260deg,transparent_280deg,rgba(255,215,0,0.1)_300deg,transparent_320deg,rgba(255,215,0,0.1)_340deg,transparent_360deg)] animate-spin-slow-custom opacity-50" />
        </div>
      )}

      {/* 🃏 Card Container */}
      <div
        className={`
          relative z-10 w-[380px] rounded-[32px] p-8
          flex flex-col items-center pointer-events-auto
          shadow-2xl transition-all duration-500
          ${theme.bg} border-2 ${theme.border}
          ${pet.rarity === "legendary" ? "shadow-[0_0_80px_rgba(234,179,8,0.4)]" : ""}
          ${pet.rarity === "epic" ? "shadow-[0_0_50px_rgba(168,85,247,0.3)]" : ""}
          ${theme.animation}
        `}
      >
        {/* ✨ Background Effects per Rarity */}
        {pet.rarity === "rare" && (
          <div className="absolute inset-0 overflow-hidden rounded-[30px] pointer-events-none">
            <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine" />
          </div>
        )}

        {pet.rarity === "epic" && (
          <div className="absolute inset-0 overflow-hidden rounded-[30px] pointer-events-none">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] animate-pulse" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 blur-[50px] rounded-full" />
          </div>
        )}

        {/* 🏷️ Badge */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6
          ${theme.badgeData.color}
        `}>
          <span>{theme.badgeData.icon}</span>
          <span>{theme.badgeData.label}</span>
        </div>

        {/* 🦁 Pet Circle */}
        <div className="relative mb-6">
          {/* Epic/Legendary Back Glow */}
          {(pet.rarity === "epic" || pet.rarity === "legendary") && (
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 scale-110 ${pet.rarity === "legendary" ? "bg-yellow-500" : "bg-purple-500"}`} />
          )}

          <div className={`
            relative z-10 w-40 h-40 rounded-full flex items-center justify-center text-8xl shadow- inner
            ${pet.rarity === "legendary" ? "bg-gradient-to-br from-yellow-300 to-amber-600 border-4 border-yellow-200" :
              pet.rarity === "epic" ? "bg-gradient-to-br from-purple-400 to-indigo-600 border-4 border-purple-300/50" :
                pet.rarity === "rare" ? "bg-gradient-to-br from-blue-400 to-cyan-300 border-4 border-white" :
                  "bg-gray-100 border-4 border-white"}
            shadow-xl
          `}>
            <span className="drop-shadow-md transform hover:scale-110 transition-transform duration-300">{pet.emoji}</span>
          </div>

          {/* Legendary Crown/Sparkles */}
          {pet.rarity === "legendary" && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl animate-bounce pointer-events-none">👑</div>
          )}
        </div>

        {/* 📝 Name */}
        <h2 className={`text-2xl font-black mb-2 text-center ${theme.text}`}>
          {pet.name}
        </h2>

        {/* 📄 Description */}
        <p className={`text-sm text-center mb-6 leading-relaxed px-2 ${theme.subText}`}>
          {pet.description || "새로운 친구를 획득했습니다! 이 친구가 마음에 드시나요?"}
        </p>

        {/* ♻️ Duplicate Info */}
        {isDuplicate && (
          <div className={`
            w-full mb-6 p-4 rounded-xl text-center
            ${pet.rarity === "legendary" || pet.rarity === "epic" ? "bg-white/10" : "bg-gray-50"}
          `}>
            <div className={`text-xs font-bold mb-1 ${pet.rarity === "legendary" || pet.rarity === "epic" ? "text-white/90" : "text-gray-900"}`}>
              이미 함께하고 있는 친구네요!
            </div>
            <div className={`text-sm font-bold ${pet.rarity === "legendary" || pet.rarity === "epic" ? "text-yellow-300" : "text-indigo-600"}`}>
              {rewardLabel} 획득 완료
            </div>
          </div>
        )}

        {/* ✅ Button */}
        <button
          onClick={onClose}
          className={`
            relative z-50 w-full py-4 rounded-2xl font-bold text-lg shadow-lg
            transform transition-all duration-200 hover:scale-[1.02] active:scale-95
            ${theme.btn}
          `}
        >
          확인
        </button>
      </div>

      <style>{`
        @keyframes shine {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { left: 200%; opacity: 0; }
        }
        .animate-shine {
          animation: shine 2s infinite linear;
        }

        @keyframes spin-slow-custom {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow-custom {
          animation: spin-slow-custom 20s linear infinite;
        }

        /* 1. Common: Pop In */
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        /* 2. Rare: Float Up (Smooth) */
        .animate-float-up {
          animation: floatUp 0.6s ease-out forwards;
        }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* 3. Epic: 3D Flip (Dramatic - Slower) */
        .animate-flip-in {
          animation: flipIn 1.0s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          perspective: 1000px;
        }
        @keyframes flipIn {
          0% { opacity: 0; transform: rotateX(90deg) scale(0.5); }
          60% { transform: rotateX(-10deg) scale(1.05); }
          100% { opacity: 1; transform: rotateX(0) scale(1); }
        }

        /* 4. Legendary: Impact (Explosive - Much Slower) */
        .animate-legendary-entry {
          animation: legendaryEntry 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes legendaryEntry {
          0% { opacity: 0; transform: scale(3); filter: blur(10px); }
          40% { opacity: 1; transform: scale(0.95); filter: blur(0); }
          60% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
// animation helpers expected:
// animate-fade-in        (common)
// animate-float-in       (rare)
// animate-dimension-in   (epic)
// animate-legendary-impact (legendary)
// animate-scale-in
// animate-pop-in