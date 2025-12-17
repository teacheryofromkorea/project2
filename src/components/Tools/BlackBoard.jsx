import { useEffect, useState } from "react";
import { useLock } from "../../context/LockContext";

function Panel({ title, subtitle, children }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow p-5">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function Blackboard() {
  const { locked } = useLock();

  const [boardText, setBoardText] = useState("");
  const [fontSize, setFontSize] = useState(35);
  const [boardColor, setBoardColor] = useState("#064e3b");
  const [textColor, setTextColor] = useState("#ffffff");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("classroom_blackboard_v1");
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (typeof parsed.boardText === "string") setBoardText(parsed.boardText);
      if (typeof parsed.fontSize === "number") setFontSize(parsed.fontSize);
      if (typeof parsed.boardColor === "string") setBoardColor(parsed.boardColor);
      if (typeof parsed.textColor === "string") setTextColor(parsed.textColor);
    } catch (e) {
      console.warn("Failed to load blackboard", e);
    }
  }, []);

  const boardColors = [
    { name: "초록", color: "#064e3b" },
    { name: "진회색", color: "#374151" },
    { name: "남색", color: "#1e3a8a" },
    { name: "다크그린", color: "#14532d" },
  ];

  const textColors = [
    { name: "흰색", color: "#ffffff" },
    { name: "노랑", color: "#facc15" },
    { name: "연분홍", color: "#fbcfe8" },
    { name: "밝은하늘", color: "#bae6fd" },
  ];

  const handleClear = () => {
    if (!window.confirm("칠판 내용을 모두 지우시겠습니까?")) return;
    setBoardText("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "classroom_blackboard_v1",
        JSON.stringify({
          boardText,
          fontSize,
          boardColor,
          textColor,
        })
      );
      alert("칠판 내용이 저장되었습니다.");
    } catch {
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-12">
      {/* 칠판 영역 */}
      <div className="relative rounded-2xl shadow-lg basis-[80%]">
        {locked && <div className="absolute inset-0 z-10" />}
        {locked && (
          <div className="absolute top-3 right-3 z-20 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            🔒 편집 잠김
          </div>
        )}

        <textarea
          value={boardText}
          onChange={(e) => setBoardText(e.target.value)}
          placeholder="칠판에 내용을 적어보세요..."
          spellCheck={false}
          className="w-full h-[75vh] resize-none rounded-2xl p-6 outline-none overflow-auto"
          style={{
            backgroundColor: boardColor,
            color: textColor,
            fontSize,
            fontWeight: "600",
            lineHeight: "1.4",
            caretColor: textColor,
          }}
        />
      </div>

      {/* 도구 패널 */}
      <Panel title="🧑‍🏫 칠판 도구">
        <div className="flex flex-col gap-5 basis-[20%]">
          <div>
            <label className="block font-semibold mb-1">
              폰트 크기: {fontSize}px
            </label>
            <input
              type="range"
              min={20}
              max={60}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              disabled={locked}
              className="w-full"
            />
          </div>

          <div>
            <div className="font-semibold mb-1">칠판 색상</div>
            <div className="flex gap-1 flex-wrap">
              {boardColors.map(({ color }) => (
                <button
                  key={color}
                  type="button"
                  disabled={locked}
                  onClick={() => setBoardColor(color)}
                  className="w-8 h-8 rounded-full border shadow"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-1">글자 색상</div>
            <div className="flex gap-1 flex-wrap">
              {textColors.map(({ color }) => (
                <button
                  key={color}
                  type="button"
                  disabled={locked}
                  onClick={() => setTextColor(color)}
                  className="w-8 h-8 rounded-full border shadow"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClear}
              disabled={locked}
              className="flex-1 px-2 py-2 rounded-xl bg-red-600 text-white"
            >
              지우기
            </button>
            <button
              onClick={handleSave}
              disabled={locked}
              className="flex-1 px-2 py-2 rounded-xl bg-blue-600 text-white"
            >
              저장
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export { Blackboard }