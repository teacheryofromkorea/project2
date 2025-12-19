import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const STORAGE_KEY = "seatShuffler_seats_v1";
const LAYOUTS_KEY = "seatShuffler_layouts_v1";

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
  const [selectSeatIndex, setSelectSeatIndex] = useState(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const [savedLayouts, setSavedLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState("");

  // 👇 토스트 상태 추가
  const [showSeatGuideToast, setShowSeatGuideToast] = useState(true);

  // 학생 불러오기 (전체 학생)
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, number, gender")
        .order("number", { ascending: true });

      if (error) {
        console.error("학생 불러오기 실패", error);
        return;
      }

      setStudents(data ?? []);
    };

    fetchStudents();
  }, []);

  // localStorage에서 좌석 복원
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSeats(parsed);
        }
      } catch (e) {
        console.warn("좌석 localStorage 복원 실패", e);
      }
    }

    setIsStorageLoaded(true);
  }, []);

  // 저장된 레이아웃 목록 로드
  useEffect(() => {
    const raw = localStorage.getItem(LAYOUTS_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedLayouts(parsed);
      }
    } catch (e) {
      console.warn("레이아웃 목록 로드 실패", e);
    }
  }, []);

  // 자리 생성
  const generateSeats = (studentList) => {
    const total = rows * cols;

    // 1. 이미 사전 지정된 좌석 수집
    const presetMap = {};
    seats.forEach((seat, index) => {
      if (seat && !seat.__auto) {
        presetMap[index] = seat;
      }
    });

    // 2. 이미 지정된 학생 id 목록
    const presetStudentIds = Object.values(presetMap).map(
      (s) => s.id
    );

    // 3. 자동 배치 대상 학생 (사전 지정 제외)
    const candidates = studentList.filter(
      (s) => !presetStudentIds.includes(s.id)
    );

    const shuffled = shuffleArray(candidates);

    // 4. 새 좌석 배열 생성
    const nextSeats = Array(total).fill(null);

    // 5. 사전 지정 좌석 유지
    Object.entries(presetMap).forEach(([index, student]) => {
      nextSeats[index] = student;
    });

    // 6. 빈 좌석에만 랜덤 배치
    let ptr = 0;
    for (let i = 0; i < total; i++) {
      if (!nextSeats[i] && ptr < shuffled.length) {
        nextSeats[i] = {
          ...shuffled[ptr++],
          __auto: true,
        };
      }
    }

    setSeats(nextSeats);
  };

  // seats 변경 시 localStorage 저장
  useEffect(() => {
    if (!isStorageLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
  }, [seats, isStorageLoaded]);

  const saveCurrentLayout = () => {
    const name = prompt("이 자리 배치의 이름을 입력하세요");
    if (!name) return;

    const existingIndex = savedLayouts.findIndex(
      (l) => l.name === name
    );

    let nextLayouts;

    if (existingIndex !== -1) {
      const ok = window.confirm(
        `"${name}" 배치가 이미 있습니다. 덮어쓸까요?`
      );
      if (!ok) return;

      nextLayouts = [...savedLayouts];
      nextLayouts[existingIndex] = {
        name,
        seats,
        rows,
        cols,
        savedAt: Date.now(),
      };
    } else {
      nextLayouts = [
        ...savedLayouts,
        {
          name,
          seats,
          rows,
          cols,
          savedAt: Date.now(),
        },
      ];
    }

    setSavedLayouts(nextLayouts);
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(nextLayouts));
  };

  const loadLayout = (name) => {
    const layout = savedLayouts.find((l) => l.name === name);
    if (!layout) return;

    setRows(layout.rows);
    setCols(layout.cols);
    setSeats(layout.seats);
  };

  // 👇 3초 후 토스트 자동 사라짐
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSeatGuideToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-[75vh] flex gap-6 rounded-2xl bg-white/70 backdrop-blur shadow p-6">
{/* 👇 화면 정중앙 토스트 안내 */}
{showSeatGuideToast && (
  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
    <div className="px-6 py-3 rounded-full bg-black/80 text-white text-sm font-semibold shadow-lg whitespace-nowrap">
      💡 빈 자리를 클릭하면 특정 학생을 고정할 수 있어요
    </div>
  </div>
)}

      <div className="flex gap-6 w-full h-full">
        <div className="flex-1 flex flex-col items-center justify-start gap-6 h-full">
          {/* 칠판 영역 */}
          <div className="mx-auto mb-3 w-full max-w-2xl">
            <div
              className="
                relative
                h-10
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
                const seat = seats[index];
                const student = seat;
                const isAuto = seat?.__auto;
                const isPreset = seat && !seat.__auto;
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
                          ? isPreset
                            ? "bg-[#E6F4EA] border-2 border-emerald-400 shadow-md"
                            : "bg-[#FFF8E7] border-yellow-200 shadow-md hover:shadow-lg"
                          : "bg-white border-2 border-dashed border-gray-300 text-gray-400 shadow-sm"
                      }
                    `}
                    onClick={() => {
                      // 1) 빈 자리 → 학생 선택 모달
                      if (!student) {
                        setSelectSeatIndex(index);
                        return;
                      }

                      // 2) 학생이 이미 있는 자리 → 사전 지정 해제
                      const next = [...seats];
                      next[index] = null;
                      setSeats(next);
                    }}
                  >
                    {/* 상단 미니 테이프 (학생 있을 때만) */}
                    {student && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-200/80 rounded-sm"></div>
                    )}

                    {student && (
                      <span className="absolute top-1 left-2 text-xs font-bold text-gray-600">
                        {student.number}
                      </span>
                    )}

                    <span className="px-2 text-center leading-snug">
                      {student ? student.name : ""}
                    </span>

                    {student && (
                      <span className="absolute top-1 right-2 text-xs">
                        {student.gender === "male" ? "🔵" : student.gender === "female" ? "🔴" : ""}
                      </span>
                    )}

                    {isPreset && (
                      <span className="absolute bottom-1 right-1 text-xs">
                        📌
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-[320px] flex flex-col gap-6 h-full overflow-y-auto">
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
          <div className="bg-white/70 rounded-2xl shadow-sm flex flex-col flex-shrink-0">
            <div className="p-3 flex flex-col gap-3 overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-600 tracking-wide">
                자리 실행
              </h3>

<div className="flex gap-2 w-full"> 
  <button
    className="flex-1 px-6 py-3 rounded-full bg-blue-500 text-white font-bold shadow"
    onClick={() => generateSeats(students)}
  >
    자리 만들기
  </button>

  <button
    className="flex-1 px-6 py-3 rounded-full bg-purple-500 text-white font-bold shadow"
    onClick={() => generateSeats(students)}
    disabled={seats.length === 0}
  >
    다시 섞기
  </button>
</div>


              <button
                className="w-full px-6 py-3 rounded-full bg-gray-200 text-gray-700 font-bold"
                onClick={() => setShowConfirmReset(true)}
                disabled={seats.length === 0}
              >
                초기화
              </button>

              <div className="mt-4 border-t pt-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-500">저장된 자리 배치</h4>

                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={selectedLayout}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedLayout(value);
                    if (value) {
                      loadLayout(value);
                    }
                  }}
                >
                  <option value="">선택하세요</option>
                  {savedLayouts.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>

                                <button
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 font-semibold"
                  onClick={saveCurrentLayout}
                  disabled={seats.length === 0}
                >
                  현재 배치 저장
                </button>

                <button
                  className="w-full px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold"
                  disabled={!selectedLayout}
                  onClick={() => {
                    const ok = window.confirm(
                      `"${selectedLayout}" 배치를 삭제할까요?`
                    );
                    if (!ok) return;

                    const next = savedLayouts.filter(
                      (l) => l.name !== selectedLayout
                    );

                    setSavedLayouts(next);
                    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(next));
                    setSelectedLayout("");
                  }}
                >
                  선택된 배치 삭제
                </button>

              </div>
            </div>
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
                  localStorage.removeItem(STORAGE_KEY);
                  setShowConfirmReset(false);
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {selectSeatIndex !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="font-bold mb-3">이 자리에 배치할 학생</h3>

            <ul className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {students
                .filter(
                  (s) => !seats.some((seat) => seat?.id === s.id)
                )
                .map((s) => (
                  <li key={s.id}>
                    <button
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-left font-semibold"
                      onClick={() => {
                        const next = [...seats];
                        next[selectSeatIndex] = s; // 👈 사전 지정
                        setSeats(next);
                        setSelectSeatIndex(null);
                      }}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
            </ul>

            <button
              className="w-full py-2 rounded-xl bg-gray-300 font-semibold"
              onClick={() => setSelectSeatIndex(null)}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}  
