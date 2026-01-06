import { useEffect, useState } from "react";
import { useLock } from "../../context/LockContext";
import { getTodayString } from "../../utils/dateUtils";
import { supabase } from "../../lib/supabaseClient";

const TOOL_TAB_STORAGE_KEY = "tools_active_tab_v1";

import Blackboard from "./BlackBoard";
import ClassTimer from "./ClassTimer";
import RandomPicker from "./RandomPicker";
import TeamBuilder from "./TeamBuilder";
import SeatShuffler from "./SeatShuffler";

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

  const [students, setStudents] = useState([]);

  const today = getTodayString();

  useEffect(() => {
    const fetchStudentsWithAttendance = async () => {
      // 1. 전체 학생
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, name");

      if (studentsError) {
        console.error("학생 불러오기 실패", studentsError);
        return;
      }

      // 2. 오늘 출석 상태
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("student_attendance_status")
        .select("student_id, present")
        .eq("date", today);

      if (attendanceError) {
        console.error("출석 불러오기 실패", attendanceError);
        return;
      }

      // 3. 학생 + 출석 merge
      const merged = studentsData.map((s) => {
        const attendance = attendanceData.find(
          (a) => a.student_id === s.id
        );
        return {
          id: s.id,
          name: s.name,
          present: attendance ? attendance.present : false,
        };
      });

      setStudents(merged);
    };

    fetchStudentsWithAttendance();
  }, [today]);

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
          <RandomPicker students={students} />
        ) : null}

        {activeTool === "teams" ? <TeamBuilder /> : null}

        {activeTool === "seats" ? <SeatShuffler /> : null}
      </div>
    </div>
  );
}

export default ToolsPage;