import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import StudentTaskModal from "./StudentTaskModal";

function AttendanceBoard() {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD)

  const [students, setStudents] = useState([]);

  const [routineStatus, setRoutineStatus] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);

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

  const boys = students.filter((s) => s.gender === "male");
  const girls = students.filter((s) => s.gender === "female");

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
    <div className="flex gap-6 w-full">

      {/* 🛑 남학생 박스를 먼저 배치했습니다. */}
      <div className="flex-1 bg-blue-100/60 rounded-3xl p-4 shadow">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 rounded-full bg-blue-200 text-blue-800 font-bold shadow-sm">
            👦 남학생 ({boys.length}명)
          </div>
        </div>

        <div className="space-y-2">
          {boys.map((s) => {
            const pending = getPendingTasks(s.id);
            const isPresent = attendanceStatus.some(
              (a) => a.student_id === s.id && a.present
            );

            return (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStudent(s);
                  setModalType(isPresent ? "task" : "confirm");
                }}
                className={`cursor-pointer rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition flex items-center justify-between ${
                  isPresent ? "bg-purple-200" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {s.number != null ? (
                    <span className="shrink-0 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {s.number}
                    </span>
                  ) : (
                    <span className="shrink-0 w-7" />
                  )}

                  <div className="font-semibold text-base truncate">
                    {s.name}
                  </div>
                </div>

                {isPresent ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(s);
                      setModalType("task");
                    }}
                    className="px-4 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm font-semibold shadow whitespace-nowrap"
                  >
                    미션
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(s);
                      setModalType("confirm");
                    }}
                    className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm shadow whitespace-nowrap"
                  >
                    출석
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* 🛑 여학생 박스를 두 번째로 배치했습니다. */}
      <div className="flex-1 bg-pink-100/60 rounded-3xl p-4 shadow">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 rounded-full bg-pink-200 text-pink-800 font-bold shadow-sm">
            👧 여학생 ({girls.length}명)
          </div>
        </div>

        <div className="space-y-2">
          {girls.map((s) => {
            const pending = getPendingTasks(s.id);
            const isPresent = attendanceStatus.some(
              (a) => a.student_id === s.id && a.present
            );

            return (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStudent(s);
                  setModalType(isPresent ? "task" : "confirm");
                }}
                className={`cursor-pointer rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition flex items-center justify-between ${
                  isPresent ? "bg-purple-200" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {s.number != null ? (
                    <span className="shrink-0 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {s.number}
                    </span>
                  ) : (
                    <span className="shrink-0 w-7" />
                  )}

                  <div className="font-semibold text-base truncate">
                    {s.name}
                  </div>
                </div>

                {isPresent ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(s);
                      setModalType("task");
                    }}
                    className="px-4 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm font-semibold shadow whitespace-nowrap"
                  >
                    미션
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(s);
                      setModalType("confirm");
                    }}
                    className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm shadow whitespace-nowrap"
                  >
                    출석
                  </button>
                )}
              </div>
            );
          })}
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
    </>
  );
}

export default AttendanceBoard;
