import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getTodayString } from "../../utils/dateUtils";
import EndTaskModal from "./EndTaskModal";
import useEndRoutine from "../../hooks/End/useEndRoutine";
import GenericRoutineSidebar from "../shared/GenericRoutineSidebar";
import MissionSidebar from "../Attendance/MissionSidebar";
import SeatGrid from "../Attendance/SeatGrid";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

export default function EndTimeBoard() {
  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [routineStatus, setRoutineStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [dismissalStatus, setDismissalStatus] = useState([]);
  const [seats, setSeats] = useState([]);

  const [targetStudent, setTargetStudent] = useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleOpenTaskModal = (student) => {
    setTargetStudent(student);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const endRoutine = useEndRoutine();
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
  } = endRoutine;

  const today = useMemo(() => getTodayString(), []);

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
    const { data, error } = await supabase
      .from("student_end_routine_status")
      .select("*")
      .eq("date", today);

    if (!error) setRoutineStatus(data || []);
  }, [today]);

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

  const fetchDismissalStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_end_check_status")
      .select("*")
      .eq("date", today);

    if (!error) setDismissalStatus(data || []);
  }, [today]);

  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchRoutineTitle(),
        // fetchRoutineItems() 제거: fetchRoutineTitle 내부에서 처리됨 & 초기엔 titleId 없음
        fetchStudents(),
        fetchSeats(),
        fetchMissions(),
        fetchMissionStatus(),
        fetchRoutineStatus(),
        fetchAttendanceStatus(),
        fetchDismissalStatus(),
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
    fetchDismissalStatus,
  ]);

  const presentStudentIds = useMemo(() => {
    // Filter locally since we now fetch all
    return attendanceStatus
      .filter((a) => a.present)
      .map((a) => a.student_id);
  }, [attendanceStatus]);

  const dismissalStatusMap = useMemo(() => {
    const map = {};
    dismissalStatus.forEach((d) => {
      map[d.student_id] = d.checked;
    });
    return map;
  }, [dismissalStatus]);

  // Combined Status Map for SeatGrid
  // - If Present: Use Dismissal Check Status (Seated='present' color, Not Seated='unchecked' white)
  // - If Absent: Use Attendance Status (e.g. 'sick-absent')
  const combinedStatusMap = useMemo(() => {
    const map = {};
    students.forEach((student) => {
      const att = attendanceStatus.find((a) => a.student_id === student.id);
      const isPresent = att?.present;

      if (isPresent) {
        // Present -> check dismissal status
        const isDismissed = dismissalStatusMap[student.id];
        map[student.id] = isDismissed ? 'present' : 'unchecked';
      } else {
        // Absent or Unchecked -> use detailed status if available
        map[student.id] = att?.status || 'unchecked';
      }
    });
    return map;
  }, [students, attendanceStatus, dismissalStatusMap]);

  const handleToggleDismissal = async (student) => {
    // 출석하지 않은 학생은 하교 체크 불가
    if (!presentStudentIds.includes(student.id)) {
      return;
    }

    const current = !!dismissalStatusMap[student.id];
    const next = !current;

    const { error } = await supabase
      .from("student_end_check_status")
      .upsert(
        {
          student_id: student.id,
          date: today,
          checked: next,
        },
        { onConflict: "student_id,date" }
      );

    if (error) {
      handleSupabaseError(error, "하교 상태 저장에 실패했어요.");
    } else {
      await fetchDismissalStatus();
    }
  };

  // Resilience: Match students to seats if join failed (safeguard against data fetching issues)
  const robustSeats = useMemo(() => {
    return seats.map((seat) => {
      // If seat already has students data joined, use it
      if (seat.students) return seat;

      // Otherwise, try to find the student in the separate students list
      const matchedStudent = students.find((s) => s.id === seat.student_id);
      return { ...seat, students: matchedStudent };
    });
  }, [seats, students]);

  // 미실시자 필터링
  const filteredSeats = useMemo(() => {
    if (!showIncompleteOnly) return robustSeats;

    return robustSeats.filter((seat) => {
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
    robustSeats,
    presentStudentIds,
    routineStatus,
    routineItems,
    missionStatus,
    missions,
  ]);

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
    const dismissed = dismissalStatus.filter((d) => d.checked).length;
    return { total, attended, dismissed };
  }, [students, presentStudentIds, dismissalStatus]);

  // ✅ 진행률 계산 (Progress Calculation)
  const progressMap = useMemo(() => {
    const map = {};
    if (!routineItems || !missions) return map;

    const totalCount = routineItems.length + missions.length;

    students.forEach((s) => {
      map[s.id] = { completed: 0, total: totalCount };
    });

    // 1. Routine (End Routine)
    const activeRoutineIds = new Set(routineItems.map((r) => r.id));
    routineStatus.forEach((row) => {
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
            {/* Left: End Routine Area */}
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
              themeColor="violet" // 🌇 End Theme
            />

            {/* Center: Seat Grid with Header */}
            <div className="relative w-full h-full rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/80 p-6 sm:p-8 shadow-xl flex flex-col overflow-hidden">
              {/* Header inside SeatGrid */}
              <div className="flex-none mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    End <span className="text-violet-600">Status</span>
                  </h2>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-gray-200 shadow-sm flex items-center gap-2">
                      <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">전체</span>
                      <span className="text-base font-extrabold text-gray-900 leading-none">{stats.total}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-green-200 shadow-sm flex items-center gap-2">
                      <span className="text-[13px] text-green-700 font-bold uppercase tracking-wider">출석</span>
                      <span className="text-base font-extrabold text-green-700 leading-none">{stats.attended}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 shadow-sm flex items-center gap-2">
                      <span className="text-[13px] text-purple-700 font-bold uppercase tracking-wider">하교</span>
                      <span className="text-base font-extrabold text-purple-700 leading-none">{stats.dismissed}</span>
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
                      className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
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
                  disabledMap={robustSeats.reduce((acc, seat) => {
                    if (seat.students && !presentStudentIds.includes(seat.students.id)) {
                      acc[seat.students.id] = true;
                    }
                    return acc;
                  }, {})}
                  onToggleAttendance={handleToggleDismissal}
                  onOpenMission={handleOpenTaskModal}
                  alwaysActiveMission={true} // ✅ 하교시간 탭은 미션버튼 항상 활성
                />
              </div>
            </div>

            {/* Right: Mission Sidebar */}
            <MissionSidebar
              missions={missions}
              students={students.filter((s) => presentStudentIds.includes(s.id))}
              studentMissionStatus={missionStatus}
              onOpenModal={handleOpenTaskModal}
              themeColor="violet" // 🌇 End Theme
            />
          </div>
        </div>
      </div>

      {/* Student Task Modal - Always rendered, controlled by isOpen */}
      <EndTaskModal
        isOpen={isTaskModalOpen}
        student={targetStudent}
        missions={missions}
        routines={routineItems}
        routineLabel={routineTitle || "하교시간 루틴"}
        onClose={handleCloseTaskModal}
        onSaved={async () => {
          await fetchMissionStatus();
          await fetchRoutineItems();
          await fetchRoutineStatus();
        }}
      />
    </>
  );
}