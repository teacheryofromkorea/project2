import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RandomPickerWidget({ students = [] }) { // students: { id, name, present }
    const [result, setResult] = useState(null);
    const [isShuffling, setIsShuffling] = useState(false);

    // 출석한 학생만 대상
    const candidates = useMemo(() => students.filter(s => s.present), [students]);

    const pickOne = () => {
        if (isShuffling || candidates.length === 0) return;

        setIsShuffling(true);
        setResult(null);

        let count = 0;
        const maxCount = 10;
        const interval = setInterval(() => {
            const tempIdx = Math.floor(Math.random() * candidates.length);
            setResult(candidates[tempIdx].name);
            count++;
            if (count >= maxCount) {
                clearInterval(interval);
                const finalIdx = Math.floor(Math.random() * candidates.length);
                setResult(candidates[finalIdx].name);
                setIsShuffling(false);
            }
        }, 100);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 min-h-[350px]">
            {/* Display Area */}
            <div className="flex-1 w-full flex items-center justify-center">
                <div className="w-full h-56 flex items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key={result}
                                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 z-10 px-4 text-center break-keep"
                            >
                                {result}
                            </motion.div>
                        ) : (
                            <div className="text-gray-400 text-xl font-bold flex flex-col items-center gap-3">
                                <span className="text-5xl">🎲</span>
                                <span>버튼을 눌러 뽑아보세요</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <button
                onClick={pickOne}
                disabled={isShuffling || candidates.length === 0}
                className={`w-full max-w-sm py-4 rounded-2xl text-2xl font-bold text-white transition shadow-lg transform active:scale-95
          ${isShuffling || candidates.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"}
        `}
            >
                {isShuffling ? "🎲 섞는 중..." : "🎯 한 명 뽑기"}
            </button>
        </div>
    );
}
