import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

function RoutineSidebar() {
  // 🗂 루틴 목록 (DB에서 불러옴)
  const [routineItems, setRoutineItems] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("✏️ 등교시 루틴");

  // 모든 모달 상태 useState
  const [isEditing, setIsEditing] = useState(false);
  const [newRoutine, setNewRoutine] = useState("");
  const [editRoutineIndex, setEditRoutineIndex] = useState(null);
  const [editText, setEditText] = useState("");

  // 📌 Supabase에서 루틴 불러오기
useEffect(() => {
  const fetchRoutines = async () => {
    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setRoutineItems(data);

      // 🔥 DB에서 제목 가져오기
      if (data.length > 0 && data[0].routine_title) {
        setRoutineTitle(data[0].routine_title);
      }
    }
  };

  fetchRoutines();
}, []);

// ESC 닫기
// ESC 닫기
useEffect(() => {
  const handleKey = (e) => {
    if (e.key === "Escape") {

      // 🔹 작은 모달 우선 닫기
      if (editRoutineIndex !== null) {
        setEditRoutineIndex(null);
        setEditText("");
        return;
      }

      // 🔹 그 다음 큰 모달 닫기
      if (isEditing) {
        setIsEditing(false);
      }
    }
  };

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [isEditing, editRoutineIndex]);



  const addRoutine = async () => {
    if (newRoutine.trim() === "") return;

    // DB에 삽입
    const { data, error } = await supabase
      .from("routines")
      .insert({
        text: newRoutine,
        order_index: routineItems.length,
      })
      .select()
      .single();

    if (!error) {
      setRoutineItems([...routineItems, data]);
      setNewRoutine("");
    }
  };

  const deleteRoutine = async (index) => {
    const id = routineItems[index].id;

    // 1) 루틴 삭제
    await supabase.from("routines").delete().eq("id", id);

    // 2) 이 루틴에 대한 학생별 상태도 같이 삭제
    await supabase
      .from("student_routine_status")
      .delete()
      .eq("routine_id", id);

    // 3) 프런트 쪽 목록 정리 및 order_index 재정렬
    const updated = routineItems.filter((_, i) => i !== index);

    const reordered = updated.map((item, i) => ({
      ...item,
      order_index: i,
    }));
    setRoutineItems(reordered);

    for (const item of reordered) {
      await supabase
        .from("routines")
        .update({ order_index: item.order_index })
        .eq("id", item.id);
    }
  };
  const moveRoutine = async (index, direction) => {
    const newList = [...routineItems];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === newList.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // swap
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];

    // 새 index 재정렬
    const reordered = newList.map((item, i) => ({
      ...item,
      order_index: i,
    }));

    setRoutineItems(reordered);

    // DB에도 반영
    for (const item of reordered) {
      await supabase
        .from("routines")
        .update({ order_index: item.order_index })
        .eq("id", item.id);
    }
  };

  return (
    <>
      <aside className="bg-white/50 backdrop-blur rounded-3xl p-4 shadow-sm flex flex-col">
        <h2 className="text-2xl font-bold mb-4">{routineTitle}</h2>

        <ul className="space-y-2 flex-1">
          {routineItems.map((item, idx) => (
            <li key={idx}>
              <button className="w-full bg-white rounded-full px-4 py-2 text-xl font-semibold shadow-sm hover:bg-pink-50 transition">
                {idx + 1}. {item.text}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="mt-4 w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded-full"
          onClick={() => setIsEditing(true)}
        >
          ✏️ 루틴 편집
        </button>
      </aside>

      {isEditing && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditing(false);
            }
          }}
        >
          <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4">루틴 편집</h3>

            <input
              className="w-full border rounded-lg px-3 py-2 mb-3 font-semibold"
              value={routineTitle}
              onChange={(e) => setRoutineTitle(e.target.value)}
            />

            <ul className="space-y-2 mb-4">
              {routineItems.map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="flex-1">{item.text}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-500 font-bold"
                      onClick={() => moveRoutine(index, "up")}
                    >
                      ▲
                    </button>
                    <button
                      className="text-gray-500 font-bold"
                      onClick={() => moveRoutine(index, "down")}
                    >
                      ▼
                    </button>
                    <button
                      className="text-blue-500 font-semibold"
                      onClick={() => {
                        setEditRoutineIndex(index);
                        setEditText(item.text);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500 font-semibold"
                      onClick={() => deleteRoutine(index)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <input
              className="w-full border rounded-lg px-3 py-2 mb-3"
              placeholder="새 루틴 입력"
              value={newRoutine}
              onChange={(e) => setNewRoutine(e.target.value)}
            />

            <button
              className="w-full bg-green-500 text-white py-2 rounded-full mb-2 font-semibold"
              onClick={addRoutine}
            >
              추가
            </button>

<button
  className="w-full bg-gray-300 py-2 rounded-full font-semibold"
  onClick={async () => {
    // 🔥 제목 저장: 모든 루틴 row의 routine_title 업데이트
    if (routineItems.length > 0) {
      const ids = routineItems.map((item) => item.id);

      await supabase
        .from("routines")
        .update({ routine_title: routineTitle })
        .in("id", ids);
    }

    setIsEditing(false);
  }}
>
  닫기
</button>
          </div>

          {editRoutineIndex !== null && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEditRoutineIndex(null);
                  setEditText("");
                }
              }}
            >
              <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">
                <h3 className="text-lg font-bold mb-4">루틴 수정</h3>

                <input
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />

                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-full mb-2 font-semibold"
                  onClick={async () => {
                    const id = routineItems[editRoutineIndex].id;

                    await supabase.from("routines").update({ text: editText }).eq("id", id);

                    const updated = [...routineItems];
                    updated[editRoutineIndex].text = editText;

                    setRoutineItems(updated);
                    setEditRoutineIndex(null);
                    setEditText("");
                  }}
                >
                  저장
                </button>

                <button
                  className="w-full bg-gray-300 py-2 rounded-full font-semibold"
                  onClick={() => {
                    setEditRoutineIndex(null);
                    setEditText("");
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default RoutineSidebar;