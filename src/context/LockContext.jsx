import { createContext, useContext, useState } from "react";

/**
 * LockContext
 * - locked: 현재 잠금 상태
 * - lock(): 즉시 잠금
 * - unlockWithPIN(): PIN 입력 후 잠금 해제
 */

const LOCK_STORAGE_KEY = "classroom_global_lock_v1";
const PIN_STORAGE_KEY = "classroom_lock_pin_v1";

const LockContext = createContext(null);

export function LockProvider({ children }) {
  const [locked, setLocked] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCK_STORAGE_KEY);
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const lock = () => {
    setLocked(true);
    try {
      localStorage.setItem(LOCK_STORAGE_KEY, "true");
    } catch {}
  };

  const unlockWithPIN = () => {
    setPinInput("");
    setPinError("");
    setShowUnlockModal(true);
  };

  const appendDigit = (digit) => {
    setPinError("");
    setPinInput((prev) => `${prev}${digit}`);
  };

  const backspace = () => {
    setPinError("");
    setPinInput((prev) => prev.slice(0, -1));
  };

  const clearPin = () => {
    setPinError("");
    setPinInput("");
  };

  const confirmUnlock = () => {
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY) || "1234";

    if (pinInput === savedPin) {
      setLocked(false);
      try {
        localStorage.setItem(LOCK_STORAGE_KEY, "false");
      } catch {}
      setShowUnlockModal(false);
      setPinInput("");
      setPinError("");
      return;
    }

    setPinError("PIN이 올바르지 않습니다.");
  };

  return (
    <LockContext.Provider
      value={{
        locked,
        lock,
        unlockWithPIN,
        confirmUnlock,
      }}
    >
      {children}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-[320px] p-5 shadow-lg">
            <h3 className="text-lg font-bold mb-2">잠금 해제</h3>
            <p className="text-sm text-gray-500 mb-4">
              설정한 PIN 번호를 입력하세요
            </p>

            <input
              type="password"
              value={pinInput}
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                // 숫자만 허용
                const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                setPinError("");
                setPinInput(digitsOnly);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmUnlock();
                if (e.key === "Escape") setShowUnlockModal(false);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring"
              placeholder="PIN 입력"
            />

            <div className="mt-4 grid grid-cols-3 gap-2 select-none">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => appendDigit(d)}
                  className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-lg active:scale-[0.98]"
                >
                  {d}
                </button>
              ))}

              <button
                type="button"
                onClick={clearPin}
                className="py-3 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold text-lg active:scale-[0.98]"
                title="전체 지우기"
              >
                C
              </button>

              <button
                type="button"
                onClick={() => appendDigit("0")}
                className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-lg active:scale-[0.98]"
              >
                0
              </button>

              <button
                type="button"
                onClick={backspace}
                className="py-3 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold text-lg active:scale-[0.98]"
                title="한 글자 지우기"
              >
                ⌫
              </button>
            </div>

            {pinError && (
              <p className="mt-2 text-sm text-red-500">{pinError}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 px-3 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowUnlockModal(false)}
              >
                취소
              </button>
              <button
                className="flex-1 px-3 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
                onClick={confirmUnlock}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </LockContext.Provider>
  );
}

/**
 * useLock
 * - 전역 잠금 상태 접근용 커스텀 훅
 */
export function useLock() {
  const context = useContext(LockContext);

  if (!context) {
    throw new Error("useLock must be used within a LockProvider");
  }

  return context;
}
