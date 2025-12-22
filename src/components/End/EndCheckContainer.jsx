

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * EndCheckContainer
 *
 * 하교 체크 전용 컨테이너
 * - 쉬는시간 착석 체크 구조를 그대로 따르되
 * - block 개념 제거 (하루 1회 고정)
 * - student_end_check_status 테이블 사용
 *
 * 책임:
 * - 오늘 출석한 학생만 불러오기
 * - 하교 체크 상태 조회 / 토글
 *
 * ❌ 루틴 / 미션 로직 포함하지 않음
 */
export default function EndCheckContainer() {
  const today = new Date().toISOString().slice(0, 10);

  const [students, setStudents] = useState([]);
  const [checkedMap, setCheckedMap] = useState({});
  const [loading, setLoading] = useState(false);

  /* ===============================
     오늘 출석한 학생 불러오기
     =============================== */
  const fetchPresentStudents = useCallback(async () => {
    setLoading(true);

    const { data: attendanceData, error } = await supabase
      .from("student_attendance_status")
      .select(
        `
        student_id,
        present,
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

    if (!error && attendanceData) {
      const list = attendanceData
        .map((row) => row.students)
        .filter(Boolean)
        .sort((a, b) => a.number - b.number);

      setStudents(list);
    }

    setLoading(false);
  }, [today]);

  /* ===============================
     하교 체크 상태 불러오기
     =============================== */
  const fetchEndCheckStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_end_check_status")
      .select("student_id, checked")
      .eq("date", today);

    if (!error && data) {
      const map = {};
      data.forEach((row) => {
        map[row.student_id] = row.checked;
      });
      setCheckedMap(map);
    }
  }, [today]);

  /* ===============================
     하교 체크 토글
     =============================== */
  const toggleCheck = async (studentId) => {
    const current = checkedMap[studentId] || false;

    setCheckedMap((prev) => ({
      ...prev,
      [studentId]: !current,
    }));

    await supabase.from("student_end_check_status").upsert({
      student_id: studentId,
      date: today,
      checked: !current,
    });
  };

  /* ===============================
     초기 로드
     =============================== */
  useEffect(() => {
    fetchPresentStudents();
    fetchEndCheckStatus();
  }, [fetchPresentStudents, fetchEndCheckStatus]);

  /* ===============================
     렌더
     =============================== */
  return (
    <div className="end-check-container">
      <h3 className="section-title">하교 체크</h3>

      {loading && <div className="text-sm opacity-60">불러오는 중...</div>}

      <div className="grid grid-cols-2 gap-2 mt-3">
        {students.map((student) => {
          const checked = checkedMap[student.id] || false;

          return (
            <button
              key={student.id}
              onClick={() => toggleCheck(student.id)}
              className={`rounded-lg px-3 py-2 text-sm flex items-center justify-between
                transition
                ${
                  checked
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              <span>
                {student.number}. {student.name}
              </span>
              {checked && <span>✔</span>}
            </button>
          );
        })}
      </div>

      {students.length === 0 && !loading && (
        <div className="text-sm opacity-60 mt-4">
          오늘 출석한 학생이 없습니다.
        </div>
      )}
    </div>
  );
}