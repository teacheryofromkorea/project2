import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import BaseModal from "../common/BaseModal";

const BASE_TIMING = {
  SPIN: 2200,
  IMPACT: 600,
  RESULT_DELAY: 300,
};

const PAUSE_BY_RARITY = {
  common: 400,
  rare: 800,
  epic: 1200,
  legendary: 1800,
};

/**
 * 🎰 GachaSlotModal — Figma 95% Match
 * - Size 유지
 * - Tone / Gradient / Spacing 정밀 보정
 * - 결과 / 로직 없음 (순수 Slot UI)
 */
export default function GachaSlotModal({
  isOpen,
  onClose,
  disabled = false,
  onResult,
  resultPet,
  rarity,
}) {
  const [phase, setPhase] = useState("idle"); // "idle" | "spinning" | "pause" | "result"
  const [impact, setImpact] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
    }
  }, [isOpen]);

  const handlePull = () => {
    if (disabled || phase !== "idle") return;

    setPhase("spinning");

    // 1️⃣ 회전 + 흔들림
    setTimeout(() => {
      setPhase("pause");
      // 2️⃣ 완전 정적 구간
      const pauseTime = PAUSE_BY_RARITY[rarity];
      setTimeout(() => {
        setImpact(true);
        setPhase("result");
        setTimeout(() => setImpact(false), BASE_TIMING.IMPACT);
        setTimeout(() => {
          onResult?.({
            pet: resultPet,
            rarity,
          });
        }, BASE_TIMING.RESULT_DELAY);
      }, pauseTime);
    }, BASE_TIMING.SPIN);
  };



  // We remove the manual portal and backdrop here, and use BaseModal.
  // We keep the effects in a portal to ensure they overlay everything properly, 
  // or we can put them inside BaseModal if we adjust z-indices?
  // Since BaseModal has z-50/100, we want effects to be z-120 (above modal).
  // So a separate portal is best for Effects.

  return (
    <>
      {/* 🌟 Global Effects Layer (Fixed on top of everything) */}
      {createPortal(
        <div className="fixed inset-0 z-[150] pointer-events-none">
          {impact && (
            <div className="absolute inset-0 bg-white animate-gacha-flash" />
          )}
          {phase === "pause" && (
            <div className="absolute inset-0">
              {/* Breathing Darken - We want this to be global dim? 
                   BaseModal already dims. So maybe we skip this or make it subtle?
                   Original was bg-black/40. BaseModal is bg-black/50.
                   Let's keep the effects but maybe not the solid dark bg if it conflicts.
                   Actually, stacking dims is fine for drama.
               */}
              <div className="absolute inset-0 bg-black/40 animate-pause-breath" />
              <div className="absolute inset-0 animate-pause-radial" />
              <div className="absolute inset-0 animate-pause-heartbeat" />
            </div>
          )}
          {phase === "result" && rarity === "legendary" && (
            <div className="absolute inset-0 animate-legendary-world" />
          )}
          {phase === "result" && rarity === "legendary" && (
            <>
              {/* Legendary Radial Burst */}
              <div className="absolute inset-0 animate-legendary-burst" />
              {/* Legendary Shockwave Ring */}
              <div className="absolute inset-0 animate-legendary-ring" />
              {/* Legendary Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-yellow-300 text-xl animate-legendary-particle"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${i * 25}deg) translateY(-140px)`,
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    ✨
                  </span>
                ))}
              </div>
            </>
          )}
        </div>,
        document.body
      )}

      {/* 🎰 Main Modal Content */}
      <BaseModal isOpen={isOpen} onClose={onClose}>
        {/* Modal Card */}
        <div
          className={`relative w-[720px] max-w-[90vw] rounded-[28px] 
                bg-[#0A1020] border border-white/10 
                shadow-[0_20px_80px_rgba(0,0,0,0.6)] 
                overflow-hidden
                ${phase === "spinning" ? "gacha-shake" : ""}
                ${impact ? "gacha-impact-scale" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              🎰 신비로운 가챠머신
            </h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-10 py-14">
            {/* Gradient Card */}
            <div className={`relative rounded-[32px] px-12 py-16 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(168,85,247,0.35)] ${impact ? "gacha-impact-glow" : ""}`}>
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-[32px] bg-white/10 blur-3xl" />

              {/* Dice Orb */}
              <div className="relative z-10 w-56 h-56 rounded-full bg-white/25 flex items-center justify-center">
                {phase === "idle" && (
                  <div className="w-36 h-36 rounded-full bg-white/35 flex items-center justify-center text-[72px]">
                    🎲
                  </div>
                )}
                {phase === "spinning" && (
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-white/40 blur-xl animate-pulse" />
                    <div className="w-36 h-36 rounded-full bg-white/35 flex items-center justify-center text-[72px] gacha-spin">
                      🎲
                    </div>
                  </div>
                )}
                {phase === "pause" && (
                  <div className="relative w-36 h-36 rounded-full bg-white/40 flex items-center justify-center text-[72px] gacha-pause-scale-pulse">
                    <div className="absolute inset-0 rounded-full animate-pause-orb-shiver" />
                    🎲
                  </div>
                )}
                {phase === "result" && (
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    {/* 🌌 Epic Portal */}
                    {rarity === "epic" && (
                      <>
                        <div className="absolute inset-0 rounded-full animate-epic-portal" />
                        <div className="absolute inset-0 rounded-full animate-epic-ring" />
                      </>
                    )}
                    {/* 💎 Rare Portal */}
                    {rarity === "rare" && (
                      <>
                        {/* Soft Blue Aura */}
                        <div className="absolute inset-0 rounded-full animate-rare-aura" />

                        {/* Expanding Spark Ring */}
                        <div className="absolute inset-0 rounded-full animate-rare-spark-ring" />

                        {/* Floating Spark Particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <span
                              key={i}
                              className="absolute text-blue-200 text-lg animate-rare-particle"
                              style={{
                                top: "50%",
                                left: "50%",
                                transform: `rotate(${i * 45}deg) translateY(-110px)`,
                                animationDelay: `${i * 0.05}s`,
                              }}
                            >
                              ✦
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {/* 🎴 Result Card */}
                    <div
                      className={`
                      relative z-10 w-40 h-48 rounded-2xl
                      bg-gradient-to-b from-white to-gray-100
                      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                      flex flex-col items-center justify-center
                      text-gray-900 font-bold
                      ${rarity === "epic"
                          ? "animate-epic-card-emerge"
                          : rarity === "rare"
                            ? "animate-rare-card-rise"
                            : rarity === "common"
                              ? "animate-common-pop"
                              : ""
                        }
                    `}
                    >
                      <div className="text-5xl mb-2">
                        {resultPet?.emoji || "❓"}
                      </div>
                      <div className="text-sm font-semibold uppercase tracking-wide">
                        {resultPet?.rarity?.toUpperCase() || ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-12 flex justify-center gap-6">
              <button
                onClick={handlePull}
                disabled={disabled || phase === "spinning"}
                className={`px-12 py-5 rounded-2xl text-lg font-bold transition-all ${disabled || phase === "spinning"
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_10px_30px_rgba(168,85,247,0.6)] hover:scale-[1.04]"
                  }`}
              >
                🎲 가챠 뽑기
              </button>

              <button
                onClick={onClose}
                className="px-12 py-5 rounded-2xl text-lg font-semibold bg-white text-gray-800 hover:bg-gray-200 transition"
              >
                닫기
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-white/60">
              쿠폰 1장 필요
            </div>
          </div>
          <style>{`
@keyframes rare-aura {
  0% {
    opacity: 0;
    transform: scale(0.6);
    filter: blur(10px);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
    filter: blur(4px);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
    filter: blur(12px);
  }
}
.animate-rare-aura {
  background: radial-gradient(
    circle,
    rgba(96,165,250,0.85),
    rgba(56,189,248,0.55),
    transparent 70%
  );
  animation: rare-aura 0.9s ease-out;
}

@keyframes rare-spark-ring {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  60% {
    opacity: 0.8;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.7);
  }
}
.animate-rare-spark-ring {
  border: 2px solid rgba(96,165,250,0.9);
  animation: rare-spark-ring 0.8s ease-out;
}

@keyframes rare-card-rise {
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.9);
  }
  70% {
    opacity: 1;
    transform: translateY(-6px) scale(1.05);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
.animate-rare-card-rise {
  animation: rare-card-rise 0.75s cubic-bezier(0.22,1,0.36,1);
}
          @keyframes gacha-spin {
            /* 회전 애니메이션: 결과 직전 pause 대비용 */
            0% { transform: rotate(0deg) scale(1); }
            60% { transform: rotate(540deg) scale(1.05); }
            100% { transform: rotate(720deg) scale(1); }
          }
          .gacha-spin {
            animation: gacha-spin 1.8s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes gacha-shake {
            0% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-2px, 1px) rotate(-0.3deg); }
            20% { transform: translate(2px, -1px) rotate(0.3deg); }
            30% { transform: translate(-3px, 2px) rotate(-0.4deg); }
            40% { transform: translate(3px, -2px) rotate(0.4deg); }
            50% { transform: translate(-2px, 1px) rotate(-0.2deg); }
            60% { transform: translate(2px, -1px) rotate(0.2deg); }
            70% { transform: translate(-1px, 1px) rotate(-0.1deg); }
            80% { transform: translate(1px, -1px) rotate(0.1deg); }
            90% { transform: translate(0px, 1px) rotate(0deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          .gacha-shake {
            animation: gacha-shake 0.6s infinite;
          }

          @keyframes gacha-flash {
            0% { opacity: 0; }
            15% { opacity: 0.9; }
            100% { opacity: 0; }
          }
          .animate-gacha-flash {
            animation: gacha-flash 0.6s ease-out;
          }

          @keyframes gacha-impact-scale {
            0% { transform: scale(0.94); }
            60% { transform: scale(1.06); }
            100% { transform: scale(1); }
          }
          .gacha-impact-scale {
            animation: gacha-impact-scale 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .gacha-impact-glow {
            box-shadow:
              0 0 120px rgba(236,72,153,0.9),
              0 0 200px rgba(168,85,247,0.9),
              0 0 260px rgba(99,102,241,0.9);
          }

          @keyframes common-pop {
            0% { transform: scale(0.6); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-common-pop {
            animation: common-pop 0.4s ease-out;
          }

          @keyframes rare-pop {
            0% { transform: scale(0.5) rotate(-5deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .animate-rare-pop {
            animation: rare-pop 0.5s cubic-bezier(0.22,1,0.36,1);
          }

          @keyframes epic-pop {
            0% { transform: scale(0.4) rotate(-15deg); opacity: 0; }
            60% { transform: scale(1.15) rotate(6deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .animate-epic-pop {
            animation: epic-pop 0.7s cubic-bezier(0.22,1,0.36,1);
          }

          @keyframes legendary-pop {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.4); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-legendary-pop {
            animation: legendary-pop 0.9s cubic-bezier(0.22,1,0.36,1);
          }
        
                  @keyframes legendary-burst {
            0% {
              opacity: 0;
              transform: scale(0.4);
            }
            40% {
              opacity: 0.9;
              transform: scale(1.6);
            }
            100% {
              opacity: 0;
              transform: scale(2.4);
            }
          }
          .animate-legendary-burst {
            background: radial-gradient(
              circle,
              rgba(255,215,0,0.9) 0%,
              rgba(236,72,153,0.7) 35%,
              rgba(99,102,241,0.6) 55%,
              transparent 75%
            );
            animation: legendary-burst 0.9s ease-out;
          }

          @keyframes legendary-ring {
            0% {
              opacity: 0;
              transform: scale(0.2);
            }
            50% {
              opacity: 0.9;
              transform: scale(1.4);
            }
            100% {
              opacity: 0;
              transform: scale(2);
            }
          }
          .animate-legendary-ring {
            border-radius: 9999px;
            border: 3px solid rgba(255,215,0,0.9);
            animation: legendary-ring 0.8s cubic-bezier(0.22,1,0.36,1);
          }

          @keyframes legendary-particle {
            0% {
              opacity: 0;
              transform: scale(0) translateY(0);
            }
            40% {
              opacity: 1;
              transform: scale(1.4) translateY(-20px);
            }
            100% {
              opacity: 0;
              transform: scale(0.8) translateY(-80px);
            }
          }
          .animate-legendary-particle {
            animation: legendary-particle 1s ease-out forwards;
          }
        
        @keyframes legendary-world {
          0% {
            opacity: 0;
            background: radial-gradient(circle at center, rgba(255,215,0,0.0), transparent 70%);
          }
          25% {
            opacity: 0.9;
            background: radial-gradient(circle at center, rgba(255,215,0,0.8), rgba(168,85,247,0.6), transparent 70%);
          }
          50% {
            opacity: 1;
            background: radial-gradient(circle at center, rgba(236,72,153,0.9), rgba(99,102,241,0.7), transparent 75%);
          }
          75% {
            opacity: 0.8;
            background: radial-gradient(circle at center, rgba(168,85,247,0.8), rgba(236,72,153,0.6), transparent 80%);
          }
          100% {
            opacity: 0;
            background: radial-gradient(circle at center, rgba(255,255,255,0.0), transparent 90%);
          }
        }
        .animate-legendary-world {
          animation: legendary-world 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes gacha-pause-scale-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.85;
          }
        }
        .gacha-pause-scale-pulse {
          animation: gacha-pause-scale-pulse 0.8s ease-in-out infinite;
        }

@keyframes pause-breath {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.55; }
}
.animate-pause-breath {
  animation: pause-breath 1.6s ease-in-out infinite;
}

@keyframes pause-radial {
  0% {
    opacity: 0.2;
    background: radial-gradient(circle at center, rgba(168,85,247,0.2), transparent 70%);
  }
  50% {
    opacity: 0.45;
    background: radial-gradient(circle at center, rgba(236,72,153,0.35), transparent 75%);
  }
  100% {
    opacity: 0.2;
    background: radial-gradient(circle at center, rgba(168,85,247,0.2), transparent 80%);
  }
}
.animate-pause-radial {
  animation: pause-radial 2.4s ease-in-out infinite;
}

@keyframes pause-heartbeat {
  0% { transform: scale(1); opacity: 0.25; }
  20% { transform: scale(1.02); opacity: 0.4; }
  40% { transform: scale(1); opacity: 0.25; }
  60% { transform: scale(1.05); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.25; }
}
.animate-pause-heartbeat {
  animation: pause-heartbeat 1.8s ease-in-out infinite;
}

@keyframes pause-orb-shiver {
  0% { transform: translate(0,0); opacity: 0; }
  25% { transform: translate(-1px, 1px); opacity: 0.3; }
  50% { transform: translate(1px, -1px); opacity: 0.3; }
  75% { transform: translate(-1px, -1px); opacity: 0.3; }
  100% { transform: translate(0,0); opacity: 0; }
}
.animate-pause-orb-shiver {
  animation: pause-orb-shiver 0.35s linear infinite;
}
        
@keyframes epic-portal {
  0% {
    opacity: 0;
    transform: scale(0.4) rotate(0deg);
    filter: blur(8px);
  }
  40% {
    opacity: 0.8;
    transform: scale(1.1) rotate(120deg);
    filter: blur(2px);
  }
  100% {
    opacity: 0;
    transform: scale(1.6) rotate(240deg);
    filter: blur(12px);
  }
}

.animate-epic-portal {
  background: radial-gradient(
    circle,
    rgba(168,85,247,0.9) 0%,
    rgba(99,102,241,0.7) 40%,
    rgba(236,72,153,0.4) 60%,
    transparent 75%
  );
  animation: epic-portal 1.2s cubic-bezier(0.22,1,0.36,1);
}

@keyframes epic-ring {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.8);
  }
}

.animate-epic-ring {
  border: 3px solid rgba(168,85,247,0.9);
  animation: epic-ring 1s ease-out;
}

@keyframes epic-card-emerge {
  0% {
    opacity: 0;
    transform: scale(0.2) translateY(40px) rotateX(40deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) translateY(-6px) rotateX(0deg);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

.animate-epic-card-emerge {
  animation: epic-card-emerge 0.9s cubic-bezier(0.22,1,0.36,1);
}        


@keyframes rare-particle {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(0);
  }
  40% {
    opacity: 1;
    transform: scale(1.2) translateY(-18px);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) translateY(-60px);
  }
}
.animate-rare-particle {
  animation: rare-particle 0.9s ease-out forwards;
}
  
        `}</style>
        </div>
      </BaseModal>
    </>
  );
}


