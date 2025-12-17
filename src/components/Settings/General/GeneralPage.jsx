import { useEffect, useState } from "react";

const PIN_STORAGE_KEY = "classroom_lock_pin_v1";

export default function GeneralPage() {
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(PIN_STORAGE_KEY);
    if (saved) {
      setSavedPin(saved);
      setPin(saved);
    }
  }, []);

  const handleSavePin = () => {
    if (!pin || pin.length < 4) {
      alert("PIN은 최소 4자리 이상이어야 합니다.");
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, pin);
    setSavedPin(pin);
    alert("잠금 PIN이 저장되었습니다.");
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold mb-4">일반 설정</h2>
      <p className="text-gray-600 mb-6">
        앱의 일반적인 환경 설정을 여기에 구성합니다.
      </p>

      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          🔐 잠금 PIN 설정
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          학생 보기 모드 해제 시 사용할 PIN 번호를 설정합니다.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={pin}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
              setPin(digitsOnly);
            }}
            placeholder="PIN 번호 (숫자만, 4자리 이상)"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring font-mono tracking-widest"
          />

          <button
            type="button"
            onClick={handleSavePin}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900"
          >
            저장
          </button>
        </div>

        {savedPin && (
          <p className="mt-3 text-xs text-gray-400">
            현재 설정된 PIN이 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}