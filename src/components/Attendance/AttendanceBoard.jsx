import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getTodayString } from "../../utils/dateUtils";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import AttendanceTaskModal from "./AttendanceTaskModal";
import SeatGrid from "./SeatGrid";
import AttendanceConfirmModal from "./AttendanceConfirmModal";
import UncheckedStudentsModal from "./UncheckedStudentsModal"; // ✅ Import new modal
import useAttendanceRoutine from "../../hooks/Attendance/useAttendanceRoutine";

import LiveClock from "../common/LiveClock"; // ✅ Import shared component

function AttendanceBoard() {
  const today = getTodayString(); // 오늘 날짜 (Local Time)
  // todayLabel removed as it's now handled by LiveClock
  // ... rest of component


  const [students, setStudents] = useState([]);

  const [routineStatus, setRoutineStatus] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState([]);

  const [seats, setSeats] = useState([]);

  const [confirmType, setConfirmType] = useState(null); // "present" | "cancel"
  const [pendingStudent, setPendingStudent] = useState(null);

  // Let's use the hook
  const {
    routineItems: routines, // ✅ Hook State mapped to 'routines'
    routineTitle, // ✅ Get routineTitle from hook
    fetchRoutineTitle: fetchRoutines // ✅ Hook Action mapped to 'fetchRoutines'
  } = useAttendanceRoutine();

  // const routines = []; // removed
  // const fetchRoutines = ... // removed

  const [modalType, setModalType] = useState(null); // "task" | "unchecked"
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalTargetStudents, setModalTargetStudents] = useState([]); // ✅ 모달에 전달할 대상 학생들
  const [modalConfig, setModalConfig] = useState({ title: null, description: null }); // ✅ 모달 텍스트 설정
  // const [routines, setRoutines] = useState([]); // Removed
  const [missions, setMissions] = useState([]);

  // ✅ 진행률 계산 (Progress Calculation)
  const progressMap = useMemo(() => {
    const map = {};
    if (!routines || !missions) return map;

    // Total items count (Routine + Mission)
    // Note: We count *active* routines and missions.
    const totalCount = routines.length + missions.length;

    // Initialize for known students
    students.forEach((s) => {
      map[s.id] = { completed: 0, total: totalCount };
    });

    // 1. Routine Completion
    // routineStatus contains rows for all students: { student_id, routine_id, completed }
    // We only count if routine_id is in current 'routines' list (active routines)
    const activeRoutineIds = new Set(routines.map((r) => r.id));
    routineStatus.forEach((row) => {
      if (row.completed && activeRoutineIds.has(row.routine_id)) {
        if (!map[row.student_id]) {
          // 혹시 students 목록 로딩 전이라도 처리
          map[row.student_id] = { completed: 0, total: totalCount };
        }
        map[row.student_id].completed += 1;
      }
    });

    // 2. Mission Completion
    const activeMissionIds = new Set(missions.map((m) => m.id));
    missionStatus.forEach((row) => {
      if (row.completed && activeMissionIds.has(row.mission_id)) {
        if (!map[row.student_id]) {
          map[row.student_id] = { completed: 0, total: totalCount };
        }
        map[row.student_id].completed += 1;
      }
    });

    return map;
  }, [routines, missions, routineStatus, missionStatus, students]);

  // 미체크 학생 목록 계산
  const uncheckedStudents = students.filter(student => {
    const statusRow = attendanceStatus.find(a => a.student_id === student.id);
    // status가 없거나 'unchecked'이면 미체크로 간주
    return !statusRow || !statusRow.status || statusRow.status === 'unchecked';
  });

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

  // 🔄 Listen for global updates (Sidebar changes)
  useEffect(() => {
    const handleRoutinesUpdated = () => {
      fetchRoutines();
    };
    const handleMissionsUpdated = () => {
      fetchMissions();
    };

    window.addEventListener("routines:updated", handleRoutinesUpdated);
    window.addEventListener("missions:updated", handleMissionsUpdated);

    return () => {
      window.removeEventListener("routines:updated", handleRoutinesUpdated);
      window.removeEventListener("missions:updated", handleMissionsUpdated);
    };
  }, [fetchRoutines]); // fetchMissions is defined inside component but usually stable if not using callbacks? Wait, fetchMissions is defined inside using standard function, checking deps.


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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const currentStatusRow = attendanceStatus.find(
      (a) => a.student_id === id
    );
    // 현재 'present' 상태인지 확인 (status 컬럼 우선 사용)
    const isPresent = currentStatusRow?.status === 'present' || currentStatusRow?.present === true;

    // Toggle 로직: Present면 Unchecked로, 아니면 Present로
    const newStatus = isPresent ? 'unchecked' : 'present';

    const { error } = await supabase
      .from("student_attendance_status")
      .upsert(
        {
          student_id: id,
          date: today,
          present: newStatus === 'present', // 호환성 유지
          status: newStatus, // 새로운 상태 컬럼
        },
        { onConflict: "student_id,date" }
      );

    handleSupabaseError(error, "출석 저장에 실패했어요.");
    await fetchAttendance();
    await fetchStatus();
  };


  // 기타 상태 학생 (출석도 아니고 미체크도 아닌 학생)
  const otherStudents = students.filter(student => {
    const statusRow = attendanceStatus.find(a => a.student_id === student.id);
    if (!statusRow) return false;
    const isPresent = statusRow.present || statusRow.status === 'present';
    const isUnchecked = !statusRow.status || statusRow.status === 'unchecked';
    return !isPresent && !isUnchecked;
  });

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* ... (background) ... */}
      <div className="absolute inset-0 flex flex-col bg-transparent overflow-hidden">
        {/* ... (blobs) ... */}
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]" />
      </div>

      {/* 상단 헤더 영역 */}
      <div className="relative z-10 px-4 pt-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div>
              <LiveClock />
            </div>

            {/* 우측 상단 상태 요약 카드 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const enrichedStudents = students.map(s => {
                    const statusRow = attendanceStatus.find(a => a.student_id === s.id);
                    return { ...s, status: statusRow?.status || (statusRow?.present ? 'present' : 'unchecked') };
                  });
                  setModalTargetStudents(enrichedStudents);
                  setModalConfig({
                    title: "👨‍🎓 전체 학생 목록",
                    description: "전체 학생의 출결 상태를 확인하고 수정할 수 있습니다."
                  });
                  setModalType("unchecked");
                }}
                className="px-3 py-1.5 rounded-xl bg-white/95 border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">전체</span>
                <span className="text-base font-extrabold text-gray-900 leading-none">{students.length}</span>
              </button>

              <button
                onClick={() => {
                  const presentStudents = students.filter(s => {
                    const statusRow = attendanceStatus.find(a => a.student_id === s.id);
                    return statusRow?.status === 'present' || statusRow?.present === true;
                  });
                  // Enrich (they are all present)
                  const enrichedPresentStudents = presentStudents.map(s => ({ ...s, status: 'present' }));

                  setModalTargetStudents(enrichedPresentStudents);
                  setModalConfig({
                    title: "✅ 출석 학생",
                    description: "현재 출석으로 처리된 학생 목록입니다."
                  });
                  setModalType("unchecked");
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 shadow-sm flex items-center gap-2 relative overflow-hidden hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-6 h-6 bg-purple-100/40 rounded-full blur-xl -mr-2 -mt-2" />
                <span className="text-[13px] text-purple-700 font-bold uppercase tracking-wider relative z-10">출석</span>
                <span className="text-base font-extrabold text-purple-700 relative z-10 leading-none">
                  {attendanceStatus.filter(a => a.present || a.status === 'present').length}
                </span>
              </button>

              {/* ✅ 기타 상태 (Other) Button */}
              {otherStudents.length > 0 && (
                <button
                  onClick={() => {
                    // Enrich students with status
                    const enrichedOtherStudents = otherStudents.map(s => {
                      const statusRow = attendanceStatus.find(a => a.student_id === s.id);
                      return { ...s, status: statusRow?.status || 'unchecked' };
                    });

                    setModalTargetStudents(enrichedOtherStudents);
                    setModalConfig({
                      title: "📋 기타 출결 학생",
                      description: "질병, 인정, 미인정 등 기타 출결 상태 학생 목록입니다."
                    });
                    setModalType("unchecked");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex items-center gap-2 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span className="text-[13px] text-blue-600 font-bold uppercase tracking-wider">기타</span>
                  <span className="text-base font-extrabold text-blue-600 leading-none">
                    {otherStudents.length}
                  </span>
                </button>
              )}

              {uncheckedStudents.length > 0 ? (
                <button
                  onClick={() => {
                    setModalTargetStudents(uncheckedStudents);
                    setModalConfig({
                      title: "⚠️ 미체크 학생 관리",
                      description: null // Default logic usage
                    });
                    setModalType("unchecked");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-500 border border-red-600 shadow-sm flex items-center gap-2 hover:bg-red-600 transition-colors animate-pulse"
                >
                  <span className="text-[13px] text-white font-bold uppercase tracking-wider">미체크</span>
                  <span className="text-base font-extrabold text-white leading-none">
                    {uncheckedStudents.length}
                  </span>
                </button>
              ) : (
                // ... (All Clear UI) ...
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-200 shadow-sm flex items-center gap-2">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">All Clear</span>
                  <span className="text-base font-extrabold text-emerald-700 leading-none">✓</span>
                </div>
              )}

              {/* ... (Total/Active stats) ... */}
              {/* Removed Total/Active per user previous edit */}
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
              progressMap={progressMap} // ✅ Pass progress map
              statusMap={attendanceStatus.reduce((acc, row) => {
                acc[row.student_id] = row.status || (row.present ? 'present' : 'unchecked');
                return acc;
              }, {})}
              onToggleAttendance={(student) => {
                const current = attendanceStatus.find(a => a.student_id === student.id);
                const isPresent = current?.status === 'present' || current?.present === true;
                const isUnchecked = !current || current.status === 'unchecked';

                // 상세 상태인 경우 (present도 아니고 unchecked도 아님) -> 모달 열기
                if (!isPresent && !isUnchecked) {
                  // Enrich student with current detail status
                  setModalTargetStudents([{
                    ...student,
                    status: current.status // Pass current detailed status
                  }]);
                  setModalConfig({
                    title: "출결 상태 변경",
                    description: `${student.name} 학생의 출결 상태를 수정합니다.`
                  });
                  setModalType("unchecked");
                  return;
                }

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
        routineTitle={routineTitle} // ✅ Pass dynamic title
      />

      {/* 미체크 학생 관리 모달 (재사용: 미체크 목록 또는 특정 학생 상태 변경) */}
      <UncheckedStudentsModal
        isOpen={modalType === "unchecked"}
        onClose={() => setModalType(null)}
        uncheckedStudents={modalTargetStudents.length > 0 ? modalTargetStudents : uncheckedStudents}
        title={modalConfig.title}
        description={modalConfig.description}
        onSaved={() => {
          fetchStatus();
          fetchAttendance(); // 데이터 새로고침
        }}
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
    </div >
  );
}

export default AttendanceBoard;
