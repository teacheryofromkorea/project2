/**
 * BreakTimeBoard
 *
 * [역할]
 * - 쉬는시간 화면 전체 UI를 담당하는 컨테이너 컴포넌트
 * - 쉬는시간 루틴 표시 및 편집 UI 제공
 * - 쉬는시간 착석 체크 영역 렌더링
 * - 오늘의 미션 / 학생 상태 사이드바 연동
 *
 * [위임된 책임]
 * - 쉬는시간 시간 블록 선택 정책 → useBreakBlockSelection
 * - 쉬는시간 루틴 CRUD 로직 → useBreakRoutine
 *
 * [의도적으로 포함하지 않는 것]
 * - 시간 블록 자동 전환 로직의 세부 구현
 * - 루틴 / 미션 / 학생 DB 쿼리의 정책 결정
 *
 * ※ 이 컴포넌트는 "화면 구성"과 "hook 조합"에만 집중한다.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import useBreakBlockSelection from "../../hooks/Break/useBreakBlockSelection";
import { supabase } from "../../lib/supabaseClient";
import TodayChallengeSidebar from "./TodayChallengeSidebar";
import SeatCheckContainer from "./SeatCheckContainer";
import ClassDutySidebar from "./ClassDutySidebar";
import StudentTaskModal from "../Attendance/StudentTaskModal";
import useBreakRoutine from "../../hooks/Break/useBreakRoutine";
import { BREAK_AUTO_SWITCH_EVENT } from "../../hooks/Break/useBreakBlockSelection";

export default function BreakTimeBoard() {
  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [routineStatus, setRoutineStatus] = useState([]);

  const [targetStudent, setTargetStudent] = useState(null);

  const {
    breakBlocks,
    selectedBlockId,
    setSelectedBlockId,
  } = useBreakBlockSelection();

  // 쉬는시간 루틴(공통) ID
  const ROUTINE_ID = "e2c703b6-e823-42ce-9373-9fb12a4cdbb1";

  const {
    routineItems,
    routineTitle,
    tempTitle,
    setTempTitle,
    newContent,
    setNewContent,
    editRoutine,
    setEditRoutine,
    editText,
    setEditText,

    fetchRoutineItems,
    fetchRoutineTitle,
    addRoutineItem,
    deleteRoutineItem,
    moveRoutine,
    updateRoutine,
    saveRoutineTitle,
  } = useBreakRoutine({ routineId: ROUTINE_ID });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [attendanceStatus, setAttendanceStatus] = useState([]);

  // ----------------------
  // 쉬는시간 맥락 데이터
  // (학생 / 오늘 미션 / 수행 상태)
  // ----------------------
  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, gender")
      .order("name", { ascending: true });

    if (!error) setStudents(data || []);
  }, []);

  const fetchMissions = useCallback(async () => {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error) setMissions(data || []);
  }, []);

  const fetchMissionStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_mission_status")
      .select("*")
      .eq("date", today);

    if (!error) setMissionStatus(data || []);
  }, [today]);

  const fetchRoutineStatus = useCallback(async () => {
    if (!selectedBlockId) {
      setRoutineStatus([]);
      return;
    }

    const { data, error } = await supabase
      .from("student_break_routine_status")
      .select("*")
      .eq("date", today)
      .eq("block_id", selectedBlockId);

    if (!error) setRoutineStatus(data || []);
  }, [today, selectedBlockId]);

  const fetchAttendanceStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_attendance_status")
      .select("*")
      .eq("date", today)
      .eq("present", true);

    if (!error) setAttendanceStatus(data || []);
  }, [today]);

  // 초기 진입 및 의존성 변경 시 쉬는시간 화면에 필요한 데이터 로딩
  useEffect(() => {
    (async ()=> {
      await Promise.all([
        fetchRoutineTitle(),
        fetchRoutineItems(),
        fetchStudents(),
        fetchMissions(),
        fetchMissionStatus(),
        fetchRoutineStatus(),
        fetchAttendanceStatus(),
      ]);
    })();
  }, [
    fetchRoutineTitle,
    fetchRoutineItems,
    fetchStudents,
    fetchMissions,
    fetchMissionStatus,
    fetchRoutineStatus,
    fetchAttendanceStatus,
  ]);

  const presentStudentIds = useMemo(() => {
    return attendanceStatus.map((a) => a.student_id);
  }, [attendanceStatus]);

  const presentStudents = useMemo(() => {
    return students.filter((s) => presentStudentIds.includes(s.id));
  }, [students, presentStudentIds]);

  // 루틴 제목 저장 핸들러
  const handleSaveRoutineTitleAndClose = async () => {
    await saveRoutineTitle();
    setIsRoutineModalOpen(false);
  };

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [autoSwitchToast, setAutoSwitchToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const { blockId } = e.detail || {};

      const block = breakBlocks.find((b) => b.id === blockId);
      if (!block) return;

      setAutoSwitchToast(
        `⏰ 지금은 ${block.name} (${block.start_time?.slice(0, 5)} ~ ${block.end_time?.slice(0, 5)}) 입니다`
      );

      // 3초 후 자동 제거
      setTimeout(() => {
        setAutoSwitchToast(null);
      }, 3000);
    };

    window.addEventListener(BREAK_AUTO_SWITCH_EVENT, handler);
    return () => {
      window.removeEventListener(BREAK_AUTO_SWITCH_EVENT, handler);
    };
  }, [breakBlocks]);

  useEffect(() => {
    const handleAttendanceUpdated = async () => {
      await fetchAttendanceStatus();
    };

    window.addEventListener("attendance:updated", handleAttendanceUpdated);
    return () => {
      window.removeEventListener("attendance:updated", handleAttendanceUpdated);
    };
  }, [fetchAttendanceStatus]);

  return (
    <div className="grid grid-cols-[260px,1fr,260px] gap-4 h-[85vh]">

      {/* 1. 좌측 오늘의 도전 */}
      <TodayChallengeSidebar
        students={presentStudents}
        missions={missions}
        studentMissionStatus={missionStatus}
        routineItems={routineItems}
        studentBreakRoutineStatus={routineStatus}
        onOpenModal={setTargetStudent}
        onSaved={async () => {
          await fetchMissionStatus();
          await fetchRoutineStatus();
        }}
      />

      {/* 중앙 (상단 + 하단) */}
      <div className="flex flex-col gap-4">

        {/* 2. 상단 쉬는시간 루틴 */}
        <div className="bg-white/70 rounded-3xl shadow p-8 flex flex-col gap-6">
<div className="flex items-center justify-between">

  {/* 제목(클릭 = 편집) */}
  <div className="relative group">
    <h2
      onClick={() => {
        setTempTitle(routineTitle);
        setNewContent("");
        setIsRoutineModalOpen(true);
      }}
      className="text-3xl font-extrabold tracking-tight text-gray-800 cursor-pointer
                 hover:text-blue-600 transition-colors"
    >
      📝 {routineTitle}
    </h2>
    <div className="
      absolute left-0 top-full mt-1 px-2 py-1 rounded-md text-xs
      bg-gray-800 text-white opacity-0 group-hover:opacity-100
      transition-opacity pointer-events-none
    ">
      클릭하여 루틴을 편집합니다
    </div>
  </div>

  {/* 오른쪽: 드롭다운 */}
  <div className="flex items-center gap-3">
    {breakBlocks.length > 0 && (
      <select
        value={selectedBlockId || ""}
        onChange={(e) => {
          const value = e.target.value || null;
          setSelectedBlockId(value);
        }}
        className="px-3 py-2 rounded-full border border-gray-300 bg-white text-sm shadow-sm text-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {breakBlocks.map((block) => (
          <option key={block.id} value={block.id}>
            {block.name} ({block.start_time?.slice(0, 5)} ~ {block.end_time?.slice(0, 5)})
          </option>
        ))}
      </select>
    )}
  </div>

</div>
          <div
            className="flex flex-wrap items-center gap-4 text-lg font-semibold text-gray-900 cursor-pointer hover:opacity-80 transition"
            onClick={() => {
              setTempTitle(routineTitle);
              setNewContent("");
              setIsRoutineModalOpen(true);
            }}
          >
            {routineItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-800 break-words max-w-[260px]">
                  {item.content}
                </span>
                {index < routineItems.length - 1 && (
                  <span className="text-gray-400 text-2xl font-light">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. 하단 착석 체크 */}
        <SeatCheckContainer
          blockId={selectedBlockId}
          students={presentStudents}
        />
      </div>

      {/* 4. 우측 역할 사이드바 */}
      <ClassDutySidebar />

      {/* ----------------------------------------
        루틴 편집 모달 (Inline)
      ---------------------------------------- */}
      {isRoutineModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setIsRoutineModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">쉬는시간 루틴 편집</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              루틴 제목
            </label>
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* LIST ITEMS */}
            <ul className="max-h-48 overflow-y-auto mb-6 space-y-2">
              {routineItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="flex-1">{item.content}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveRoutine(index, "up")}
                      className="text-gray-500 font-bold"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveRoutine(index, "down")}
                      className="text-gray-500 font-bold"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => {
                        setEditRoutine(item);
                        setEditText(item.content);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteRoutineItem(item.id)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* ADD NEW ITEM */}
            <label className="block text-sm font-medium text-gray-700 mb-2">새 루틴 항목</label>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addRoutineItem}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                추가
              </button>
            </div>

            {/* 저장/닫기 버튼 그룹 */}
            <div>
              <button
                onClick={handleSaveRoutineTitleAndClose} // 핸들러 함수 호출로 변경
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 mr-2"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setTempTitle(routineTitle);
                  setNewContent("");
                  setIsRoutineModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------
        항목 수정 모달 (Inline)
      ---------------------------------------- */}
      {editRoutine && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[300px]">
            <h3 className="text-lg font-bold mb-4">루틴 수정</h3>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={updateRoutine}
              className="w-full bg-blue-600 text-white rounded-full py-2 mb-2 font-semibold"
            >
              저장
            </button>
            <button
              onClick={() => {
                setEditRoutine(null);
                setEditText("");
              }}
              className="w-full bg-gray-300 rounded-full py-2 font-semibold"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------
        학생 작업 모달 (StudentTaskModal 컴포넌트 활용)
      ---------------------------------------- */}
      {targetStudent && (
        <StudentTaskModal
          isOpen={!!targetStudent}
          student={targetStudent}
          missions={missions}
          routines={routineItems}
          routineStatusTable="student_break_routine_status"
          blockId={selectedBlockId}
          showRoutines={true}
          onClose={() => setTargetStudent(null)}
          onSaved={async () => {
            await fetchMissionStatus();
            await fetchRoutineItems();
            await fetchRoutineStatus();
          }}
        />
      )}

      {autoSwitchToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="
            bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl
            text-sm font-semibold animate-fade-in
          ">
            {autoSwitchToast}
          </div>
        </div>
      )}
    </div>
  );
}
