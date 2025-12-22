

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// 공통 컴포넌트 (점심시간과 동일 레이아웃)
import TodayChallengeSidebar from "../Break/TodayChallengeSidebar";
import ClassDutySidebar from "../Break/ClassDutySidebar";
import StudentTaskModal from "../Attendance/StudentTaskModal";

// 하교 전용 컴포넌트
import EndRoutineArea from "./EndRoutineArea";
import EndCheckContainer from "./EndCheckContainer";
import useEndRoutine from "../../hooks/End/useEndRoutine";

export default function EndTimeBoard() {
  const today = new Date().toISOString().slice(0, 10);

  /* ===============================
     하교 루틴 훅
     =============================== */
  const { routineItems, routineTitle, fetchRoutineItems, fetchRoutineTitle } =
    useEndRoutine();

  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);

  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [endRoutineStatus, setEndRoutineStatus] = useState([]);

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
    fetchEndRoutineStatus();

    // 하교 루틴 제목/아이템
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

  const fetchEndRoutineStatus = async () => {
    const { data } = await supabase
      .from("student_end_routine_status")
      .select("*")
      .eq("date", today);

    setEndRoutineStatus(data || []);
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
        mode="end"
        routineItems={routineItems}
        studentBreakRoutineStatus={endRoutineStatus}
        routineLabel={routineTitle || "하교시간 루틴"}
        routineType="end"
        onOpenModal={setTargetStudent}
      />

      {/* 중앙: 하교시간 루틴 + 하교 체크 */}
      <div className="flex flex-col gap-6 w-full h-[85vh] min-h-0">
        <EndRoutineArea />

        <div className="bg-white/70 rounded-3xl shadow p-6 flex-1 min-h-0 h-full">
          <EndCheckContainer />
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
          routineStatusTable="student_end_routine_status"
          routineIdField="routine_item_id"
          routineLabel={routineTitle || "하교시간 루틴"}
          showRoutines={true}
          onClose={() => setTargetStudent(null)}
        />
      )}
    </div>
  );
}