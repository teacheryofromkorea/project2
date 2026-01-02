import React from "react";
import { petsData, petSets } from "../../constants/pets";

// 🔤 내부 rarity -> 한글 표시 매핑
const RARITY_LABEL = {
    common: "일반",
    rare: "희귀",
    epic: "영웅",
    legendary: "전설",
};

const RARITY_COLOR = {
    common: "text-yellow-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-red-500",
};

export default function PetShopModal({
    isOpen,
    onClose,
    rarity,        // "common" | "rare" | "epic" | "legendary"
    cost,
    currentFragments,
    ownedPetIds = [],
    onBuy,         // (pet) => void
}) {
    if (!isOpen) return null;

    // 1. 해당 등급의 펫 필터링
    const availablePets = petsData.filter((p) => p.rarity === rarity);

    // 2. 세트 이름 찾기 헬퍼
    const getSetName = (setId) => {
        return petSets.find((s) => s.id === setId)?.name || "알 수 없음";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-[#1a1c23] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <span className="text-3xl">🛍️</span>
                            <span className={RARITY_COLOR[rarity]}>{RARITY_LABEL[rarity]}</span>
                            <span>펫 상점</span>
                        </h2>
                        <div className="text-white/60 text-sm mt-1">
                            원하는 펫을 선택해서 입양하세요! (가격: <span className="text-white font-bold">{cost}</span>조각)
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">
                            <span className="text-white/60 text-sm mr-2">보유 조각</span>
                            <span className="text-xl font-bold text-white">{currentFragments}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 펫 그리드 (스크롤) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {availablePets.map((pet) => {
                            const isOwned = ownedPetIds.includes(pet.id);
                            const canAfford = currentFragments >= cost;

                            return (
                                <div
                                    key={pet.id}
                                    className={`
                    relative group rounded-2xl p-4 flex flex-col items-center text-center transition-all border
                    ${isOwned
                                            ? "bg-white/5 border-white/5 opacity-50 grayscale" // 보유중: 흐리게
                                            : "bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-white/30 hover:bg-white/15 hover:-translate-y-1 shadow-lg"
                                        }
                  `}
                                >
                                    {/* 세트 배지 */}
                                    <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white/70 border border-white/5">
                                        {getSetName(pet.setId)}
                                    </div>

                                    {/* 펫 이모지 */}
                                    <div className="text-6xl mb-3 mt-2 transform transition-transform group-hover:scale-110">
                                        {pet.emoji}
                                    </div>

                                    {/* 이름 */}
                                    <div className="font-bold text-white mb-4">{pet.name}</div>

                                    {/* 액션 버튼 */}
                                    {isOwned ? (
                                        <div className="mt-auto px-4 py-1.5 rounded-lg bg-white/10 text-white/50 text-xs font-bold w-full">
                                            보유중
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onBuy(pet)}
                                            disabled={!canAfford}
                                            className={`
                        mt-auto w-full px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg
                        ${canAfford
                                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 hover:shadow-blue-500/25"
                                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                                                }
                      `}
                                        >
                                            {canAfford ? "입양하기" : "조각 부족"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
