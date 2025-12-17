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
import BreakRoutinePanel from "./BreakRoutinePanel.jsx";

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

        <BreakRoutinePanel
          routineTitle={routineTitle}
          routineItems={routineItems}
          breakBlocks={breakBlocks}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          setTempTitle={setTempTitle}
          setNewContent={setNewContent}
          setIsRoutineModalOpen={setIsRoutineModalOpen}
          isRoutineModalOpen={isRoutineModalOpen}
          tempTitle={tempTitle}
          newContent={newContent}
          moveRoutine={moveRoutine}
          deleteRoutineItem={deleteRoutineItem}
          addRoutineItem={addRoutineItem}
          editRoutine={editRoutine}
          setEditRoutine={setEditRoutine}
          editText={editText}
          setEditText={setEditText}
          updateRoutine={updateRoutine}
          saveRoutineTitle={saveRoutineTitle}
        />

        {/* 3. 하단 착석 체크 */}
        <SeatCheckContainer
          blockId={selectedBlockId}
          students={presentStudents}
        />
      </div>

      {/* 4. 우측 역할 사이드바 */}
      <ClassDutySidebar />

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
