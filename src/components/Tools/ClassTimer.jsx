import { useEffect, useRef, useState } from "react";
import { useLock } from "../../context/LockContext";

const TIMER_SETTINGS_KEY = "class_timer_settings_v1";

export default function ClassTimer() {
  const { locked } = useLock();

  // 총 시간(초)
  const savedSettings = (() => {
    try {
      return JSON.parse(localStorage.getItem(TIMER_SETTINGS_KEY)) || {};
    } catch {
      return {};
    }
  })();

  const initialTotalSeconds = savedSettings.totalSeconds ?? 300;

  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds);
  const [remaining, setRemaining] = useState(initialTotalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const [timerName, setTimerName] = useState(savedSettings.timerName ?? "");
  const [inputMin, setInputMin] = useState(
    Math.floor(initialTotalSeconds / 60)
  );
  const [inputSec, setInputSec] = useState(
    initialTotalSeconds % 60
  );

  const [showSettings, setShowSettings] = useState(true);

  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      TIMER_SETTINGS_KEY,
      JSON.stringify({
        timerName,
        totalSeconds,
      })
    );
  }, [timerName, totalSeconds]);

  // mm:ss 포맷
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 타이머 구동
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // 컨트롤
  const handleStartPause = () => {
    if (remaining <= 0) return;
    setIsRunning((v) => !v);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  // 프리셋
  const presets = [1, 3, 5, 10, 15, 30];

  const applyPreset = (min) => {
    const sec = min * 60;
    setIsRunning(false);
    setInputMin(min);
    setInputSec(0);
    setTotalSeconds(sec);
    setRemaining(sec);
  };

  const applyCustomTime = () => {
    const min = Math.max(0, Number(inputMin) || 0);
    const sec = Math.min(59, Math.max(0, Number(inputSec) || 0));
    const total = min * 60 + sec;

    if (total <= 0) return;

    setIsRunning(false);
    setTotalSeconds(total);
    setRemaining(total);

    setShowSettings(false); // ← 설정 적용 후 자동 닫기
  };

  const isEnding = remaining <= 10 && remaining > 0;

  return (
    <div className="w-full h-[75vh] flex flex-col items-center justify-center gap-8 rounded-2xl bg-white/70 backdrop-blur shadow relative">
      <button
        onClick={() => {
          if (locked) return;
          setShowSettings((v) => !v);
        }}
        className={`absolute top-6 right-6 px-4 py-2 rounded-full shadow font-semibold
          ${locked ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white"}
        `}
      >
        ⚙️ 타이머 설정
      </button>

      {showSettings && (
        <div
          className="w-full max-w-md mb-8 bg-white rounded-2xl p-5 shadow"
          style={locked ? { pointerEvents: "none", opacity: 0.9 } : undefined}
        >
          <div className="font-bold text-lg mb-4 flex items-center gap-2">
            ⏱ 타이머 설정
          </div>

          {/* 타이머 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">타이머 이름</label>
            <input
              type="text"
              placeholder="예: 독서 시간"
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 outline-none"
              disabled={locked}
            />
          </div>

          {/* 시간 설정 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">시간 설정</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <span className="text-xs text-gray-500">분</span>
                <input
                  type="number"
                  min={0}
                  value={inputMin}
                  onChange={(e) => setInputMin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 outline-none"
                  disabled={locked}
                />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">초</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={inputSec}
                  onChange={(e) => setInputSec(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 outline-none"
                  disabled={locked}
                />
              </div>
            </div>
          </div>

          {/* 빠른 설정 */}
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">빠른 설정</div>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((m) => (
                <button
                  key={m}
                  onClick={() => applyPreset(m)}
                  className={`py-2 rounded-xl font-semibold ${
                    inputMin === m && inputSec === 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  disabled={locked}
                >
                  {m}분
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (locked) return;
              applyCustomTime();
            }}
            className={`w-full py-3 rounded-xl font-bold
              ${locked
                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white"}
            `}
          >
            설정 적용
          </button>
        </div>
      )}

      {!showSettings && timerName && (
        <div className="text-xl font-bold text-gray-700 mb-2">
          {timerName}
        </div>
      )}

      {/* 시간 표시 */}
      {!showSettings && (
        <div
          className={`font-extrabold tracking-widest ${
            isEnding ? "text-red-600 animate-pulse" : "text-gray-900"
          }`}
          style={{ fontSize: "13rem" }}
        >
          {formatTime(remaining)}
        </div>
      )}

      {/* 컨트롤 */}
      {!showSettings && (
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (locked) return;
              handleStartPause();
            }}
            className={`px-6 py-3 rounded-2xl text-lg font-bold shadow
              ${locked
                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"}
            `}
          >
            {isRunning ? "일시정지" : "시작"}
          </button>
          <button
            onClick={() => {
              if (locked) return;
              handleReset();
            }}
            className={`px-6 py-3 rounded-2xl text-lg font-bold shadow
              ${locked
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"}
            `}
          >
            리셋
          </button>
        </div>
      )}
    </div>
  );
}