import React, { useEffect } from "react";
import { useLock } from "../../context/LockContext";

function BreakRoutinePanel({
  routineTitle,
  routineItems,
  breakBlocks,
  selectedBlockId,
  setSelectedBlockId,
  setTempTitle,
  setNewContent,
  setIsRoutineModalOpen,
  isRoutineModalOpen,
  tempTitle,
  newContent,
  moveRoutine,
  deleteRoutineItem,
  addRoutineItem,
  editRoutine,
  setEditRoutine,
  editText,
  setEditText,
  updateRoutine,
  saveRoutineTitle,
}) {
  const { locked } = useLock();

  // 루틴 제목 저장 핸들러 (기존 로직 그대로)
  const handleSaveRoutineTitleAndClose = async () => {
    if (locked) return;
    await saveRoutineTitle();
    setIsRoutineModalOpen(false);
  };

  useEffect(() => {
    if (locked) {
      setIsRoutineModalOpen(false);
      setEditRoutine(null);
      setEditText("");
      setNewContent("");
    }
  }, [locked]);

  return (
    <>
      {/* 2. 상단 쉬는시간 루틴 */}
      <div className="bg-white/70 rounded-3xl shadow p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          {/* 제목(클릭 = 편집) */}
          <div className="relative group">
            <h2
              onClick={() => {
                if (locked) return;
                setTempTitle(routineTitle);
                setNewContent("");
                setIsRoutineModalOpen(true);
              }}
              className={`text-3xl font-extrabold tracking-tight transition-colors
                ${locked
                  ? "text-gray-800"
                  : "text-gray-800 cursor-pointer hover:text-blue-600"
                }
              `}
            >
              📝 {routineTitle}
            </h2>
            <div
              className="
                absolute left-0 top-full mt-1 px-2 py-1 rounded-md text-xs
                bg-gray-800 text-white opacity-0 group-hover:opacity-100
                transition-opacity pointer-events-none
              "
            >
              클릭하여 루틴을 편집합니다
            </div>
          </div>

          {/* 오른쪽: 드롭다운 */}
          <div
            className="flex items-center gap-3"
            style={locked ? { pointerEvents: "none" } : undefined}
          >
            {breakBlocks.length > 0 && (
              <select
                value={selectedBlockId || ""}
                onChange={(e) => {
                  if (locked) return;
                  const value = e.target.value || null;
                  setSelectedBlockId(value);
                }}
                className="px-3 py-2 rounded-full border text-sm shadow-sm bg-white text-gray-700 border-gray-300"
              >
                {breakBlocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name} ({block.start_time?.slice(0, 5)} ~ {block.end_time?.slice(0, 5)})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div
          className={`flex flex-wrap items-center gap-4 text-lg font-semibold transition
            ${locked
              ? "text-gray-900"
              : "text-gray-900 cursor-pointer hover:opacity-80"
            }
          `}
          onClick={() => {
            if (locked) return;
            setTempTitle(routineTitle);
            setNewContent("");
            setIsRoutineModalOpen(true);
          }}
        >
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

      {/* 루틴 편집 모달 */}
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

            <ul className="max-h-48 overflow-y-auto mb-6 space-y-2">
              {routineItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="flex-1">{item.content}</span>

                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (locked) return; moveRoutine(index, "up"); }} className="text-gray-500 font-bold">▲</button>
                    <button onClick={() => { if (locked) return; moveRoutine(index, "down"); }} className="text-gray-500 font-bold">▼</button>
                    <button
                      onClick={() => {
                        if (locked) return;
                        setEditRoutine(item);
                        setEditText(item.content);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (locked) return;
                        deleteRoutineItem(item.id);
                      }}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <label className="block text-sm font-medium text-gray-700 mb-2">새 루틴 항목</label>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { if (locked) return; addRoutineItem(); }}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                추가
              </button>
            </div>

            <div>
              <button
                onClick={() => { if (locked) return; handleSaveRoutineTitleAndClose(); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 mr-2"
              >
                저장
              </button>
              <button
                onClick={() => {
                  if (locked) return;
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

      {/* 항목 수정 모달 */}
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
              onClick={() => { if (locked) return; updateRoutine(); }}
              className="w-full bg-blue-600 text-white rounded-full py-2 mb-2 font-semibold"
            >
              저장
            </button>
            <button
              onClick={() => {
                if (locked) return;
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
    </>
  );
}

export default BreakRoutinePanel;
