import { useEffect, useState } from "react";
import { useLock } from "../../context/LockContext";

const TOOL_TAB_STORAGE_KEY = "tools_active_tab_v1";

import Blackboard from "./BlackBoard";
import ClassTimer from "./ClassTimer";

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

function PlaceholderPanel({ title, description }) {
  return (
    <Panel title={title} subtitle={description}>
      <div className="text-sm text-gray-600">
        아직 v1에서는 UI 뼈대만 잡아둘게요. (다음 단계에서 하나씩 붙입니다)
      </div>
    </Panel>
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

function ToolsPage() {
  const { locked } = useLock();
  const [activeTool, setActiveTool] = useState(() => {
    return localStorage.getItem(TOOL_TAB_STORAGE_KEY) || "blackboard";
  });

  // ESC 누르면 칠판 탭으로 돌아오게(실수 방지용, 가벼운 UX)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveTool("blackboard");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem(TOOL_TAB_STORAGE_KEY, activeTool);
  }, [activeTool]);

  return (
    <div className="w-full h-full p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <ToolTabButton
          active={activeTool === "blackboard"}
          onClick={() => {
            if (locked) return;
            setActiveTool("blackboard");
          }}
        >
          📋 칠판
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "timer"}
          onClick={() => {
            if (locked) return;
            setActiveTool("timer");
          }}
        >
          ⏱ 타이머
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "picker"}
          onClick={() => {
            if (locked) return;
            setActiveTool("picker");
          }}
        >
          🎲 랜덤 뽑기
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "teams"}
          onClick={() => {
            if (locked) return;
            setActiveTool("teams");
          }}
        >
          👥 팀 편성
        </ToolTabButton>
        <ToolTabButton
          active={activeTool === "seats"}
          onClick={() => {
            if (locked) return;
            setActiveTool("seats");
          }}
        >
          🪑 자리 바꾸기
        </ToolTabButton>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTool === "blackboard" ? <Blackboard /> : null}

        {activeTool === "timer" ? <ClassTimer /> : null}

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