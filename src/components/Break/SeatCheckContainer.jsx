import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SeatCheckContainer() {
  // 학생 목록
  const [students, setStudents] = useState([]);
  // 학생별 착석 여부: { [studentId]: true/false }
  const [seatStatus, setSeatStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 오늘 날짜 "YYYY-MM-DD" 형식으로 만들기
  const getToday = () => new Date().toISOString().slice(0, 10);
  const today = getToday();

  // 1) 학생 목록 불러오기
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, gender")
      .order("name", { ascending: true });

    if (error) {
      console.error("학생 목록 불러오기 에러:", error);
      return;
    }

    setStudents(data || []);
  };

  // 2) 오늘자 착석 상태 불러오기
  const fetchSeatStatus = async () => {
    const { data, error } = await supabase
      .from("break_seat_status")
      .select("*")
      .eq("date", today);

    if (error) {
      console.error("착석 상태 불러오기 에러:", error);
      return;
    }

    const statusMap = {};
    (data || []).forEach((row) => {
      statusMap[row.student_id] = row.is_seated;
    });

    setSeatStatus(statusMap);
  };

  // 3) 최초 마운트 시 데이터 불러오기
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchStudents();
      await fetchSeatStatus();
      setIsLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4) 학생 한 명의 착석 상태 토글
  const toggleSeat = async (studentId) => {
    const current = !!seatStatus[studentId];
    const next = !current;

    // 낙관적 업데이트 (UI 먼저 반영)
    setSeatStatus((prev) => ({
      ...prev,
      [studentId]: next,
    }));

    setIsSaving(true);

    const { error } = await supabase
      .from("break_seat_status")
      .upsert({
        student_id: studentId,
        date: today,
        is_seated: next,
      });

    setIsSaving(false);

    if (error) {
      console.error("착석 상태 저장 실패:", error);
      // 실패 시 UI 되돌리기
      setSeatStatus((prev) => ({
        ...prev,
        [studentId]: current,
      }));
      alert("저장 중 오류가 발생했어요. 다시 시도해 주세요.");
    }
  };

  // 5) 성별별로 나누기 (원하면 나중에 레이아웃 조정 가능)
  const girls = students.filter((s) => s.gender === "F");
  const boys = students.filter((s) => s.gender === "M");

  if (isLoading) {
    return (
      <div className="bg-white/70 rounded-2xl shadow p-6 flex-1 flex items-center justify-center">
        <span className="text-gray-500 text-sm">데이터 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow p-6 flex-1 flex flex-col gap-4">
      {/* 상단 제목 영역 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">
          🪑 쉬는시간 착석 체크
        </h3>
        {isSaving && (
          <span className="text-xs text-gray-500">저장 중...</span>
        )}
      </div>

      {/* 학생 리스트 영역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 여학생 */}
        <div>
          <h4 className="text-sm font-semibold text-pink-600 mb-2">
            여학생
          </h4>
          <div className="flex flex-wrap gap-2">
            {girls.map((student) => {
              const seated = !!seatStatus[student.id];
              return (
                <button
                  key={student.id}
                  onClick={() => toggleSeat(student.id)}
                  className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
                    ${
                      seated
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {student.name}

                </button>
              );
            })}
          </div>
        </div>

        {/* 남학생 */}
        <div>
          <h4 className="text-sm font-semibold text-blue-600 mb-2">
            남학생
          </h4>
          <div className="flex flex-wrap gap-2">
            {boys.map((student) => {
              const seated = !!seatStatus[student.id];
              return (
                <button
                  key={student.id}
                  onClick={() => toggleSeat(student.id)}
                  className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
                    ${
                      seated
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {student.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}