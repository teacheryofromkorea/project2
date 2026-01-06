import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getTodayString } from "../../utils/dateUtils";
import ClassSeatDeck from "./ClassSeatDeck";
import ClassStatModal from "./ClassStatModal";
import BaseModal from "../common/BaseModal";
import useClassTimeBlockSelection from "../../hooks/useClassTimeBlockSelection";
import useInitClassResources from "../../hooks/useInitClassResources";
import ClassResourceBoard from "./ClassResourceBoard";

// 🔹 Import Widgets
// 🔹 Import Full Tools (Reusing existing components)
import ClassTimer from "../Tools/ClassTimer";
import RandomPicker from "../Tools/RandomPicker";
import Blackboard from "../Tools/Blackboard";
import TeamBuilder from "../Tools/TeamBuilder";
import ClassQuestWidget from "../Tools/ClassQuestWidget";
import ClassQuestDashboard from "./ClassQuestDashboard";

/**
 * ClassPage
 * ---------
 * 수업 화면 전체를 구성하는 컨테이너 페이지
 *
 * 책임(What this component does):
 * 1. 수업 화면 레이아웃 구성 (학생 / 콘텐츠 / 도구)
 * 2. 교시 상태 관리 (선택, 변경)
 * 3. 교시별 상/벌점 상태 관리
 * 4. 학생 선택 상태 관리
 * 5. 상점 저장 및 Supabase 연동
 *
 * 책임 아님(What this component does NOT do):
 * - 개별 UI 상세 렌더링
 * - 수업 도구 CRUD
 * - 학생 리스트 UI
 *
 * 👉 상태 + 흐름 제어의 Single Source of Truth
 */

function ClassPage() {
  // 🔹 교시 관련 상태
  const [classBlocks, setClassBlocks] = useState([]);

  // 🔹 학생 데이터
  const [students, setStudents] = useState([]);

  const [attendanceStatus, setAttendanceStatus] = useState([]);


  const today = getTodayString();

  const presentStudentIds = useMemo(
    () => attendanceStatus.map((row) => row.student_id),
    [attendanceStatus]
  );

  const presentStudents = useMemo(
    () => students.filter((s) => presentStudentIds.includes(s.id)),
    [students, presentStudentIds]
  );

  // 🔹 교시별 상점 상태 (key: studentId, value: 점수)
  const [periodPoints, setPeriodPoints] = useState({});

  // 🔹 선택된 학생들 (다중 선택)
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // 🔹 미니 능력치 모달용 상태 (클릭된 학생)
  const [statModalStudent, setStatModalStudent] = useState(null);

  const [activeTool, setActiveTool] = useState(() => {
    try {
      return localStorage.getItem("class_active_tool");
    } catch {
      return null;
    }
  });

  // 🔹 마지막 활성 도구 (애니메이션 exit용)
  const [lastActiveTool, setLastActiveTool] = useState(activeTool);

  useEffect(() => {
    if (activeTool) {
      setLastActiveTool(activeTool);
    }
  }, [activeTool]);

  // 🔹 도구 상태 저장
  useEffect(() => {
    if (activeTool) {
      localStorage.setItem("class_active_tool", activeTool);
    } else {
      localStorage.removeItem("class_active_tool");
    }
  }, [activeTool]);

  // 🔹 toast 메시지
  const [toast, setToast] = useState(null);

  // 🔹 퀘스트 상태 (다중 퀘스트 지원)
  // quests: [{ id, title, completed: Set<studentId> }, ...]
  // 🔹 퀘스트 상태 (다중 퀘스트 지원)
  // quests: [{ id, title, completed: Set<studentId> }, ...]
  const [quests, setQuests] = useState(() => {
    try {
      const saved = localStorage.getItem("class_quests");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(q => ({
          ...q,
          completed: new Set(q.completed)
        }));
      }
      return [];
    } catch (e) {
      console.error("Failed to load quests", e);
      return [];
    }
  });

  const [activeQuestId, setActiveQuestId] = useState(() => {
    try {
      return localStorage.getItem("class_active_quest_id") || null;
    } catch {
      return null;
    }
  });

  // 🔹 LocalStorage 저장 (상태 변경 시)
  useEffect(() => {
    try {
      // Set -> Array 변환하여 저장
      const serialized = JSON.stringify(quests, (key, value) =>
        value instanceof Set ? Array.from(value) : value
      );
      localStorage.setItem("class_quests", serialized);
    } catch (e) {
      console.error("Failed to save quests", e);
    }
  }, [quests]);

  useEffect(() => {
    if (activeQuestId) {
      localStorage.setItem("class_active_quest_id", activeQuestId);
    } else {
      localStorage.removeItem("class_active_quest_id");
    }
  }, [activeQuestId]);

  // 현재 활성화된 퀘스트 객체 (없으면 null)
  const activeQuest = useMemo(() =>
    quests.find(q => q.id === activeQuestId) || null
    , [quests, activeQuestId]);

  // 🔹 수업 도구 템플릿 초기화 (최초 1회)
  useInitClassResources();

  // 🔹 현재 선택된 수업 교시 (source of truth는 이 훅)
  const {
    selectedClassBlockId,
    selectedClassBlock,
    selectClassBlockManually,
  } = useClassTimeBlockSelection(classBlocks);

  // 🔹 교시가 바뀌면 상점 초기화 (진짜 기준)
  useEffect(() => {
    if (!selectedClassBlockId) return;
    setPeriodPoints({});
  }, [selectedClassBlockId]);

  // 🔹 교시 변경 시 학생 선택도 초기화
  useEffect(() => {
    setSelectedStudentIds(new Set());
  }, [selectedClassBlockId]);

  // 🔹 상점 증가 함수 (개별)
  const addPoint = (studentId) => {
    setPeriodPoints((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) + 1,
    }));
  };

  // 🔹 벌점 감소 함수 (개별만 허용)
  const removePoint = (studentId) => {
    setPeriodPoints((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) - 1,
    }));
  };

  // 🔹 선택 학생 일괄 상점 지급 (선택 없으면 전체 학생)
  const addPointBulk = () => {
    const targetStudentIds =
      selectedStudentIds.size > 0
        ? Array.from(selectedStudentIds)
        : presentStudents.map((s) => s.id);

    if (targetStudentIds.length === 0) return;

    setPeriodPoints((prev) => {
      const next = { ...prev };
      targetStudentIds.forEach((id) => {
        next[id] = (next[id] || 0) + 1;
      });
      return next;
    });
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  // 🔹 퀘스트 추가
  const addQuest = (title) => {
    const newQuest = {
      id: Date.now().toString(),
      title,
      completed: new Set(),
    };
    setQuests(prev => [...prev, newQuest]);

    // 추가 후 바로 활성화할지 여부는 선택사항. 여기서는 바로 활성화.
    setActiveQuestId(newQuest.id);

    showToast(`퀘스트 '${title}' 생성됨`, "success");
  };

  // 🔹 퀘스트 삭제
  const deleteQuest = (id) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    if (activeQuestId === id) {
      setActiveQuestId(null);
    }
  };

  // 🔹 퀘스트 활성/비활성 토글
  const toggleQuestActive = (id) => {
    if (activeQuestId === id) {
      setActiveQuestId(null); // 이미 활성화된거 누르면 끄기
    } else {
      setActiveQuestId(id);
    }
  };

  // 🔹 퀘스트 체크 토글 (특정 퀘스트, 특정 학생)
  const toggleQuestCheck = (questId, studentId) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== questId) return q;

      const nextCompleted = new Set(q.completed);
      if (nextCompleted.has(studentId)) nextCompleted.delete(studentId);
      else nextCompleted.add(studentId);

      return { ...q, completed: nextCompleted };
    }));
  };

  const moveQuest = (questId, direction) => {
    setQuests((prev) => {
      const index = prev.findIndex((q) => q.id === questId);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newQuests = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newQuests[index], newQuests[targetIndex]] = [newQuests[targetIndex], newQuests[index]];
      return newQuests;
    });
  };

  const updateQuest = (questId, newTitle) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, title: newTitle } : q))
    );
  };

  // 🔹 (Legacy) 사이드바용 퀘스트 체크 토글 (현재 활성화된 퀘스트 자동 타겟팅)
  const toggleQuestCompletion = (studentId) => {
    if (!activeQuestId) return;
    toggleQuestCheck(activeQuestId, studentId);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // 🔹 이 교시 상점 누적 저장 (D-3)
  const savePeriodPoints = async () => {
    if (!selectedClassBlockId) {
      showToast("저장할 수업 교시가 없습니다.", "error");
      return;
    }

    const entries = Object.entries(periodPoints)
      .filter(([, point]) => point !== 0)
      .map(([studentId, point]) => ({
        student_id: studentId,
        class_block_id: selectedClassBlockId,
        date: getTodayString(), // YYYY-MM-DD
        delta: point,
        reason: "수업 상점",
      }));

    if (entries.length === 0) {
      showToast("저장할 상점이 없습니다.", "error");
      return;
    }

    const { error } = await supabase
      .from("student_point_history")
      .insert(entries);

    if (error) {
      console.error("상점 저장 오류:", error);
      showToast("상점 저장 중 오류가 발생했습니다.", "error");
      return;
    }

    showToast("이 교시 상점이 저장되었습니다.", "success");

    // 상태 초기화
    setPeriodPoints({});
    setSelectedStudentIds(new Set());
  };

  // 수업시간 block 불러오기 (time_blocks 중 block_type === "class")
  useEffect(() => {
    const fetchClassBlocks = async () => {
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .eq("block_type", "class")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("수업시간 block 불러오기 실패", error);
        return;
      }

      setClassBlocks(data || []);
    };

    fetchClassBlocks();
  }, []);

  // 학생 목록 불러오기
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("number", { ascending: true });

      if (error) {
        console.error("학생 목록 불러오기 실패", error);
        return;
      }

      setStudents(data || []);
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      const { data, error } = await supabase
        .from("student_attendance_status")
        .select("student_id")
        .eq("date", today)
        .eq("present", true);

      if (error) {
        console.error("출석 데이터 불러오기 실패", error);
        setAttendanceStatus([]);
        return;
      }

      setAttendanceStatus(data || []);
    };

    fetchAttendanceStatus();
  }, [today]);

  // 도구 목록 정의
  const tools = [
    { id: "timer", icon: "⏱️", label: "타이머", component: ClassTimer },
    { id: "picker", icon: "🎲", label: "랜덤 뽑기", component: RandomPicker },
    { id: "memo", icon: "📝", label: "판서/메모", component: Blackboard },
    { id: "team", icon: "🫂", label: "모둠 편성", component: TeamBuilder },
    { id: "quest", icon: "🔥", label: "퀘스트", component: ClassQuestWidget },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6  space-y-6">

      {/* ===============================
          메인 수업 화면 레이아웃
          좌: 학생 / 중: 수업 콘텐츠 / 우: 수업 도구 독(Dock)
      =============================== */}

      {/* 메인 수업 화면 */}
      {/* 메인 수업 화면 */}
      {/* 메인 수업 화면 */}
      <div className="grid grid-cols-12 gap-6 h-[85vh]">
        {/* 좌측: 학생 리스트 (미니 좌석 덱) - 퀘스트 모드일 때는 숨김 (테이블 뷰로 통합) */}
        {activeTool !== 'quest' && (
          <div className="col-span-3 bg-white/70 rounded-2xl shadow p-4 overflow-y-auto relative animate-in fade-in slide-in-from-left-4 duration-300">


            <ClassSeatDeck
              students={presentStudents}
              periodPoints={periodPoints}
              onStudentClick={setStatModalStudent}
              selectedStudentIds={selectedStudentIds}

              // 퀘스트 전용 props (제거됨: 수업 도구 화면에서는 퀘스트 표시 안 함)
              isQuestMode={false}
              questCompletedStudentIds={new Set()}
              onToggleQuestCompletion={null}
            />
          </div>
        )}

        {/* 미니 능력치 모달 (학생 클릭 시) */}
        <ClassStatModal
          isOpen={!!statModalStudent}
          student={statModalStudent}
          onClose={() => setStatModalStudent(null)}
        />

        {/* 중앙: 수업 콘텐츠 OR 퀘스트 대시보드 */}
        <div className={`${activeTool === 'quest' ? 'col-span-11' : 'col-span-6'} bg-white/70 rounded-2xl shadow p-4 overflow-y-auto transition-all duration-300`}>
          {activeTool === "quest" ? (
            <ClassQuestDashboard
              students={presentStudents}
              quests={quests}
              onAddQuest={addQuest}
              onDeleteQuest={deleteQuest}
              onToggleQuestCheck={toggleQuestCheck}
              onMoveQuest={moveQuest}
              onUpdateQuest={updateQuest}
            />
          ) : (
            <ClassResourceBoard
              classBlocks={classBlocks}
              selectedClassBlockId={selectedClassBlockId}
              onChangeClassBlock={selectClassBlockManually}
            />
          )}
        </div>

        {/* 우측: 수업 도구 독 (깔끔한 아이콘 그리드) */}
        <div className={`${activeTool === 'quest' ? 'col-span-1' : 'col-span-3'} flex flex-col gap-4 transition-all duration-300`}>
          <div className="bg-white/70 rounded-2xl shadow p-4 h-full flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-700 mb-4 w-full text-center border-b pb-2">
              🧰 도구
            </h3>
            <div className="grid grid-cols-1 gap-4 w-full">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                  className={`
                    flex flex-col items-center justify-center
                    p-4 rounded-xl transition-all duration-200
                    hover:scale-105 active:scale-95
                    ${
                    // 1. 활성화된 상태 (배경 강조)
                    activeTool === tool.id
                      ? "bg-indigo-100/80 shadow-inner"
                      : "bg-white shadow-sm hover:shadow-md border border-slate-100"
                    }
                    ${
                    // 2. 퀘스트 툴 특별 처리 (활성화 안됐어도 진행중이면 강조)
                    tool.id === 'quest' && activeQuest && activeTool !== 'quest'
                      ? "bg-orange-50 ring-2 ring-orange-200 animate-pulse"
                      : ""
                    }
                    ${
                    // 3. 퀘스트 모드 활성화 상태
                    tool.id === 'quest' && activeTool === 'quest'
                      ? "!bg-orange-100 !ring-0" // 링 제거
                      : ""
                    }
                  `}
                >
                  <span className="text-3xl mb-1">{tool.icon}</span>
                  {activeTool !== 'quest' && (
                    <span className="text-xs font-bold text-gray-600 animate-in fade-in">{tool.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 도구 모달 오버레이 (활성화 시 등장) */}
      {/* 🔹 도구 모달 오버레이 (활성화 시 등장) - 퀘스트는 제외 (대시보드로 표시) */}
      {/* 🔹 도구 모달 오버레이 (활성화 시 등장) - 퀘스트는 제외 (대시보드로 표시) */}
      <BaseModal isOpen={activeTool && activeTool !== 'quest'} onClose={() => setActiveTool(null)}>
        <div
          className="relative w-[90vw] max-w-6xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 (외부 플로팅) */}
          <button
            onClick={() => setActiveTool(null)}
            className="absolute -top-12 right-0 text-white/80 hover:text-white flex items-center gap-2 font-bold transition-colors"
          >
            <span>닫기</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">✕</div>
          </button>

          {/* 위젯 본문 렌더링 (투명 컨테이너, 도구 자체 스타일 사용) */}
          <div className="w-full h-full">
            {(() => {
              const targetToolId = activeTool || lastActiveTool;
              if (!targetToolId) return null; // Should not happen if lastActiveTool works

              const TargetWidget = tools.find(t => t.id === targetToolId)?.component;
              // 퀘스트는 대시보드 형태이므로 모달에 띄우지 않음 (혹은 모달로 띄워도 되지만, 기획상 대시보드로 변경)
              if (targetToolId === 'quest') return null;

              return TargetWidget ? (
                <TargetWidget
                  students={presentStudents}
                  onClose={() => setActiveTool(null)}

                  // 퀘스트 위젯 전용 props
                  quests={quests}
                  activeQuestId={activeQuestId}
                  onAddQuest={addQuest}
                  onDeleteQuest={deleteQuest}
                  onSetActiveQuest={toggleQuestActive}
                />
              ) : null;
            })()}
          </div>
        </div>
      </BaseModal>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow text-sm
            ${toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-gray-900 text-white"
            }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ClassPage;