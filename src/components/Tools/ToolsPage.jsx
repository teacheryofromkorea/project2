import { useEffect, useState } from "react";

function ToolTabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer select-none " +
        (active
          ? "bg-blue-600 text-white shadow"
          : "bg-white/70 text-gray-700 hover:bg-white hover:shadow")
      }
    >
      {children}
    </button>
  );
}

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

function Blackboard() {
  const [boardText, setBoardText] = useState("");
  const [fontSize, setFontSize] = useState(35);
  const [boardColor, setBoardColor] = useState("#064e3b"); // 기본 짙은 초록색
  const [textColor, setTextColor] = useState("#ffffff"); // 기본 흰색

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
      console.warn("Failed to load blackboard from localStorage", e);
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
    const ok = window.confirm("칠판 내용을 모두 지우시겠습니까?");
    if (!ok) return;
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
    } catch (e) {
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-12">
      {/* 칠판 영역 */}
      <div
        className="relative rounded-2xl shadow-lg basis-[80%]"
      >
        <textarea
          value={boardText}
          onChange={(e) => setBoardText(e.target.value)}
          placeholder="칠판에 내용을 적어보세요..."
          spellCheck={false}
          className="w-full h-[75vh] resize-none rounded-2xl p-6 outline-none overflow-auto"
          style={{
            backgroundColor: boardColor,
            color: textColor,
            fontSize: fontSize,
            fontWeight: "600",
            lineHeight: "1.4",
            caretColor: textColor,
          }}
        />
      </div>

      {/* 교사용 도구 패널 */}
      <Panel title="🧑‍🏫 칠판 도구">
        <div className="flex flex-col gap-5 basis-[20%]">
          {/* 폰트 크기 슬라이더 */}
          <div>
            <label htmlFor="fontSize" className="block font-semibold mb-1">
              폰트 크기: {fontSize}px
            </label>
            <input
              id="fontSize"
              type="range"
              min={20}
              max={60}
              value={fontSize}
              onChange={(e) => {
                const value = Number(e.target.value);
                setFontSize(value);
              }}
              className="w-full"
            />
          </div>

          {/* 칠판 색상 버튼 */}
          <div>
            <div className="font-semibold mb-1">칠판 색상</div>
            <div className="flex gap-1 flex-wrap">
              {boardColors.map(({ name, color }) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setBoardColor(color);
                  }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    boardColor === color ? "border-white" : "border-transparent"
                  } shadow-md transition`}
                  style={{ backgroundColor: color }}
                  title={name}
                />
              ))}
            </div>
          </div>

          {/* 글자 색상 버튼 */}
          <div>
            <div className="font-semibold mb-1">글자 색상</div>
            <div className="flex gap-1 flex-wrap">
              {textColors.map(({ name, color }) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setTextColor(color);
                  }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    textColor === color ? "border-white" : "border-transparent"
                  } shadow-md transition`}
                  style={{ backgroundColor: color }}
                  title={name}
                />
              ))}
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 px-2 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              지우기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-2 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              저장
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <Panel title={title} subtitle={description}>
      <div className="text-sm text-gray-600">
        아직 v1에서는 UI 뼈대만 잡아둘게요. (다음 단계에서 하나씩 붙입니다)
      </div>
    </Panel>
  );
}

function ToolsPage() {
  const [activeTool, setActiveTool] = useState("blackboard");

  // ESC 누르면 칠판 탭으로 돌아오게(실수 방지용, 가벼운 UX)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveTool("blackboard");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="w-full h-full p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <ToolTabButton
          active={activeTool === "blackboard"}
          onClick={() => setActiveTool("blackboard")}
        >
          📋 칠판
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "timer"}
          onClick={() => setActiveTool("timer")}
        >
          ⏱ 타이머
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "picker"}
          onClick={() => setActiveTool("picker")}
        >
          🎲 랜덤 뽑기
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "teams"}
          onClick={() => setActiveTool("teams")}
        >
          👥 팀 편성
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "seats"}
          onClick={() => setActiveTool("seats")}
        >
          🪑 자리 바꾸기
        </ToolTabButton>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTool === "blackboard" ? <Blackboard /> : null}

        {activeTool === "timer" ? (
          <PlaceholderPanel
            title="⏱ 수업 타이머"
            description="다음 단계에서 카운트다운/스톱워치 + 프리셋(5/10/15분)을 붙일 거예요."
          />
        ) : null}

        {activeTool === "picker" ? (
          <PlaceholderPanel
            title="🎲 랜덤 뽑기"
            description="다음 단계에서: 전체/출석한 학생/선택 학생에서 뽑기 (v1은 기록 저장 없이)"
          />
        ) : null}

        {activeTool === "teams" ? (
          <PlaceholderPanel
            title="👥 팀 편성기"
            description="다음 단계에서: 팀 개수/인원 기준으로 랜덤 분배 (v1은 저장 없이)"
          />
        ) : null}

        {activeTool === "seats" ? (
          <PlaceholderPanel
            title="🪑 자리 바꾸기"
            description="다음 단계에서: 격자 자리 배치 + 랜덤 셔플 (v1은 저장 없이)"
          />
        ) : null}
      </div>
    </div>
  );
}

export default ToolsPage;