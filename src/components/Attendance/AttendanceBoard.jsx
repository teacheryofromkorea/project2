import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import StudentTaskModal from "./StudentTaskModal";
import SeatGrid from "./SeatGrid";
import SeatAssignModal from "./SeatAssignModal";

function AttendanceBoard() {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD)
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
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [missions, setMissions] = useState([]);

  const fetchRoutines = async () => {
    const { data } = await supabase
      .from("routines")
      .select("*")
      .order("order_index", { ascending: true });
    setRoutines(data);
  };

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

    if (error) console.error(error);
    else setStudents(data);
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
      console.error(error);
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
        fetchRoutines(),
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
  const today = new Date().toISOString().split("T")[0]; // today 변수 재정의

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

  if (error) console.error(error);
  await fetchAttendance();
  await fetchStatus();
};


  return (
    <>
    {/* 교실 배경 컨테이너 (85vh 고정 + 스크롤) */}
    <div className="relative w-full h-[85vh] overflow-y-auto bg-gradient-to-b from-[#f5f4f2] to-[#eceae6]">
      {/* subtle paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 6px)",
        }}
      />

      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-[#f5f4f2]/80 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">
            오늘의 등교
          </div>

          <div className="text-xs text-gray-500">
            {todayLabel}
          </div>
        </div>
      </div>

      {/* 칠판 영역 (헤더 아래, 좌석 위) */}
      <div className="relative z-10 px-10 pt-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#495750] shadow-sm">
          <div className="px-6 py-4 flex items-center">
<div className="flex items-center justify-center h-full w-full">
  <div className="text-sm font-extrabold text-gray-300 tracking-wide">
    칠판
  </div>
</div>

          </div>
        </div>
      </div>

      {/* 좌석 영역 래퍼 */}
      <div className="relative z-10 min-h-full px-10 pt-10 pb-16 flex justify-center items-start">

        {/* 좌석 무대 */}
        <div className="relative w-full max-w-5xl rounded-3xl bg-white/80 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-10">
          <div className="h-2" />
          <SeatGrid
            seats={seats}
            attendanceMap={attendanceStatus.reduce((acc, row) => {
              acc[row.student_id] = row.present;
              return acc;
            }, {})}
            onSeatClick={(seat) => {
              // 빈 좌석 → 자리 배정 모달
              if (!seat.students) {
                setSelectedSeat(seat);
                return;
              }

              // 학생이 앉아있는 좌석 → 기존 출석/미션 로직
              const isPresent = attendanceStatus.some(
                (a) => a.student_id === seat.students.id && a.present
              );

              setSelectedStudent(seat.students);
              setModalType(isPresent ? "task" : "confirm");
            }}
          />
        </div>

      </div>
    </div>

    {/* 모달 UI 부분은 동일 */}
          {/* 학생 루틴/미션 모달 */}
<StudentTaskModal
  isOpen={modalType === "task"}
  onClose={() => {
    setModalType(null);
  }}
  onSaved={() => {
    fetchStatus();
    fetchAttendance();
  }}
  student={selectedStudent}
  routines={routines}   // 루틴 데이터 연결
  missions={missions}   // 미션 데이터 연결
/>

{modalType === "confirm" && selectedStudent && (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={() => setModalType(null)}
  >
    <div
      className="modal-enter bg-white rounded-3xl p-8 shadow-2xl w-[420px] border border-gray-100 flex flex-col gap-6"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl">
          {attendanceStatus.some(a => a.student_id === selectedStudent.id && a.present) ? "❌" : "✅"}
        </div>

        <div className="text-xl font-bold text-gray-900">
          {attendanceStatus.some(a => a.student_id === selectedStudent.id && a.present) ? "출석 취소" : "출석 확인"}
        </div>

        <div className="text-2xl font-extrabold text-blue-600 tracking-wide">
          {selectedStudent.name}
        </div>
      </div>

      <div className="text-center text-gray-700 text-base leading-relaxed">
        {attendanceStatus.some(a => a.student_id === selectedStudent.id && a.present)
          ? "이 학생의 출석을 취소하시겠습니까?"
          : "이 학생을 출석 처리하시겠습니까?"}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => setModalType(null)}
          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full shadow-sm font-semibold transition"
        >
          아니요
        </button>

        <button
          onClick={() => {
markPresent(selectedStudent.id);
setModalType(null);
          }}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md font-semibold transition"
        >
          네, 진행할게요
        </button>
      </div>

    </div>
  </div>
)}

{selectedSeat && (
  <SeatAssignModal
    seat={selectedSeat}
    onClose={() => setSelectedSeat(null)}
    onAssigned={async () => {
      await fetchSeats();
    }}
  />
)}
    </>
  );
}

export default AttendanceBoard;
