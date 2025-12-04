import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import StudentTaskModal from "./StudentTaskModal";

function AttendanceBoard() {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD)

  const [students, setStudents] = useState([]);

  const [routineStatus, setRoutineStatus] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);

  const getPendingTasks = (studentId) => {
    // ✅ 지금 실제로 화면에 존재하는 루틴/미션 id만 사용
    const activeRoutineIds = new Set(routines.map((r) => r.id));
    const activeMissionIds = new Set(missions.map((m) => m.id));

    // ✅ 학생이 완료한 "존재하는" 루틴만 계산
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

    // ✅ 학생이 완료한 "존재하는" 미션만 계산
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

    // 전체 개수 = 현재 존재하는 루틴 + 미션 개수
    const total = routines.length + missions.length;

    // 완료 개수를 빼서 "남은 작업 수" 계산
    return Math.max(0, total - (doneRoutineIds.size + doneMissionIds.size));
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from("student_attendance_status")
      .select("*")
      .eq("date", today);
    setAttendanceStatus(data || []);
  };

  // 모달 상태
  const [modalType, setModalType] = useState(null);

  // 선택된 학생
  const [selectedStudent, setSelectedStudent] = useState(null);


  // -------------------------------
  // supabase 에서 routines, missions 목록 불러오기
  // -------------------------------

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
    // 오늘 완료된 루틴 조회
    const { data: routineData } = await supabase
      .from("student_routine_status")
      .select("*")
      .eq("date", today);

    // 오늘 완료된 미션 조회
    const { data: missionData } = await supabase
      .from("student_mission_status")
      .select("*")
      .eq("date", today);

    setRoutineStatus(routineData || []);
    setMissionStatus(missionData || []);
  };

useEffect(() => {
  (async () => {
    await Promise.all([
      fetchStudents(),
      fetchRoutines(),
      fetchMissions(),
      fetchStatus(),
      fetchAttendance(),
    ]);
  })();
}, []);

  // -------------------------------
  // 1) 학생 목록 불러오기
  // -------------------------------

  const girls = students.filter((s) => s.gender === "F");
  const boys = students.filter((s) => s.gender === "M");


  // -------------------------------
  // 2) 출석 버튼 (status 업데이트)
  // -------------------------------
const markPresent = async (id) => {
  const today = new Date().toISOString().split("T")[0];

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
      
      {/* 여학생 박스 */}
      <div className="flex-1 bg-pink-100/60 rounded-3xl p-4 shadow">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 rounded-full bg-pink-200 text-pink-800 font-bold shadow-sm">
            👧 여학생 ({girls.length}명)
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {girls.map((s) => {
            const pending = getPendingTasks(s.id);

            return (
<div
  key={s.id}
  onClick={() => {
    setSelectedStudent(s);
    setModalType("confirm");
  }}
  className={`cursor-pointer relative rounded-2xl p-3 shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 ${
  attendanceStatus.some(a => a.student_id === s.id && a.present) ? "bg-purple-300 animate-[pulse_0.4s_ease-in-out]" : "bg-white"
}`}
>
                {pending > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {pending}
                  </span>
                )}

                <div className="font-semibold text-base text-center whitespace-nowrap">
                  {s.name}
                </div>

                {attendanceStatus.some(a => a.student_id === s.id && a.present) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(s);   // 선택한 학생 정보 저장
                      setModalType("task");    // 모달 열기
                    }}
                    className="px-4 py-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full text-sm shadow whitespace-nowrap"
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

      {/* 남학생 박스 */}
      <div className="flex-1 bg-blue-100/60 rounded-3xl p-4 shadow">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 rounded-full bg-blue-200 text-blue-800 font-bold shadow-sm">
            👦 남학생 ({boys.length}명)
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {boys.map((s) => {
            const pending = getPendingTasks(s.id);

            return (

<div
  key={s.id}
  onClick={() => {
    setSelectedStudent(s);
    setModalType("confirm");
  }}
  className={`cursor-pointer relative rounded-2xl p-3 shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 ${
  attendanceStatus.some(a => a.student_id === s.id && a.present) ? "bg-purple-300 animate-[pulse_0.4s_ease-in-out]" : "bg-white"
}`}
>


                {pending > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {pending}
                  </span>
                )}

                <div className="font-semibold text-base text-center whitespace-nowrap">
                  {s.name}
                </div>

                {attendanceStatus.some(a => a.student_id === s.id && a.present) ? (
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

          {/* 학생 루틴/미션 모달 */}
<StudentTaskModal
  isOpen={modalType === "task"}
  onClose={() => {
    setModalType(null);
    fetchStatus();
  }}
  student={selectedStudent}
  routines={routines}   // 루틴 데이터 연결
  missions={missions}   // 미션 데이터 연결
/>



      </div>

    </div>
{modalType === "confirm" && selectedStudent && (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={() => setModalType(null)}
  >
    <div
      className="modal-enter bg-white rounded-3xl p-8 shadow-2xl w-[420px] border border-gray-100 flex flex-col gap-6"
      onClick={(e) => e.stopPropagation()}
    >

      {/* 카드 아이콘 + 헤더 */}
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

      {/* 메시지 */}
      <div className="text-center text-gray-700 text-base leading-relaxed">
        {attendanceStatus.some(a => a.student_id === selectedStudent.id && a.present)
          ? "이 학생의 출석을 취소하시겠습니까?"
          : "이 학생을 출석 처리하시겠습니까?"}
      </div>

      {/* 버튼 그룹 */}
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
