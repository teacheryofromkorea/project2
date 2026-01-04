import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import StudentTaskModal from "../Attendance/StudentTaskModal";
import useLunchRoutine from "../../hooks/Lunch/useLunchRoutine";
import GenericRoutineSidebar from "../shared/GenericRoutineSidebar";
import MissionSidebar from "../Attendance/MissionSidebar";
import SeatGrid from "../Attendance/SeatGrid";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

export default function LunchTimeBoard() {
  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [routineStatus, setRoutineStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [seatStatus, setSeatStatus] = useState([]);
  const [seats, setSeats] = useState([]);

  const [targetStudent, setTargetStudent] = useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

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
  } = useLunchRoutine();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

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
      .from("student_lunch_routine_status")
      .select("*")
      .eq("date", today);

    if (!error) setRoutineStatus(data || []);
  }, [today]);

  const fetchAttendanceStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_attendance_status")
      .select("*")
      .eq("date", today)
      .eq("present", true);

    if (!error) setAttendanceStatus(data || []);
  }, [today]);

  const fetchSeatStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("lunch_seat_status")
      .select("*")
      .eq("date", today);

    if (!error) setSeatStatus(data || []);
  }, [today]);

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
    return attendanceStatus.map((a) => a.student_id);
  }, [attendanceStatus]);

  const seatStatusMap = useMemo(() => {
    const map = {};
    seatStatus.forEach((s) => {
      map[s.student_id] = s.is_seated;
    });
    return map;
  }, [seatStatus]);

  // 출석 여부 맵 (SeatGrid의 isPresent prop용)
  const attendanceMap = useMemo(() => {
    const map = {};
    presentStudentIds.forEach((id) => {
      map[id] = true;
    });
    return map;
  }, [presentStudentIds]);

  const handleToggleSeat = async (student) => {
    // 출석하지 않은 학생은 착석 체크 불가
    if (!presentStudentIds.includes(student.id)) {
      return;
    }

    const current = !!seatStatusMap[student.id];
    const next = !current;

    const { error } = await supabase
      .from("lunch_seat_status")
      .upsert({
        student_id: student.id,
        date: today,
        is_seated: next,
      }, { onConflict: "student_id,date" });

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
    const attended = attendanceStatus.length;
    const seated = seatStatus.filter((s) => s.is_seated).length;
    return { total, attended, seated };
  }, [students, attendanceStatus, seatStatus]);

  return (
    <>
      <div className="relative w-full h-full flex flex-col bg-transparent overflow-hidden">
        {/* Decorative ambient blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]" />
        </div>

        {/* Main Content: 3-column layout */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 mx-auto min-h-0 w-full max-w-[1700px] px-4 py-6">
            <div className="grid grid-cols-[260px,1fr,260px] gap-6 h-full">
              {/* Left: Lunch Routine Area */}
              <div className="h-full overflow-y-auto">
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
                />
              </div>

              {/* Center: Seat Grid with Header */}
              <div className="relative w-full h-full rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/80 p-6 sm:p-8 shadow-xl flex flex-col overflow-hidden">
                {/* Header inside SeatGrid */}
                <div className="flex-none mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Lunch <span className="text-indigo-600">Status</span>
                    </h2>
                    <div className="flex gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-gray-200 shadow-sm flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
                        <span className="text-base font-extrabold text-gray-900 leading-none">{stats.total}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-green-200 shadow-sm flex items-center gap-2">
                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Attended</span>
                        <span className="text-base font-extrabold text-green-700 leading-none">{stats.attended}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 shadow-sm flex items-center gap-2">
                        <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Seated</span>
                        <span className="text-base font-extrabold text-purple-700 leading-none">{stats.seated}</span>
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
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">미실시자만 보기</span>
                    </label>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto">
                  <SeatGrid
                    seats={filteredSeats}
                    activeMap={seatStatusMap}
                    disabledMap={seats.reduce((acc, seat) => {
                      if (seat.students && !presentStudentIds.includes(seat.students.id)) {
                        acc[seat.students.id] = true;
                      }
                      return acc;
                    }, {})}
                    onToggleAttendance={handleToggleSeat}
                    onOpenMission={setTargetStudent}
                  />
                </div>
              </div>

              {/* Right: Mission Sidebar */}
              <MissionSidebar
                missions={missions}
                students={students.filter((s) => presentStudentIds.includes(s.id))}
                studentMissionStatus={missionStatus}
                onOpenModal={setTargetStudent}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student Task Modal */}
      {targetStudent && (
        <StudentTaskModal
          isOpen={!!targetStudent}
          student={targetStudent}
          missions={missions}
          routines={routineItems}
          routineStatusTable="student_lunch_routine_status"
          routineIdField="routine_item_id"
          routineLabel={routineTitle || "점심시간 루틴"}
          showRoutines={true}
          onClose={() => setTargetStudent(null)}
          onSaved={async () => {
            await fetchMissionStatus();
            await fetchRoutineItems();
            await fetchRoutineStatus();
          }}
        />
      )}
    </>
  );
}