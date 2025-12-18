import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLock } from "../../context/LockContext";

/**
 * props
 * - students: [{ id, name, present }]
 *   ※ ToolsPage에서 내려줄 예정
 */
export default function RandomPicker({ students = [] }) {
  const { locked } = useLock();

  // 대상 모드: all | present | selected
  const [mode, setMode] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [result, setResult] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(true);

  // 뽑기 대상 계산
  const candidates = useMemo(() => {
    if (mode === "present") {
      return students.filter((s) => s.present);
    }
    if (mode === "selected") {
      return students.filter((s) => selectedIds.includes(s.id));
    }
    return students;
  }, [students, mode, selectedIds]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const pickRandom = () => {
    if (locked || isShuffling) return;

    if (candidates.length === 0) {
      setResult("대상이 없습니다");
      return;
    }

    setIsShuffling(true);

    let count = 0;
    const maxCount = 14;
    const interval = setInterval(() => {
      const tempIdx = Math.floor(Math.random() * candidates.length);
      setResult(candidates[tempIdx].name);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * candidates.length);
        const finalName = candidates[finalIdx].name;
        setResult(finalName);
        setHistory((prev) => {
          return [finalName, ...prev];
        });
        setIsShuffling(false);
      }
    }, 120);
  };

  return (
    <div className="w-full h-[75vh] flex gap-6 rounded-2xl bg-white/70 backdrop-blur shadow p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        {/* 제목 */}
        <div className="text-2xl font-extrabold text-gray-800">
          🎲 랜덤 뽑기
        </div>

        {/* 대상 선택 */}
        <div className="flex gap-3 flex-wrap justify-center" style={locked || isShuffling ? { pointerEvents: "none", opacity: 0.6 } : undefined}>
          <button
            onClick={() => setMode("all")}
            className={`px-5 py-2 rounded-full font-semibold
              ${
                mode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }
            `}
            disabled={locked || isShuffling}
          >
            전체 학생
          </button>

          <button
            onClick={() => setMode("present")}
            className={`px-5 py-2 rounded-full font-semibold
              ${
                mode === "present"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }
            `}
            disabled={locked || isShuffling}
          >
            출석한 학생만
          </button>

          <button
            onClick={() => setMode("selected")}
            className={`px-5 py-2 rounded-full font-semibold
              ${
                mode === "selected"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }
              ${(locked || isShuffling) ? "cursor-not-allowed" : ""}
            `}
            disabled={locked || isShuffling}
          >
            선택된 학생만
          </button>
        </div>

        {mode === "selected" && (
          <div className="max-h-48 overflow-y-auto px-6 py-4 bg-white/60 rounded-xl shadow-inner">
            <div className="grid grid-cols-3 gap-2">
              {students.map((s) => {
                const selected = selectedIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold
                      ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }
                      ${(locked || isShuffling) ? "cursor-not-allowed" : ""}
                    `}
                    disabled={locked || isShuffling}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        <motion.div
          className="min-h-[10rem] w-full max-w-3xl relative overflow-hidden flex items-center justify-center rounded-3xl"
          animate={result ? { scale: [1.08, 1] } : {}}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* 강한 배경 펄스 (결과 확정 순간에만) */}
          <AnimatePresence>
            {!isShuffling && result ? (
              <motion.div
                key={`pulse-${result}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute left-1/2 top-1/2 w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(147,51,234,0.18) 45%, rgba(0,0,0,0) 70%)",
                  }}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: [0.6, 1.15], opacity: [0.0, 1, 0.0] }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 w-[760px] h-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(59,130,246,0.12) 35%, rgba(0,0,0,0) 72%)",
                  }}
                  initial={{ scale: 0.25, opacity: 0 }}
                  animate={{ scale: [0.4, 1.05], opacity: [0.0, 0.9, 0.0] }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isShuffling ? (
              <motion.div
                key={`shuffling-name-${result}`}
                className="text-7xl font-extrabold text-blue-600"
                animate={{
                  scale: [1, 1.25, 0.95, 1.15, 1],
                  x: [-10, 10, -6, 6, 0],
                  filter: [
                    "blur(4px)",
                    "blur(0px)",
                    "blur(3px)",
                    "blur(0px)",
                  ],
                  opacity: [0.6, 1, 0.8, 1],
                }}
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  textShadow:
                    "0 0 18px rgba(59,130,246,0.55), 0 0 36px rgba(147,51,234,0.25)",
                }}
              >
                {result || "…"}
              </motion.div>
            ) : result ? (
              <motion.div
                key={result}
                initial={{ opacity: 0, scale: 0.18, rotate: -18, y: 18 }}
                animate={{
                  opacity: 1,
                  scale: [1.65, 0.98, 1.08, 1],
                  rotate: [12, -6, 3, 0],
                  y: [10, -6, 2, 0],
                }}
                transition={{
                  duration: 0.85,
                  ease: "easeOut",
                }}
                className="text-8xl font-extrabold text-blue-700"
                style={{
                  textShadow:
                    "0 0 18px rgba(59,130,246,0.65), 0 0 42px rgba(147,51,234,0.35), 0 10px 35px rgba(0,0,0,0.25)",
                }}
              >
                {result}
                <motion.div
                  key={`sparkles-${result}`}
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[
                    { left: "18%", top: "35%", d: 0.0 },
                    { left: "78%", top: "28%", d: 0.05 },
                    { left: "62%", top: "68%", d: 0.1 },
                  ].map((p, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-4xl"
                      style={{ left: p.left, top: p.top }}
                      initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                      animate={{ scale: [0.2, 1.4, 0.9], opacity: [0, 1, 0], rotate: [0, 25, 0] }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: p.d }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-xl"
              >
                버튼을 눌러 뽑아주세요
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 뽑기 버튼 */}
        <motion.button
          onClick={pickRandom}
          disabled={locked || isShuffling}
          whileHover={locked || isShuffling ? {} : { scale: 1.14 }}
          whileTap={locked || isShuffling ? {} : { scale: 0.86 }}
          className={`px-10 py-4 rounded-2xl text-xl font-bold shadow
            ${
              locked || isShuffling
                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          {isShuffling ? "🎲 뽑는 중..." : "🎯 한 명 뽑기"}
        </motion.button>
      </div>

      {/* 오른쪽 히스토리 패널 */}
      <motion.div
        animate={{ width: historyOpen ? 256 : 44 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="shrink-0 bg-white/60 rounded-xl flex flex-col overflow-hidden"
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-700">
              {historyOpen ? "🕘 최근 뽑힌 학생" : ""}
            </div>
            <button
              onClick={() => setHistoryOpen((prev) => !prev)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
              title={historyOpen ? "패널 닫기" : "패널 열기"}
            >
              {historyOpen ? "⟨" : "⟩"}
            </button>
          </div>

          {historyOpen && (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {history.length === 0 && (
                  <div className="text-sm text-gray-400">
                    아직 결과가 없습니다
                  </div>
                )}

                {history.map((name, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border
                      ${idx === 0
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700"}
                    `}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </>
          )}

          {!historyOpen && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
              히스토리
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
