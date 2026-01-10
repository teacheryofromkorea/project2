import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

function ChartBar({ stat, colorClass, delay }) {
    const controls = useAnimation();
    const [prevValue, setPrevValue] = useState(stat.value);

    // 🌟 펄스 애니메이션: 값이 증가하면 바가 밝게 빛나며 살짝 커짐
    useEffect(() => {
        if (stat.value > prevValue) {
            controls.start({
                scaleY: [1, 1.3, 1], // 살짝 두꺼워짐
                filter: ["brightness(1)", "brightness(2)", "brightness(1)"], // 밝기 증가
                transition: { duration: 0.4, ease: "easeOut" }
            });
        }
        setPrevValue(stat.value);
    }, [stat.value, prevValue, controls]);

    const percent = stat.max > 0 ? (stat.value / stat.max) * 100 : 0;

    return (
        <div className="group">
            {/* 라벨 행: 아이콘 + 이름 + 값 */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-base">{stat.icon || "✨"}</span>
                    <span className="text-sm font-medium text-white/90">
                        {stat.name}
                    </span>
                </div>
                <div className="flex items-baseline gap-1">
                    <motion.span
                        key={stat.value} // 값이 바뀔 때마다 리액션
                        initial={{ scale: 1.2, color: "#ffffff" }}
                        animate={{ scale: 1, color: "rgba(255,255,255,0.8)" }}
                        className="text-sm font-bold"
                    >
                        {stat.value}
                    </motion.span>
                    <span className="text-xs text-white/40 font-normal">/ {stat.max}</span>
                </div>
            </div>

            {/* 막대 바 컨테이너 */}
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                {/* 메인 프로그레스 바 */}
                <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{
                        width: `${percent}%`,
                        filter: percent >= 100 ? "drop-shadow(0 0 6px rgba(255,255,255,0.7))" : "none" // 100% 도달 시 강력한 Glow
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: delay }}
                >
                    {/* ✨ 쉬머 효과 (은은하게 지나가는 빛) */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 -left-[100%] w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-[shimmer_2s_infinite]" />
                    </div>
                </motion.div>

                {/* 💓 펄스 효과 레이어 (값 변경 시 발동) */}
                <motion.div
                    animate={controls}
                    className={`absolute inset-y-0 left-0 rounded-full bg-white mix-blend-overlay opacity-50`}
                    style={{ width: `${percent}%` }}
                />

                {/* 정적 광택 효과 (메탈릭 느낌) */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
            </div>
        </div>
    );
}

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
            {/* 
                 tailwind.config.js에 keyframes 추가가 필요할 수 있으므로, 
                 여기서 바로 style 태그로 애니메이션 정의 (안전책) 
             */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>

            {stats.map((stat, idx) => {
                const colorClass = colorPalette[idx % colorPalette.length];

                return (
                    <ChartBar
                        key={idx}
                        stat={stat}
                        colorClass={colorClass}
                        delay={idx * 0.05}
                    />
                );
            })}
        </div>
    );
}
