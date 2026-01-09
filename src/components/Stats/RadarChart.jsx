import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function RadarChart({
    stats = [], // { name, value, max }[]
    size = 300,
}) {
    const center = size / 2;
    const radius = (size / 2) - 40; // 여백 확보

    // 1. 축 정보 계산
    const axes = useMemo(() => {
        const total = stats.length;
        return stats.map((stat, i) => {
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2; // -90도부터 시작 (12시 방향)
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            // 라벨 위치 (반지름보다 조금 더 멀리)
            const labelRadius = radius + 28;
            const labelX = center + labelRadius * Math.cos(angle);
            const labelY = center + labelRadius * Math.sin(angle);

            return { ...stat, angle, x, y, labelX, labelY };
        });
    }, [stats, center, radius]);

    // 2. 값 폴리곤 포인트 계산 (최소 표시 반경 적용)
    const pointsString = useMemo(() => {
        return axes
            .map((axis) => {
                // 실제 비율 계산
                const rawRatio = axis.max > 0 ? axis.value / axis.max : 0;
                const clampedRatio = Math.min(1, Math.max(0, rawRatio));

                // 시각적 최소 크기 보정: 최소 15% 크기로 보이도록 (0이면 0 유지)
                // 이렇게 하면 작은 값도 차이가 보임
                const minVisualRatio = 0.15;
                const visualRatio = axis.value === 0
                    ? 0
                    : minVisualRatio + (1 - minVisualRatio) * clampedRatio;

                const r = radius * visualRatio;
                const x = center + r * Math.cos(axis.angle);
                const y = center + r * Math.sin(axis.angle);
                return `${x},${y}`;
            })
            .join(" ");
    }, [axes, center, radius]);

    // 그리드(거미줄) 레벨 (예: 25%, 50%, 75%, 100%)
    const gridLevels = [0.25, 0.5, 0.75, 1];

    if (stats.length < 3) {
        return (
            <div
                className="flex items-center justify-center text-white/50 text-sm"
                style={{ width: size, height: size }}
            >
                역량이 3개 이상이어야 그래프가 표시됩니다.
            </div>
        );
    }

    return (
        <div className="relative flex justify-center items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* 배경 그라데이션 (원형) */}
                <defs>
                    <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                    </radialGradient>
                </defs>
                <circle cx={center} cy={center} r={radius} fill="url(#radarBg)" />

                {/* 배경 그리드 (거미줄) */}
                {gridLevels.map((level, idx) => (
                    <polygon
                        key={level}
                        points={axes
                            .map((axis) => {
                                const r = radius * level;
                                const x = center + r * Math.cos(axis.angle);
                                const y = center + r * Math.sin(axis.angle);
                                return `${x},${y}`;
                            })
                            .join(" ")}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* 축 선 */}
                {axes.map((axis, i) => (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={axis.x}
                        y2={axis.y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* 데이터 폴리곤 (애니메이션) */}
                <motion.polygon
                    points={pointsString}
                    fill="rgba(167, 139, 250, 0.35)" // Violet-400 with opacity
                    stroke="#a78bfa" // Violet-400
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, points: pointsString }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />

                {/* 꼭짓점 점 */}
                {axes.map((axis, i) => {
                    const rawRatio = axis.max > 0 ? axis.value / axis.max : 0;
                    const clampedRatio = Math.min(1, Math.max(0, rawRatio));
                    const minVisualRatio = 0.15;
                    const visualRatio = axis.value === 0
                        ? 0
                        : minVisualRatio + (1 - minVisualRatio) * clampedRatio;

                    const r = radius * visualRatio;
                    const px = center + r * Math.cos(axis.angle);
                    const py = center + r * Math.sin(axis.angle);

                    return (
                        <motion.circle
                            key={i}
                            cx={px}
                            cy={py}
                            r="5"
                            fill="#c4b5fd" // Violet-300
                            stroke="#fff"
                            strokeWidth="2"
                            animate={{ cx: px, cy: py }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        />
                    );
                })}

                {/* 라벨 (이름 + 값) */}
                {axes.map((axis, i) => {
                    // 텍스트 정렬 조정 (좌우 위치에 따라 anchor 변경)
                    const isLeft = axis.labelX < center - 10;
                    const isRight = axis.labelX > center + 10;
                    const textAnchor = isRight ? "start" : isLeft ? "end" : "middle";

                    // 상하 위치에 따라 baseline 조정
                    const isTop = axis.labelY < center - 10;
                    const dy = isTop ? "-0.3em" : "0.8em";

                    return (
                        <g key={i}>
                            <text
                                x={axis.labelX}
                                y={axis.labelY}
                                textAnchor={textAnchor}
                                dy={dy}
                                className="text-[11px] fill-white/70 font-medium"
                            >
                                {axis.name}
                            </text>
                            <text
                                x={axis.labelX}
                                y={axis.labelY}
                                textAnchor={textAnchor}
                                dy={isTop ? "0.7em" : "1.9em"}
                                className="text-[10px] fill-violet-300 font-bold"
                            >
                                {axis.value}/{axis.max}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
