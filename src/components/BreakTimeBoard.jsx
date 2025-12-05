import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BreakTimeBoard() {
  const [routineItems, setRoutineItems] = useState([]);
const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
const [editRoutine, setEditRoutine] = useState(null);
const [editText, setEditText] = useState("");
  // globally fixed routine (break-time)
  const ROUTINE_ID = "e2c703b6-e823-42ce-9373-9fb12a4cdbb1";

// READ ITEMS (routine_items)
const fetchRoutineItems = async () => {
  const { data, error } = await supabase
    .from("routine_items")
    .select("*")
    .eq("routine_id", ROUTINE_ID)
    .order("order_index", { ascending: true });

  if (!error) setRoutineItems(data);
};

// READ TITLE (routine_title)
const fetchRoutineTitle = async () => {
  const { data, error } = await supabase
    .from("routine_title")
    .select("title")
    .eq("id", ROUTINE_ID)
    .single();

  if (!error) {
    setRoutineTitle(data.title);
    setTempTitle(data.title);
  }
};

  // CREATE
  const addRoutineItem = async () => {
await supabase.from("routine_items").insert({
  routine_id: ROUTINE_ID,
  content: newContent,
  order_index: routineItems.length
});
    setNewContent("");
    fetchRoutineItems()
  };

  // DELETE
  const deleteRoutineItem = async (id) => {
await supabase
  .from("routine_items")
  .delete()
  .eq("id", id);

    fetchRoutineItems()
  };

const moveRoutine = async (index, direction) => {
  const newList = [...routineItems];
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === newList.length - 1) return;

  const target = newList[index];
  const swapWith =
    direction === "up" ? newList[index - 1] : newList[index + 1];

  const tempOrder = target.order_index;
  target.order_index = swapWith.order_index;
  swapWith.order_index = tempOrder;

  await supabase
    .from("routine_items")
    .update({ order_index: target.order_index })
    .eq("id", target.id);

  await supabase
    .from("routine_items")
    .update({ order_index: swapWith.order_index })
    .eq("id", swapWith.id);

  fetchRoutineItems();
};

const updateRoutine = async () => {
  if (!editText.trim()) return;
  await supabase
    .from("routine_items")
    .update({ content: editText })
    .eq("id", editRoutine.id);

  setEditRoutine(null);
  setEditText("");
  fetchRoutineItems();
};

// AUTO FETCH
useEffect(() => {
  fetchRoutineTitle();
  fetchRoutineItems();
}, []);

  return (
    <div className="grid grid-cols-[260px,1fr,260px] gap-4 h-full">

      {/* 1. 좌측 오늘의 도전 */}
      <div className="bg-white/70 rounded-2xl shadow p-4">
        오늘의 도전 사이드바
      </div>

      {/* 중앙 (상단 + 하단) */}
      <div className="flex flex-col gap-4">

        {/* 2. 상단 쉬는시간 루틴 */}
        
<div className="bg-white/70 rounded-3xl shadow p-8 flex flex-col gap-6">
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
        <div className="bg-white/70 rounded-2xl shadow p-6 flex-1">
          착석 체크 컨테이너
        </div>
      </div>

      {/* 4. 우측 역할 사이드바 */}
      <div className="bg-white/70 rounded-2xl shadow p-4">
        우리반의 소중한 일 사이드바
      </div>

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

            {/* ADD NEW ITEM (moved below list) */}
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

<button
  onClick={async () => {

    // 루틴 제목 항상 저장
    await supabase
      .from("routine_title")
      .update({ title: tempTitle })
      .eq("id", ROUTINE_ID);

    setRoutineTitle(tempTitle);
    fetchRoutineItems();
    fetchRoutineTitle();
    setIsRoutineModalOpen(false);
  }}
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

          </div>
        </div>
      )}

    </div>
  );
}