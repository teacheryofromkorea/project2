import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SeatShuffler() {
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(5);
  const [seats, setSeats] = useState([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // 학생 불러오기 (전체 학생)
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name")
        .order("number", { ascending: true });

      if (error) {
        console.error("학생 불러오기 실패", error);
        return;
      }

      setStudents(data ?? []);
    };

    fetchStudents();
  }, []);

  // 자리 생성
  const generateSeats = (studentList) => {
    const total = rows * cols;
    const shuffled = shuffleArray(studentList);
    const nextSeats = Array(total).fill(null);

    shuffled.forEach((student, index) => {
      if (index < total) {
        nextSeats[index] = student;
      }
    });

    setSeats(nextSeats);
  };

  return (
    <div className="w-full h-[75vh] flex gap-6 rounded-2xl bg-white/70 backdrop-blur shadow p-6">
      <div className="flex gap-6 w-full h-full">
        <div className="flex-1 flex flex-col items-center justify-start gap-6 h-full">
          {/* 칠판 영역 */}
          <div className="mx-auto mb-6 w-full max-w-2xl">
            <div
              className="
                relative
                h-20
                rounded-2xl
                bg-gradient-to-br from-emerald-900 to-emerald-800
                shadow-inner
                flex items-center justify-center
              "
            >
              {/* 분필 가루 느낌 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:18px_18px] opacity-20 rounded-2xl"></div>

              {/* 칠판 글씨 */}
              <span className="relative text-2xl font-bold text-emerald-100 tracking-widest">
                칠판
              </span>
            </div>
          </div>

          {/* 자리 격자 */}
          <div className="w-full h-full">
            <div
              className="mx-auto grid gap-4 h-full"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: rows * cols }).map((_, index) => {
                const student = seats[index];
                return (
                  <div
                    key={index}
                    className={`
                      relative
                      flex items-center justify-center
                      rounded-2xl
                      border
                      text-lg font-bold
                      transition-all duration-200
                      min-h-0 min-w-0
                      ${
                        student
                          ? "bg-[#FFF8E7] border-yellow-200 shadow-md hover:shadow-lg"
                          : "bg-white border-2 border-dashed border-gray-300 text-gray-400 shadow-sm"
                      }
                    `}
                  >
                    {/* 상단 미니 테이프 (학생 있을 때만) */}
                    {student && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-200/80 rounded-sm"></div>
                    )}

                    <span className="px-2 text-center leading-snug">
                      {student ? student.name : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-[320px] flex flex-col gap-6">
          {/* 설정 영역 */}
          <div className="bg-white/70 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-600 tracking-wide">
              좌석 설정
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">행 (앞 ↔ 뒤)</span>
                <button
                  className="px-4 py-2 rounded-xl bg-gray-200"
                  onClick={() => setRows((r) => Math.max(1, r - 1))}
                >
                  −
                </button>
                <span className="w-6 text-center font-bold">{rows}</span>
                <button
                  className="px-4 py-2 rounded-xl bg-gray-200"
                  onClick={() => setRows((r) => r + 1)}
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">열 (좌 ↔ 우)</span>
                <button
                  className="px-4 py-2 rounded-xl bg-gray-200"
                  onClick={() => setCols((c) => Math.max(1, c - 1))}
                >
                  −
                </button>
                <span className="w-6 text-center font-bold">{cols}</span>
                <button
                  className="px-4 py-2 rounded-xl bg-gray-200"
                  onClick={() => setCols((c) => c + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 실행 영역 */}
          <div className="mt-auto bg-white/70 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-600 tracking-wide">
              자리 실행
            </h3>

            <button
              className="w-full px-6 py-3 rounded-full bg-blue-500 text-white font-bold shadow"
              onClick={() => generateSeats(students)}
            >
              자리 만들기
            </button>

            <button
              className="w-full px-6 py-3 rounded-full bg-purple-500 text-white font-bold shadow"
              onClick={() => generateSeats(students)}
              disabled={seats.length === 0}
            >
              다시 섞기
            </button>

            <button
              className="w-full px-6 py-3 rounded-full bg-gray-200 text-gray-700 font-bold"
              onClick={() => setShowConfirmReset(true)}
              disabled={seats.length === 0}
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 초기화 확인 모달 */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-72 shadow-xl">
            <p className="font-semibold mb-4">자리를 모두 초기화할까요?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200"
                onClick={() => setShowConfirmReset(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
                onClick={() => {
                  setSeats([]);
                  setShowConfirmReset(false);
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}