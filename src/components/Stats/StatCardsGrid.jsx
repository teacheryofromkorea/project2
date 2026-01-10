import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

function AnimatedNumber({ value }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

function StatCard({ stat, statValue, percent, onIncrease, onDecrease, selectedStudentIds }) {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const buttonRef = useRef(null);

  const handleIncrease = (e) => {
    // 1. 실제 데이터 업데이트
    onIncrease(stat, selectedStudentIds);

    // 2. 플로팅 텍스트 (+1) 추가
    // 버튼 내 클릭 위치가 아니라, 버튼 상단 중앙에서 뜨도록 조정
    const id = Date.now();
    setFloatingTexts((prev) => [...prev, { id, text: "+1" }]);

    // 3. 미니 파티클 효과 (Small confetti burst)
    // 버튼 위치 기준으로 발사
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 20,
        spread: 60,
        origin: { x, y },
        colors: ["#a78bfa", "#e879f9", "#ffffff"], // Violet & Fuchsia hues
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 20,
        shapes: ["circle"],
        scalar: 0.6,
        disableForReducedMotion: true,
        zIndex: 9999, // 모달보다 위에 뜨도록
      });
    }
  };

  const handleFloatingTextComplete = (id) => {
    setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
  };

  return (
    <div className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/5 p-4 text-white shadow-lg relative overflow-visible">

      {/* 플로팅 텍스트 컨테이너 (앱솔루트) */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 120, x: "50%" }} // 버튼 위치 대략 맞춤 (하단 중앙)
              animate={{ opacity: 0, y: 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-0 right-1/2 translate-x-1/2 text-2xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
              onAnimationComplete={() => handleFloatingTextComplete(ft.id)}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 상단: 아이콘 + 이름 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{stat.icon || "✨"}</span>
        <span className="font-semibold text-sm truncate flex-1">
          {stat.name}
        </span>
      </div>

      {/* 중앙: 점수 표시 */}
      <div className="text-2xl font-bold mb-3 text-center">
        <AnimatedNumber value={statValue} />{" "}
        <span className="text-base text-white/50">
          / {stat.max_value}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 하단: +/- 버튼 */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onDecrease(stat, selectedStudentIds)}
          className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold text-lg transition flex items-center justify-center"
        >
          −
        </motion.button>

        <motion.button
          ref={buttonRef}
          whileTap={{ scale: 0.75 }} // 쫀득한 터치감
          onClick={handleIncrease}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white font-bold text-xl shadow-lg shadow-green-500/30 flex items-center justify-center relative overflow-hidden group"
        >
          {/* 버튼 내부 광택 효과 */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          +
        </motion.button>
      </div>
    </div>
  );
}

function StatCardsGrid({
  statTemplates = [],
  studentStatsMap = {},
  selectedStudentIds = [],
  isMultiSelectMode = false,
  onIncrease,
  onDecrease,
  gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}) {
  const getAverageValue = (statId) => {
    if (selectedStudentIds.length === 0) return 0;

    const values = selectedStudentIds.map((studentId) => {
      const stats = studentStatsMap[studentId] || [];
      return (
        stats.find(
          (s) => s.stat_template_id === statId
        )?.value ?? 0
      );
    });

    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  };

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {statTemplates.map((stat) => {
        const statValue = getAverageValue(stat.id);

        const percent =
          stat.max_value > 0
            ? (statValue / stat.max_value) * 100
            : 0;

        return (
          <StatCard
            key={stat.id}
            stat={stat}
            statValue={statValue}
            percent={percent}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            selectedStudentIds={selectedStudentIds}
          />
        );
      })}
    </div>
  );
}

export default StatCardsGrid;