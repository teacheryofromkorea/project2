import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// 공통 컴포넌트 (쉬는시간과 동일 레이아웃)
import TodayChallengeSidebar from "../Break/TodayChallengeSidebar";
import SeatCheckContainer from "../Break/SeatCheckContainer";
import ClassDutySidebar from "../Break/ClassDutySidebar";
import StudentTaskModal from "../Attendance/StudentTaskModal";

// 점심 전용 루틴 영역 (새로 만들 예정)
import LunchRoutineArea from "./LunchRoutineArea";
import useLunchRoutine from "../../hooks/Lunch/useLunchRoutine";

export default function LunchTimeBoard() {
  const today = new Date().toISOString().slice(0, 10);

  /* ===============================
     상태 선언
     =============================== */
  const { routineItems, routineTitle, fetchRoutineItems, fetchRoutineTitle } =
    useLunchRoutine();

  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);

  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [lunchRoutineStatus, setLunchRoutineStatus] = useState([]);

  const [targetStudent, setTargetStudent] = useState(null);

  /* ===============================
     출석한 학생만 필터링
     =============================== */
  const presentStudentIds = useMemo(
    () => attendanceStatus.map((row) => row.student_id),
    [attendanceStatus]
  );

  const presentStudents = useMemo(
    () => students.filter((s) => presentStudentIds.includes(s.id)),
    [students, presentStudentIds]
  );

  /* ===============================
     데이터 fetch
     =============================== */
  useEffect(() => {
    fetchStudents();
    fetchMissions();
    fetchAttendanceStatus();
    fetchMissionStatus();
    fetchLunchRoutineStatus();

    // ✅ 점심 루틴 제목/아이템 fetch
    fetchRoutineItems();
    fetchRoutineTitle();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .order("number");

    setStudents(data || []);
  };

  const fetchMissions = async () => {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .order("order_index");

    setMissions(data || []);
  };

  const fetchAttendanceStatus = async () => {
    const { data } = await supabase
      .from("student_attendance_status")
      .select("student_id")
      .eq("date", today)
      .eq("present", true);

    setAttendanceStatus(data || []);
  };

  const fetchMissionStatus = async () => {
    const { data } = await supabase
      .from("student_mission_status")
      .select("*")
      .eq("date", today);

    setMissionStatus(data || []);
  };

  const fetchLunchRoutineStatus = async () => {
    const { data } = await supabase
      .from("student_lunch_routine_status")
      .select("*")
      .eq("date", today);

    setLunchRoutineStatus(data || []);
  };

  /* ===============================
     렌더링
     =============================== */
  return (
    <div className="grid grid-cols-[260px,1fr,260px] gap-4">
      {/* 좌측: 오늘의 도전 */}
      <TodayChallengeSidebar
        students={presentStudents}
        missions={missions}
        studentMissionStatus={missionStatus}
        mode="lunch"
        routineItems={routineItems}
        studentBreakRoutineStatus={lunchRoutineStatus}

        /* ✅ 점심 컨텍스트 명시 */
        routineLabel={routineTitle?.title || "점심시간 루틴"}
        routineType="lunch"

        onOpenModal={setTargetStudent}
      />

{/* 중앙: 점심시간 루틴 + 착석 체크 */}
<div className="flex flex-col gap-6 w-full h-[85vh] min-h-0">
  <LunchRoutineArea
    students={presentStudents}
    onStatusChange={fetchLunchRoutineStatus}
  />

  <div className="flex-1 min-h-0 h-full">
    <SeatCheckContainer
      students={presentStudents}
      table="lunch_seat_status"
    />
  </div>
</div>

      {/* 우측: 우리반의 소중한 일 */}
      <ClassDutySidebar />

      {/* 미션 / 루틴 모달 */}
      {targetStudent && (
        <StudentTaskModal
          student={targetStudent}
          missions={missions}
          routines={routineItems}

          /* 🔑 점심시간 전용 설정 */
          routineStatusTable="student_lunch_routine_status"
          routineIdField="routine_item_id"
          routineLabel={routineTitle?.title || "점심시간 루틴"}

          showRoutines={true}
          onClose={() => setTargetStudent(null)}
        />
      )}
    </div>
  );
}