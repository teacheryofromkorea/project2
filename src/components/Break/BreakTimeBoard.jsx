import { useState, useEffect, useCallback, useMemo } from "react";
import { getTodayString } from "../../utils/dateUtils";
import useBreakBlockSelection from "../../hooks/Break/useBreakBlockSelection";
import { supabase } from "../../lib/supabaseClient";
import BreakTaskModal from "./BreakTaskModal";
import useBreakRoutine from "../../hooks/Break/useBreakRoutine";
import { BREAK_AUTO_SWITCH_EVENT } from "../../hooks/Break/useBreakBlockSelection";
import GenericRoutineSidebar from "../shared/GenericRoutineSidebar";
import MissionSidebar from "../Attendance/MissionSidebar";
import SeatGrid from "../Attendance/SeatGrid";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import LiveClock from "../common/LiveClock"; // ✅ Import shared clock
import UncheckedStudentsModal from "../Attendance/UncheckedStudentsModal"; // ✅ Reuse modal

export default function BreakTimeBoard() {
  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [routineStatus, setRoutineStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [seatStatus, setSeatStatus] = useState([]);
  const [seats, setSeats] = useState([]);

  const [targetStudent, setTargetStudent] = useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ✅ 출결 관리 모달 상태
  const [isUncheckedModalOpen, setIsUncheckedModalOpen] = useState(false);
  const [modalTargetStudents, setModalTargetStudents] = useState([]);
  const [modalConfig, setModalConfig] = useState({ title: null, description: null });
  const [modalType, setModalType] = useState(null); // "unchecked" context reuse

  const handleOpenTaskModal = (student) => {
    setTargetStudent(student);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const {
    breakBlocks,
    selectedBlockId,
    setSelectedBlockId,
  } = useBreakBlockSelection();

  /* 
    [Refactor] 
    - 이전: const ROUTINE_ID = "e2c7..." (하드코딩) -> useBreakRoutine({ routineId: ROUTINE_ID })
    - 변경: useBreakRoutine() 내부에서 "가장 최신" 루틴을 자동 감지/생성
  */
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
  } = useBreakRoutine();

  const today = useMemo(() => getTodayString(), []);

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, gender, number")
      .order("name", { ascending: true });

    if (!error) setStudents(data || []);
  }, []);

  const fetchSeats = useCallback(async () => {
    const { data, error } = await supabase
      .from("classroom_seats")
      .select(`
        id,
        row,
        col,
        label,
        student_id,
        students (
          id,
          name,
          number,
          gender
        )
      `)
      .order("row", { ascending: true })
      .order("col", { ascending: true });

    if (!error) setSeats(data || []);
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

  /* 
    [Refactor] 
    - Fetch ALL attendance statuses to show detailed status for absent students.
    - Previous: .eq("present", true) -> Removed to fetch all.
  */
  const fetchAttendanceStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_attendance_status")
      .select("*")
      .eq("date", today);

    if (!error) setAttendanceStatus(data || []);
  }, [today]);

  const fetchSeatStatus = useCallback(async () => {
    if (!selectedBlockId) {
      setSeatStatus([]);
      return;
    }

    const { data, error } = await supabase
      .from("break_seat_status")
      .select("*")
      .eq("date", today)
      .eq("block_id", selectedBlockId);

    if (!error) setSeatStatus(data || []);
  }, [today, selectedBlockId]);

  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchRoutineTitle(),
        fetchRoutineItems(),
        fetchStudents(),
        fetchSeats(),
        fetchMissions(),
        fetchMissionStatus(),
        fetchRoutineStatus(),
        fetchAttendanceStatus(),
        fetchSeatStatus(),
      ]);
    })();
  }, [
    fetchRoutineTitle,
    fetchRoutineItems,
    fetchStudents,
    fetchSeats,
    fetchMissions,
    fetchMissionStatus,
    fetchRoutineStatus,
    fetchAttendanceStatus,
    fetchSeatStatus,
  ]);

  const presentStudentIds = useMemo(() => {
    // Filter locally since we now fetch all
    return attendanceStatus
      .filter((a) => a.present)
      .map((a) => a.student_id);
  }, [attendanceStatus]);

  const seatStatusMap = useMemo(() => {
    const map = {};
    seatStatus.forEach((s) => {
      map[s.student_id] = s.is_seated;
    });
    return map;
  }, [seatStatus]);

  // Combined Status Map for SeatGrid
  // - If Present: Use Seat Status (Seated='present' color, Not Seated='unchecked' white)
  // - If Absent: Use Attendance Status (e.g. 'sick-absent')
  const combinedStatusMap = useMemo(() => {
    const map = {};
    students.forEach((student) => {
      const att = attendanceStatus.find((a) => a.student_id === student.id);
      const isPresent = att?.present;

      if (isPresent) {
        // Present -> check seat status
        const isSeated = seatStatusMap[student.id];
        map[student.id] = isSeated ? 'present' : 'unchecked';
      } else {
        // Absent or Unchecked -> use detailed status if available
        map[student.id] = att?.status || 'unchecked';
      }
    });
    return map;
  }, [students, attendanceStatus, seatStatusMap]);

  const handleToggleSeat = async (student) => {
    // 출석하지 않은 학생은 착석 체크 불가
    if (!presentStudentIds.includes(student.id)) {
      return;
    }

    if (!selectedBlockId) {
      alert("먼저 쉬는시간을 선택해주세요.");
      return;
    }

    const current = !!seatStatusMap[student.id];
    const next = !current;

    const { error } = await supabase
      .from("break_seat_status")
      .upsert({
        student_id: student.id,
        date: today,
        block_id: selectedBlockId,
        is_seated: next,
      }, { onConflict: "student_id,date,block_id" });

    if (error) {
      handleSupabaseError(error, "착석 상태 저장에 실패했어요.");
    } else {
      await fetchSeatStatus();
    }
  };

  // 미실시자 필터링
  const filteredSeats = useMemo(() => {
    if (!showIncompleteOnly) return seats;

    return seats.filter((seat) => {
      const student = seat.students;
      if (!student) return false;
      if (!presentStudentIds.includes(student.id)) return false;

      // 루틴 미완료 확인
      const completedRoutines = routineStatus
        .filter((r) => r.student_id === student.id && r.done)
        .map((r) => r.routine_item_id);
      const hasIncompleteRoutine = routineItems.some(
        (item) => !completedRoutines.includes(item.id)
      );

      // 미션 미완료 확인
      const completedMissions = missionStatus
        .filter((m) => m.student_id === student.id && m.done)
        .map((m) => m.mission_id);
      const hasIncompleteMission = missions.some(
        (item) => !completedMissions.includes(item.id)
      );

      return hasIncompleteRoutine || hasIncompleteMission;
    });
  }, [
    showIncompleteOnly,
    seats,
    presentStudentIds,
    routineStatus,
    routineItems,
    missionStatus,
    missions,
  ]);

  const [autoSwitchToast, setAutoSwitchToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const { blockId } = e.detail || {};
      const block = breakBlocks.find((b) => b.id === blockId);
      if (!block) return;

      setAutoSwitchToast(
        `⏰ 지금은 ${block.name} (${block.start_time?.slice(0, 5)} ~ ${block.end_time?.slice(0, 5)}) 입니다`
      );

      setTimeout(() => {
        setAutoSwitchToast(null);
      }, 3000);
    };

    window.addEventListener(BREAK_AUTO_SWITCH_EVENT, handler);
    return () => {
      window.removeEventListener(BREAK_AUTO_SWITCH_EVENT, handler);
    };
  }, [breakBlocks]);

  /* 
    [Note] 
    출석 처리 로직(markPresent)은 이제 UncheckedStudentsModal 내부에서 처리하고,
    완료 시 onSaved 콜백을 통해 fetchAttendanceStatus()를 호출하여 상태를 갱신합니다.
    따라서 별도의 markPresent 핸들러는 필요 없습니다. 
  */

  useEffect(() => {
    const handleAttendanceUpdated = async () => {
      await fetchAttendanceStatus();
    };

    window.addEventListener("attendance:updated", handleAttendanceUpdated);
    return () => {
      window.removeEventListener("attendance:updated", handleAttendanceUpdated);
    };
  }, [fetchAttendanceStatus]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = students.length;
    const attended = presentStudentIds.length;

    // 착석: 현재 출석한 학생 중 착석 체크된 학생 수
    const seated = seatStatus.filter((s) => s.is_seated && presentStudentIds.includes(s.student_id)).length;

    // 미착석: 출석했지만 착석하지 않은 학생 수
    const unseated = attended - seated;

    return { total, attended, seated, unseated };
  }, [students, presentStudentIds, seatStatus]);

  // ✅ 진행률 계산 (Progress Calculation)
  const progressMap = useMemo(() => {
    const map = {};
    if (!routineItems || !missions) return map;

    const totalCount = routineItems.length + missions.length;

    students.forEach((s) => {
      map[s.id] = { completed: 0, total: totalCount };
    });

    // 1. Routine (Break Routine)
    const activeRoutineIds = new Set(routineItems.map((r) => r.id));
    routineStatus.forEach((row) => {
      // note: break routine uses 'routine_item_id' and usually 'done' or 'completed' depending on table schema
      if ((row.done || row.completed) && activeRoutineIds.has(row.routine_item_id)) {
        if (!map[row.student_id]) map[row.student_id] = { completed: 0, total: totalCount };
        map[row.student_id].completed += 1;
      }
    });

    // 2. Mission (Common)
    const activeMissionIds = new Set(missions.map((m) => m.id));
    missionStatus.forEach((row) => {
      if ((row.done || row.completed) && activeMissionIds.has(row.mission_id)) {
        if (!map[row.student_id]) map[row.student_id] = { completed: 0, total: totalCount };
        map[row.student_id].completed += 1;
      }
    });

    return map;
  }, [routineItems, missions, students, routineStatus, missionStatus]);


  return (
    <>
      <div className="relative w-full flex-1 flex flex-col bg-transparent min-h-0">
        {/* Decorative ambient blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]" />
        </div>

        {/* Main Content: 3-column layout */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-[260px,1fr,260px] gap-6 w-full max-w-[1700px] flex-1 mx-auto min-h-0">
            {/* Left: Break Routine Panel */}
            <GenericRoutineSidebar
              routineTitle={routineTitle}
              routineItems={routineItems}
              tempTitle={tempTitle}
              setTempTitle={setTempTitle}
              newContent={newContent}
              setNewContent={setNewContent}
              editRoutine={editRoutine}
              setEditRoutine={setEditRoutine}
              editText={editText}
              setEditText={setEditText}
              addRoutineItem={addRoutineItem}
              deleteRoutineItem={deleteRoutineItem}
              moveRoutine={moveRoutine}
              updateRoutine={updateRoutine}
              saveRoutineTitle={saveRoutineTitle}
              breakBlocks={breakBlocks}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
              themeColor="emerald" // 🌳 Break Theme
            />

            {/* Center: Seat Grid with Header */}
            <div className="relative w-full h-full rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/80 px-6 sm:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 shadow-xl flex flex-col overflow-hidden">
              {/* Header inside SeatGrid */}
              <div className="flex-none mb-4">
                <div className="flex items-center justify-between mb-5">
                  <LiveClock />
                  <div className="flex gap-2">
                    {/* 전체 (Interactive) */}
                    <button
                      onClick={() => {
                        // 전체 학생 + 현재 상태
                        const enrichedStudents = students.map(s => {
                          const statusRow = attendanceStatus.find(a => a.student_id === s.id);
                          return { ...s, status: statusRow?.status || 'unchecked' };
                        });
                        setModalTargetStudents(enrichedStudents);
                        setModalConfig({
                          title: "📋 전체 학생 명단",
                          description: "전체 학생의 출결 상태를 확인하고 수정합니다."
                        });
                        setIsUncheckedModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/95 border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">전체</span>
                      <span className="text-base font-extrabold text-gray-900 leading-none">{stats.total}</span>
                    </button>

                    {/* 출석 (Interactive) */}
                    <button
                      onClick={() => {
                        // 출석한 학생만 필터링
                        const presentStudents = students
                          .filter(s => presentStudentIds.includes(s.id))
                          .map(s => ({ ...s, status: 'present' }));

                        setModalTargetStudents(presentStudents);
                        setModalConfig({
                          title: "✅ 출석한 학생",
                          description: "현재 출석으로 체크된 학생 목록입니다."
                        });
                        setIsUncheckedModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-green-200 shadow-sm flex items-center gap-2 hover:bg-green-50 transition-colors cursor-pointer"
                    >
                      <span className="text-[13px] text-green-700 font-bold uppercase tracking-wider">출석</span>
                      <span className="text-base font-extrabold text-green-700 leading-none">{stats.attended}</span>
                    </button>

                    {/* 미착석 (Unseated / Present) */}
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-red-200 shadow-sm flex items-center gap-2">
                      <span className="text-[13px] text-red-700 font-bold uppercase tracking-wider">미착석</span>
                      <span className="text-base font-extrabold text-red-700 leading-none">
                        {stats.unseated}<span className="text-sm font-semibold opacity-60">/{stats.attended}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={showIncompleteOnly}
                      onChange={(e) => setShowIncompleteOnly(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">미실시자만 보기</span>
                  </label>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto">
                <SeatGrid
                  seats={filteredSeats}
                  statusMap={combinedStatusMap}
                  progressMap={progressMap} // ✅ Pass progress map
                  disabledMap={seats.reduce((acc, seat) => {
                    const student = seat.students;
                    // If student is NOT present (absent or unchecked), disable them
                    if (student && !presentStudentIds.includes(student.id)) {
                      acc[student.id] = true;
                    }
                    return acc;
                  }, {})}
                  onToggleAttendance={handleToggleSeat}
                  onOpenMission={handleOpenTaskModal}
                  alwaysActiveMission={true} // ✅ 쉬는시간 탭은 미션버튼 항상 활성
                />
              </div>
            </div>

            {/* Right: Mission Sidebar */}
            <MissionSidebar
              missions={missions}
              students={students.filter((s) => presentStudentIds.includes(s.id))}
              studentMissionStatus={missionStatus}
              onOpenModal={handleOpenTaskModal}
              themeColor="emerald" // 🌳 Break Theme
            />
          </div>
        </div>
      </div>

      {/* Student Task Modal - Always rendered if we have a target, controlled by isOpen */}
      <BreakTaskModal
        isOpen={isTaskModalOpen}
        student={targetStudent}
        missions={missions}
        routines={routineItems}
        routineTitle={routineTitle} // ✅ 루틴 제목 전달
        blockId={selectedBlockId}
        onClose={handleCloseTaskModal}
        onSaved={async () => {
          await fetchMissionStatus();
          await fetchRoutineItems();
          await fetchRoutineStatus();
        }}
      />

      <UncheckedStudentsModal
        isOpen={isUncheckedModalOpen}
        onClose={() => setIsUncheckedModalOpen(false)}
        uncheckedStudents={modalTargetStudents} // ✅ Correct prop name
        title={modalConfig.title} // ✅ Correct prop name
        description={modalConfig.description} // ✅ Correct prop name
        onSaved={async () => {
          await fetchAttendanceStatus(); // ✅ Refresh status after save
        }}
      />

      {/* Auto-switch toast */}
      {
        autoSwitchToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-semibold animate-fade-in">
              {autoSwitchToast}
            </div>
          </div>
        )
      }
    </>
  );
}
