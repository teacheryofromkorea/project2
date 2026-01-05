import { useState, useEffect, useRef } from "react";

export default function ClassTimerWidget() {
    const [totalSeconds, setTotalSeconds] = useState(300); // Default 5 min
    const [remaining, setRemaining] = useState(300);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    // mm:ss format
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const setTime = (min) => {
        const sec = min * 60;
        setIsRunning(false);
        setTotalSeconds(sec);
        setRemaining(sec);
    };

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        setRemaining(totalSeconds);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-10 w-full h-full min-h-[350px]">
            {/* Header removed as it's in modal title */}

            <div className="text-9xl font-mono font-black text-gray-800 tracking-wider">
                {formatTime(remaining)}
            </div>

            <div className="flex gap-3 justify-center w-full">
                {[1, 3, 5, 10, 30].map(m => (
                    <button key={m} onClick={() => setTime(m)} className="px-5 py-3 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-2xl text-lg font-bold transition transform hover:scale-105">
                        {m}분
                    </button>
                ))}
            </div>

            <div className="flex gap-4 w-full max-w-sm mt-2">
                <button
                    onClick={toggleTimer}
                    className={`flex-1 py-4 rounded-2xl text-2xl font-bold text-white transition shadow-lg transform active:scale-95
            ${isRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-500 hover:bg-indigo-600"}
          `}
                >
                    {isRunning ? "일시정지" : "시작"}
                </button>
                <button
                    onClick={resetTimer}
                    className="flex-1 py-4 rounded-2xl text-2xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition shadow-lg transform active:scale-95"
                >
                    리셋
                </button>
            </div>
        </div>
    );
}
