import React from "react";
import { motion } from "framer-motion";

export default function HorizontalStatChart({
    stats = [], // { name, icon, value, max }[]
}) {
    if (stats.length === 0) {
        return (
            <div className="text-white/50 text-sm text-center py-8">
                등록된 역량이 없습니다.
            </div>
        );
    }

    // 막대 색상 그라데이션 팔레트 (역량별로 다른 색상)
    const colorPalette = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-amber-500 to-orange-500",
        "from-rose-500 to-pink-500",
        "from-indigo-500 to-blue-500",
        "from-fuchsia-500 to-pink-500",
        "from-lime-500 to-green-500",
    ];

    return (
        <div className="w-full space-y-4">
            {stats.map((stat, idx) => {
                const percent = stat.max > 0 ? (stat.value / stat.max) * 100 : 0;
                const colorClass = colorPalette[idx % colorPalette.length];

                return (
                    <div key={idx} className="group">
                        {/* 라벨 행: 아이콘 + 이름 + 값 */}
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-base">{stat.icon || "✨"}</span>
                                <span className="text-sm font-medium text-white/90">
                                    {stat.name}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-white/80">
                                {stat.value} <span className="text-white/40 font-normal">/ {stat.max}</span>
                            </span>
                        </div>

                        {/* 막대 바 */}
                        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorClass}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.05 }}
                            />
                            {/* 광택 효과 */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
