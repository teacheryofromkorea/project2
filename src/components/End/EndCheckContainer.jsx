import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/*
  EndCheckContainer
  - 쉬는시간 SeatCheckContainer와 UI/디자인 완전 동일
  - block 개념 제거 (하루 1회 하교 체크)
  - student_end_check_status 테이블 사용
*/

export default function EndCheckContainer() {
  const [students, setStudents] = useState([]);
  const [checkStatus, setCheckStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [modalType, setModalType] = useState(null); // "check" | "uncheck"

  // 오늘 날짜 YYYY-MM-DD
  const getToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const today = getToday();

  /* ===============================
     오늘 출석한 학생 불러오기
     =============================== */
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("student_attendance_status")
        .select(
          `
          student_id,
          students (
            id,
            name,
            gender,
            number
          )
        `
        )
        .eq("date", today)
        .eq("present", true);

      if (!error && data) {
        const list = data
          .map((row) => row.students)
          .filter(Boolean)
          .sort((a, b) => a.number - b.number);
        setStudents(list);
      }

      setIsLoading(false);
    };

    fetchStudents();
  }, [today]);

  /* ===============================
     오늘 하교 체크 상태
     =============================== */
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("student_end_check_status")
        .select("*")
        .eq("date", today);

      const map = {};
      (data || []).forEach((row) => {
        map[row.student_id] = {
          checked: row.checked,
          time: row.created_at,
        };
      });
      setCheckStatus(map);
    };

    fetchStatus();
  }, [today]);

  /* ===============================
     체크 토글
     =============================== */
  const toggleCheck = async (studentId) => {
    const current = !!checkStatus[studentId]?.checked;
    const next = !current;

    setCheckStatus((prev) => ({
      ...prev,
      [studentId]: { checked: next, time: new Date().toISOString() },
    }));

    setIsSaving(true);

    const { error } = await supabase.from("student_end_check_status").upsert({
      student_id: studentId,
      date: today,
      checked: next,
    });

    setIsSaving(false);

    if (error) {
      setCheckStatus((prev) => ({
        ...prev,
        [studentId]: { checked: current, time: prev[studentId]?.time },
      }));
      alert("저장 중 오류가 발생했어요.");
    }
  };

  const males = students.filter((s) => s.gender === "male");
  const females = students.filter((s) => s.gender === "female");

  if (isLoading) {
    return (
      <div className="bg-white/70 rounded-2xl shadow p-6 flex-1 flex items-center justify-center">
        <span className="text-gray-500 text-sm">데이터 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow p-6 flex-1 flex flex-col gap-4 h-full">
      {/* 상단 제목 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">
          🚪 하교 체크
        </h3>
        {isSaving && (
          <span className="text-xs text-gray-500">저장 중...</span>
        )}
      </div>

      {/* 학생 리스트 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 남학생 */}
        <div>
          <h4 className="text-sm font-semibold text-blue-600 mb-2">
            남학생
          </h4>
          <div className="flex flex-wrap gap-2">
            {males.map((student) => {
              const checked = !!checkStatus[student.id]?.checked;
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setModalStudent(student);
                    setModalType(checked ? "uncheck" : "check");
                  }}
                  disabled={isSaving}
                  className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
                    ${
                      checked
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }${isSaving ? " opacity-60 cursor-not-allowed" : ""}`}
                >
                  {student.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 여학생 */}
        <div>
          <h4 className="text-sm font-semibold text-pink-600 mb-2">
            여학생
          </h4>
          <div className="flex flex-wrap gap-2">
            {females.map((student) => {
              const checked = !!checkStatus[student.id]?.checked;
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setModalStudent(student);
                    setModalType(checked ? "uncheck" : "check");
                  }}
                  disabled={isSaving}
                  className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
                    ${
                      checked
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }${isSaving ? " opacity-60 cursor-not-allowed" : ""}`}
                >
                  {student.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {modalStudent && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center z-50"
          onClick={() => {
            setModalStudent(null);
            setModalType(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-[360px] border border-white/60"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-extrabold mb-6 text-gray-700 text-center">
              {modalStudent.name} 하교 {modalType === "check" ? "확인" : "취소"}할까요?
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setModalStudent(null);
                  setModalType(null);
                }}
                className="w-full py-3 rounded-2xl bg-white/70 hover:bg-white text-gray-700 border border-gray-200 shadow-sm text-sm font-semibold"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  await toggleCheck(modalStudent.id);
                  setModalStudent(null);
                  setModalType(null);
                }}
                className={`w-full py-3 rounded-2xl text-white shadow-md text-sm font-semibold
                  ${
                    modalType === "check"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
