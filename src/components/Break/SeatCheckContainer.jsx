import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/*
  SeatCheckContainer 컴포넌트는 다음과 같은 로직으로 동작합니다:

  1) 학생 목록을 불러옵니다.
  2) 오늘 출석한 학생 목록을 가져옵니다.
  3) 현재 선택된 쉬는시간(blockId)과 무관하게,
     해당 쉬는시간에 수동으로 선택된 학생들도 포함하여 보여줍니다.
  4) 학생들의 착석 상태를 불러와 표시합니다.
  5) 학생을 성별(male/female)로 분리하여 UI에 렌더링합니다.
  6) 착석 상태 변경 시 모달을 통해 확인 후 저장합니다.

  이를 통해 출석 학생뿐 아니라, 수동으로 쉬는시간에 착석 상태가 지정된 학생도 함께 관리할 수 있습니다.
*/

export default function SeatCheckContainer({ blockId, students }) {
  // 학생별 착석 여부: { [studentId]: { seated: true/false, time: string } }
  const [seatStatus, setSeatStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // 착석/해제 모달 상태
  const [modalStudent, setModalStudent] = useState(null);
  const [modalType, setModalType] = useState(null); // "seat" or "unseat"

  // 오늘 날짜 "YYYY-MM-DD" 형식으로 만들기 (로컬 시간 기준)
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = getToday();

  // 2) 오늘자 착석 상태 불러오기
  // - blockId가 없으면(자동전환 OFF + 아직 쉬는시간 선택 전) 빈 상태맵을 반환
  const fetchSeatStatus = async (targetBlockId) => {
    if (!targetBlockId) {
      return {};
    }

    const { data, error } = await supabase
      .from("break_seat_status")
      .select("*")
      .eq("date", today)
      .eq("block_id", targetBlockId);

    if (error) {
      console.error("착석 상태 불러오기 에러:", error);
      return {};
    }

    const statusMap = {};
    (data || []).forEach((row) => {
      statusMap[row.student_id] = {
        seated: row.is_seated,
        time: row.inserted_at,
      };
    });

    return statusMap;
  };

  useEffect(() => {
    const loadSeatStatus = async () => {
      if (!blockId) {
        setSeatStatus({});
        return;
      }
      const statusMap = await fetchSeatStatus(blockId);
      setSeatStatus(statusMap);
    };
    loadSeatStatus();
  }, [blockId]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setModalStudent(null);
        setModalType(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalStudent]);

  // 4) 학생 한 명의 착석 상태 토글
  const toggleSeat = async (studentId) => {
    const current = !!seatStatus[studentId]?.seated;
    const next = !current;

    // 낙관적 업데이트 (UI 먼저 반영)
    setSeatStatus((prev) => ({
      ...prev,
      [studentId]: { seated: next, time: new Date().toISOString() },
    }));

    setIsSaving(true);

    const { error } = await supabase
      .from("break_seat_status")
      .upsert({
        student_id: studentId,
        date: today,
        block_id: blockId,
        is_seated: next,
      });

    setIsSaving(false);

    if (error) {
      console.error("착석 상태 저장 실패:", error);
      // 실패 시 UI 되돌리기
      setSeatStatus((prev) => ({
        ...prev,
        [studentId]: { seated: current, time: prev[studentId]?.time || null },
      }));
      alert("저장 중 오류가 발생했어요. 다시 시도해 주세요.");
    }
  };

  // 5) 성별별로 나누기 (male / female 기준으로 통일)
  const females = students.filter((s) => s.gender === "female");
  const males = students.filter((s) => s.gender === "male");

  if (isLoading) {
    return (
      <div className="bg-white/70 rounded-2xl shadow p-6 flex-1 flex items-center justify-center">
        <span className="text-gray-500 text-sm">데이터 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow p-6 flex-1 flex flex-col gap-4 h-full">
      {/* 상단 제목 영역 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">
          🪑 쉬는시간 착석 체크
        </h3>
        {isSaving && (
          <span className="text-xs text-gray-500">저장 중...</span>
        )}
      </div>

      {/* 학생 리스트 영역: 남자/여자 위치 변경됨 */}
      <div className="grid grid-cols-2 gap-4">

        {/* 🛑 남학생 (왼쪽으로 이동) */}
        <div>
          <h4 className="text-sm font-semibold text-blue-600 mb-2">
            남학생
          </h4>
          <div className="flex flex-wrap gap-2">
            {males.map((student) => {
              const seated = !!seatStatus[student.id]?.seated;
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    const seated = !!seatStatus[student.id]?.seated;
                    setModalStudent(student);
                    setModalType(seated ? "unseat" : "seat");
                  }}
                  disabled={isSaving}
                  className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
                    ${
                      seated
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }${isSaving ? " opacity-60 cursor-not-allowed" : ""}`}
                >
                  {student.name}
                  {seatStatus[student.id]?.time && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {seatStatus[student.id]?.seated ? "착석: " : "취소: "}
                      {new Date(seatStatus[student.id].time).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 🛑 여학생 (오른쪽으로 이동) */}
        <div>
          <h4 className="text-sm font-semibold text-pink-600 mb-2">
            여학생
          </h4>
          <div className="flex flex-wrap gap-2">
            {females.map((student) => {
              const seated = !!seatStatus[student.id]?.seated;
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    const seated = !!seatStatus[student.id]?.seated;
                    setModalStudent(student);
                    setModalType(seated ? "unseat" : "seat");
                  }}
                  disabled={isSaving}
                  className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition
                    ${
                      seated
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }${isSaving ? " opacity-60 cursor-not-allowed" : ""}`}
                >
                  {student.name}
                  {seatStatus[student.id]?.time && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {seatStatus[student.id]?.seated ? "착석: " : "취소: "}
                      {new Date(seatStatus[student.id].time).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 착석/해제 확인 모달 */}
      {modalStudent && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center z-50 transition-opacity"
          onClick={() => {
            setModalStudent(null);
            setModalType(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-[360px] border border-white/60 animate-fadeIn scale-95 animate-modalPop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-center mb-4">
              {modalType === "seat" ? (
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
                  <span className="text-3xl">✅</span>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shadow-inner">
                  <span className="text-3xl">❌</span>
                </div>
              )}
            </div>
            <h3 className="text-xl font-extrabold mb-5 text-gray-700 text-center drop-shadow-sm">
              {modalType === "seat" ? (
                <>
                  <span className="text-2xl font-black text-blue-600">{modalStudent.name}</span>
                  <span className="text-gray-700"> <br/>착석 처리할까요?</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-blue-600">{modalStudent.name}</span>
                  <span className="text-gray-700"> <br/>착석 취소할까요?</span>
                </>
              )}
            </h3>

            <div className="mt-8 flex flex-col gap-3 w-full">
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
                  await toggleSeat(modalStudent.id);
                  setModalStudent(null);
                  setModalType(null);
                }}
                className={`w-full py-3 rounded-2xl text-white shadow-md text-sm font-semibold
      ${modalType === "seat" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
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
