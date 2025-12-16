import { useEffect, useState } from "react";
import useLunchRoutine from "../../hooks/Lunch/useLunchRoutine";

export default function LunchRoutineArea() {
  const {
    routineItems,
    routineTitle,
    tempTitle,
    setTempTitle,
    newContent,
    setNewContent,
    editRoutine,
    setEditRoutine,
    editText,
    setEditText,

    fetchRoutineItems,
    fetchRoutineTitle,
    addRoutineItem,
    deleteRoutineItem,
    moveRoutine,
    updateRoutine,
    saveRoutineTitle,
  } = useLunchRoutine();

  const [isEditing, setIsEditing] = useState(false);

  /* ===============================
     최초 로딩
     =============================== */
  useEffect(() => {
    fetchRoutineTitle();
    fetchRoutineItems();
  }, [fetchRoutineTitle, fetchRoutineItems]);

  /* ===============================
     렌더링
     =============================== */
  return (
    <div
className="bg-white/70 rounded-3xl shadow p-8 flex flex-col gap-6 cursor-pointer w-full"

      onClick={() => setIsEditing(true)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          🍱 {routineTitle || "점심시간 루틴"}
        </h2>
      </div>

      {/* 루틴 흐름 표시 */}
      <div className="flex flex-wrap items-center gap-4 text-lg font-semibold">
        {routineItems.length === 0 ? (
          <span className="text-gray-400">
            아직 점심시간 루틴이 없습니다. 클릭해서 추가해보세요.
          </span>
        ) : (
          routineItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-blue-300 text-blue-600 font-bold">
                {index + 1}
              </span>
              <span>{item.content}</span>
              {index < routineItems.length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* 편집 영역 */}
      {isEditing && (
        <div
          className="mt-4 bg-white rounded-2xl p-6 shadow-inner flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 제목 수정 */}
          <input
            className="text-xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={saveRoutineTitle}
          />

          {/* 루틴 리스트 */}
          <div className="flex flex-col gap-3">
            {routineItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-gray-400">
                    {index + 1}.
                  </span>

                  {editRoutine?.id === item.id ? (
                    <input
                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateRoutine();
                        if (e.key === "Escape") {
                          setEditRoutine(null);
                          setEditText("");
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="flex-1 cursor-text"
                      onClick={() => {
                        setEditRoutine(item);
                        setEditText(item.content);
                      }}
                    >
                      {item.content}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => moveRoutine(index, "up")}
                  >
                    ▲
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => moveRoutine(index, "down")}
                  >
                    ▼
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteRoutineItem(item.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 새 루틴 추가 */}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="새 점심 루틴 입력"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addRoutineItem();
              }}
            />
            <button
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
              onClick={addRoutineItem}
            >
              추가
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-gray-300 text-sm hover:bg-gray-400"
              onClick={() => setIsEditing(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
