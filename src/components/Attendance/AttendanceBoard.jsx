import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getTodayString } from "../../utils/dateUtils";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import AttendanceTaskModal from "./AttendanceTaskModal";
import SeatGrid from "./SeatGrid";
import AttendanceConfirmModal from "./AttendanceConfirmModal";
import useAttendanceRoutine from "../../hooks/Attendance/useAttendanceRoutine"; // ✅ Import Hook

function AttendanceBoard() {
  const today = getTodayString(); // 오늘 날짜 (Local Time)
  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const [students, setStudents] = useState([]);

  const [routineStatus, setRoutineStatus] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);

  const [seats, setSeats] = useState([]);

  const [confirmType, setConfirmType] = useState(null); // "present" | "cancel"
  const [pendingStudent, setPendingStudent] = useState(null);

  // ... removed getPendingTasks to save tokens, it relies on routines which we will get from hook ...
  // actually getPendingTasks is defined outside this block in replacement? No, I need to keep getPendingTasks.
  // I only want to replace the state definition and fetchRoutines function.

  // Let's use the hook
  const {
    routineItems: routines, // ✅ Hook State mapped to 'routines'
    fetchRoutineTitle: fetchRoutines // ✅ Hook Action mapped to 'fetchRoutines'
  } = useAttendanceRoutine();

  const getPendingTasks = (studentId) => {
    // ... (기존 getPendingTasks 함수는 동일)
    const activeRoutineIds = new Set(routines.map((r) => r.id));
    const activeMissionIds = new Set(missions.map((m) => m.id));

    const doneRoutineIds = new Set(
      routineStatus
        .filter(
          (row) =>
            row.student_id === studentId &&
            row.completed &&
            activeRoutineIds.has(row.routine_id)
        )
        .map((row) => row.routine_id)
    );

    const doneMissionIds = new Set(
      missionStatus
        .filter(
          (row) =>
            row.student_id === studentId &&
            row.completed &&
            activeMissionIds.has(row.mission_id)
        )
        .map((row) => row.mission_id)
    );

    const total = routines.length + missions.length;

    return Math.max(0, total - (doneRoutineIds.size + doneMissionIds.size));
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from("student_attendance_status")
      .select("*")
      .eq("date", today);
    setAttendanceStatus(data || []);
  };

  const [modalType, setModalType] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // const [routines, setRoutines] = useState([]); // Removed
  const [missions, setMissions] = useState([]);

  // fetchRoutines refactored to use Hook logic (via alias above)
  // const fetchRoutines = async () => ... (Removed manual implementation)

  const fetchMissions = async () => {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .order("order_index", { ascending: true });
    setMissions(data);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      handleSupabaseError(error, "학생 목록을 불러오지 못했어요.");
    } else {
      setStudents(data);
    }
  };

  const fetchSeats = async () => {
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

    if (error) {
      handleSupabaseError(error, "좌석 정보를 불러오지 못했어요.");
    } else {
      setSeats(data || []);
    }
  };

  const fetchStatus = async () => {
    const { data: routineData } = await supabase
      .from("student_routine_status")
      .select("*")
      .eq("date", today);

    const { data: missionData } = await supabase
      .from("student_mission_status")
      .select("*")
      .eq("date", today);

    setRoutineStatus(routineData || []);
    setMissionStatus(missionData || []);
  };

  // 최초 1회: 루틴/미션/출석/상태만 로딩
  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchRoutines(), // Now calls the hook function
        fetchMissions(),
        fetchStatus(),
        fetchAttendance(),
        fetchSeats(),
      ]);
    })();
  }, []);

  // 설정탭에서 학생 CRUD 발생 시 즉시 학생 목록 재조회
  useEffect(() => {
    const handleStudentsUpdated = () => {
      fetchStudents();
    };

    // 최초 진입 시에도 학생 목록 로딩
    fetchStudents();

    window.addEventListener("students:updated", handleStudentsUpdated);

    return () => {
      window.removeEventListener("students:updated", handleStudentsUpdated);
    };
  }, []);

  const markPresent = async (id) => {
    const today = getTodayString(); // today 변수 재정의

    const isPresent = attendanceStatus.some(
      (a) => a.student_id === id && a.present
    );

    const { error } = await supabase
      .from("student_attendance_status")
      .upsert(
        {
          student_id: id,
          date: today,
          present: !isPresent,
        },
        { onConflict: "student_id,date" }
      );

    handleSupabaseError(error, "출석 저장에 실패했어요.");
    await fetchAttendance();
    await fetchStatus();
  };


  return (
    <>
      {/* 교실 배경 컨테이너 (Full height fill) - Light Gemini Style */}
      <div className="relative w-full h-full flex flex-col bg-transparent overflow-hidden">
        {/* Decorative ambient blobs (Light Mode) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]" />
        </div>


        {/* 상단 헤더 영역 (HUD Style - Wide) */}
        <div className="relative z-10 px-4 pt-5">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">
                  Attendance
                </h1>

              </div>

              {/* 우측 상단 상태 요약 카드 (Slim Row Style) */}
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-gray-200 shadow-sm flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-base font-extrabold text-gray-900 leading-none">{students.length}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 shadow-sm flex items-center gap-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-6 h-6 bg-purple-100/40 rounded-full blur-xl -mr-2 -mt-2" />
                  <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider relative z-10">Active</span>
                  <span className="text-base font-extrabold text-purple-700 relative z-10 leading-none">
                    {attendanceStatus.filter(a => a.present).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 좌석 영역 래퍼 (Wide Layout) */}
        <div className="relative z-10 flex-1 px-4 py-4 flex flex-col justify-center items-center min-h-0">

          {/* 좌석 무대 - Frosted White Glass (Wide Expansion) */}
          <div className="relative w-full h-full rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/80 p-6 sm:p-8 shadow-xl flex flex-col justify-center transition-all duration-500 overflow-hidden">
            <div className="h-2 flex-none" />
            <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto">
              <SeatGrid
                seats={seats}
                activeMap={attendanceStatus.reduce((acc, row) => {
                  acc[row.student_id] = row.present;
                  return acc;
                }, {})}
                onToggleAttendance={(student) => {
                  const isPresent = attendanceStatus.some(
                    (a) => a.student_id === student.id && a.present
                  );

                  setPendingStudent(student);
                  setConfirmType(isPresent ? "cancel" : "present");
                }}
                onOpenMission={(student) => {
                  setSelectedStudent(student);
                  setModalType("task");
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모달 UI 부분은 동일 */}
      {/* 학생 루틴/미션 모달 */}
      <AttendanceTaskModal
        isOpen={modalType === "task"}
        onClose={() => {
          setModalType(null);
        }}
        onSaved={() => {
          fetchStatus();
          fetchAttendance();
        }}
        student={selectedStudent}
        routines={routines}
        missions={missions}
      />

      <AttendanceConfirmModal
        isOpen={!!confirmType && !!pendingStudent}
        type={confirmType}
        student={pendingStudent}
        onClose={() => {
          setConfirmType(null);
          // ⚠️ exit animation을 위해 student 데이터를 즉시 지우지 않음
        }}
        onConfirm={async () => {
          if (!pendingStudent) return;
          await markPresent(pendingStudent.id);
          setConfirmType(null);
          // 여기서도 student 유지 (다음 선택 시 덮어씌워짐)
        }}
      />
    </>
  );
}

export default AttendanceBoard;
