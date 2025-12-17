import { useMemo, useState } from "react";
import { useLock } from "../../context/LockContext";

/**
 * props
 * - students: [{ id, name, present }]
 *   ※ ToolsPage에서 내려줄 예정
 */
export default function RandomPicker({ students = [] }) {
  const { locked } = useLock();

  // 대상 모드: all | present
  const [mode, setMode] = useState("all");
  const [result, setResult] = useState(null);

  // 뽑기 대상 계산
  const candidates = useMemo(() => {
    if (mode === "present") {
      return students.filter((s) => s.present);
    }
    return students;
  }, [students, mode]);

  const pickRandom = () => {
    if (locked) return;
    if (candidates.length === 0) {
      setResult("대상이 없습니다");
      return;
    }
    const idx = Math.floor(Math.random() * candidates.length);
    setResult(candidates[idx].name);
  };

  return (
    <div className="w-full h-[75vh] flex flex-col items-center justify-center gap-10 rounded-2xl bg-white/70 backdrop-blur shadow">
      {/* 제목 */}
      <div className="text-2xl font-extrabold text-gray-800">
        🎲 랜덤 뽑기
      </div>

      {/* 대상 선택 */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode("all")}
          className={`px-5 py-2 rounded-full font-semibold
            ${
              mode === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }
          `}
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
        >
          출석한 학생만
        </button>
      </div>

      {/* 결과 표시 */}
      <div className="min-h-[6rem] flex items-center justify-center">
        {result ? (
          <div className="text-6xl font-extrabold text-gray-900">
            {result}
          </div>
        ) : (
          <div className="text-gray-400 text-xl">
            버튼을 눌러 뽑아주세요
          </div>
        )}
      </div>

      {/* 뽑기 버튼 */}
      <button
        onClick={pickRandom}
        disabled={locked}
        className={`px-10 py-4 rounded-2xl text-xl font-bold shadow
          ${
            locked
              ? "bg-gray-300 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }
        `}
      >
        🎯 한 명 뽑기
      </button>
    </div>
  );
}
