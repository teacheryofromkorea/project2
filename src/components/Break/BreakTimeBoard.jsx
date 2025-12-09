import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import TodayChallengeSidebar from "./TodayChallengeSidebar";
import SeatCheckContainer from "./SeatCheckContainer";
import ClassDutySidebar from "./ClassDutySidebar";
import StudentTaskModal from "../Attendance/StudentTaskModal";

export default function BreakTimeBoard() {
  const [routineItems, setRoutineItems] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editRoutine, setEditRoutine] = useState(null);
  const [editText, setEditText] = useState("");

  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState([]);
  const [routineStatus, setRoutineStatus] = useState([]);

  const [targetStudent, setTargetStudent] = useState(null);

  const ROUTINE_ID = "e2c703b6-e823-42ce-9373-9fb12a4cdbb1";
  
  // useMemo를 사용하여 오늘 날짜를 한 번만 계산
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // READ ITEMS (routine_items) - useCallback 적용
  const fetchRoutineItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("routine_items")
      .select("*")
      .eq("routine_id", ROUTINE_ID)
      .order("order_index", { ascending: true });

    if (!error) setRoutineItems(data || []);
  }, []);

  // READ TITLE (routine_title) - useCallback 적용
  const fetchRoutineTitle = useCallback(async () => {
    const { data, error } = await supabase
      .from("routine_title")
      .select("title")
      .eq("id", ROUTINE_ID)
      .single();

    if (!error && data) {
      setRoutineTitle(data.title);
      setTempTitle(data.title);
    }
  }, []);

  // CREATE - useCallback 적용
  const addRoutineItem = useCallback(async () => {
    await supabase.from("routine_items").insert({
      routine_id: ROUTINE_ID,
      content: newContent,
      order_index: routineItems.length
    });
    setNewContent("");
    fetchRoutineItems(); // 데이터 갱신
  }, [newContent, routineItems.length, fetchRoutineItems]);

  // DELETE - useCallback 적용
  const deleteRoutineItem = useCallback(async (id) => {
    await supabase.from("routine_items").delete().eq("id", id);
    fetchRoutineItems(); // 데이터 갱신
  }, [fetchRoutineItems]);

  // MOVE - useCallback 적용
  const moveRoutine = useCallback(async (index, direction) => {
    const newList = [...routineItems];
    if ((direction === "up" && index === 0) || (direction === "down" && index === newList.length - 1)) return;

    const target = newList[index];
    const swapWith = direction === "up" ? newList[index - 1] : newList[index + 1];

    // 트랜잭션 없이 순차적 업데이트 수행 (안전한 기존 방식 유지)
    await supabase
      .from("routine_items")
      .update({ order_index: swapWith.order_index }) // 순서를 맞바꿈
      .eq("id", target.id);

    await supabase
      .from("routine_items")
      .update({ order_index: target.order_index }) // 순서를 맞바꿈
      .eq("id", swapWith.id);

    fetchRoutineItems(); // 데이터 갱신
  }, [routineItems, fetchRoutineItems]);

  // UPDATE - useCallback 적용
  const updateRoutine = useCallback(async () => {
    if (!editText.trim() || !editRoutine) return;
    await supabase
      .from("routine_items")
      .update({ content: editText })
      .eq("id", editRoutine.id);

    setEditRoutine(null);
    setEditText("");
    fetchRoutineItems(); // 데이터 갱신
  }, [editText, editRoutine, fetchRoutineItems]);

  // 🟦 학생 목록 - useCallback 적용
  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, gender")
      .order("name", { ascending: true });

    if (!error) setStudents(data || []);
  }, []);

  // 🟦 오늘 미션 목록 - useCallback 적용
  const fetchMissions = useCallback(async () => {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error) setMissions(data || []);
  }, []);

  // 🟦 오늘 미션 상태 - useCallback 적용
  const fetchMissionStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_mission_status")
      .select("*")
      .eq("date", today);

    if (!error) setMissionStatus(data || []);
  }, [today]);

  const fetchRoutineStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_break_routine_status")
      .select("*")
      .eq("date", today);

    if (!error) setRoutineStatus(data || []);
  }, [today]);

  // AUTO FETCH - 의존성 배열에 useCallback 함수 포함
  useEffect(() => {
    (async ()=> {
      await Promise.all([
        fetchRoutineTitle(),
        fetchRoutineItems(),
        fetchStudents(),
        fetchMissions(),
        fetchMissionStatus(),
        fetchRoutineStatus(),
      ]);
    })();
  }, [fetchRoutineTitle, fetchRoutineItems, fetchStudents, fetchMissions, fetchMissionStatus, fetchRoutineStatus]);

  // 루틴 제목 저장 핸들러
  const handleSaveRoutineTitleAndClose = async () => {
    await supabase
      .from("routine_title")
      .update({ title: tempTitle })
      .eq("id", ROUTINE_ID);

    setRoutineTitle(tempTitle);
    fetchRoutineTitle(); // 갱신된 제목 다시 불러오기
    setIsRoutineModalOpen(false);
  };


  return (
    <div className="grid grid-cols-[260px,1fr,260px] gap-4 h-full">

      {/* 1. 좌측 오늘의 도전 */}
      <TodayChallengeSidebar
        students={students}
        missions={missions}
        studentMissionStatus={missionStatus}
        routineItems={routineItems}
        studentBreakRoutineStatus={routineStatus}
        onOpenModal={setTargetStudent}
        onSaved={async () => {
          await fetchMissionStatus();
          await fetchRoutineStatus();
        }}
      />

      {/* 중앙 (상단 + 하단) */}
      <div className="flex flex-col gap-4">

        {/* 2. 상단 쉬는시간 루틴 */}
        <div className="bg-white/70 rounded-3xl shadow p-8 flex flex-col gap-6">
          {/* ... (UI 동일) ... */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 flex items-center gap-2">
              📝 {routineTitle}
            </h2>
            <button
              onClick={() => {
                setTempTitle(routineTitle);
                setNewContent("");
                setIsRoutineModalOpen(true);
              }}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow text-sm font-semibold"
            >
              ✏️ 루틴 편집
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-lg font-semibold text-gray-900">
            {routineItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-800 break-words max-w-[260px]">
                  {item.content}
                </span>
                {index < routineItems.length - 1 && (
                  <span className="text-gray-400 text-2xl font-light">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. 하단 착석 체크 */}
        <SeatCheckContainer />
      </div>

      {/* 4. 우측 역할 사이드바 */}
      <ClassDutySidebar />

      {/* ----------------------------------------
        루틴 편집 모달 (Inline)
      ---------------------------------------- */}
      {isRoutineModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setIsRoutineModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">쉬는시간 루틴 편집</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              루틴 제목
            </label>
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* LIST ITEMS */}
            <ul className="max-h-48 overflow-y-auto mb-6 space-y-2">
              {routineItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="flex-1">{item.content}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveRoutine(index, "up")}
                      className="text-gray-500 font-bold"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveRoutine(index, "down")}
                      className="text-gray-500 font-bold"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => {
                        setEditRoutine(item);
                        setEditText(item.content);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteRoutineItem(item.id)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* ADD NEW ITEM */}
            <label className="block text-sm font-medium text-gray-700 mb-2">새 루틴 항목</label>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addRoutineItem}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                추가
              </button>
            </div>

            {/* 저장/닫기 버튼 그룹 */}
            <div>
              <button
                onClick={handleSaveRoutineTitleAndClose} // 핸들러 함수 호출로 변경
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 mr-2"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setTempTitle(routineTitle);
                  setNewContent("");
                  setIsRoutineModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------
        항목 수정 모달 (Inline)
      ---------------------------------------- */}
      {editRoutine && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[300px]">
            <h3 className="text-lg font-bold mb-4">루틴 수정</h3>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={updateRoutine}
              className="w-full bg-blue-600 text-white rounded-full py-2 mb-2 font-semibold"
            >
              저장
            </button>
            <button
              onClick={() => {
                setEditRoutine(null);
                setEditText("");
              }}
              className="w-full bg-gray-300 rounded-full py-2 font-semibold"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------
        학생 작업 모달 (StudentTaskModal 컴포넌트 활용)
      ---------------------------------------- */}
      {targetStudent && (
        <StudentTaskModal
          isOpen={!!targetStudent}
          student={targetStudent}
          missions={missions}
          routines={routineItems}
          routineStatusTable="student_break_routine_status"
          showRoutines={true}
          onClose={() => setTargetStudent(null)}
          onSaved={async () => {
            await fetchMissionStatus();
            await fetchRoutineItems();
            await fetchRoutineStatus();
          }}
        />
      )}
    </div>
  );
}
