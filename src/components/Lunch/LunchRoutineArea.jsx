import { useEffect, useState } from "react";
import { useLock } from "../../context/LockContext";
import useLunchRoutine from "../../hooks/Lunch/useLunchRoutine";
import EditItemModal from "../Break/EditItemModal";

export default function LunchRoutineArea() {
  const { locked } = useLock();

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

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  useEffect(() => {
    fetchRoutineTitle();
    fetchRoutineItems();
  }, [fetchRoutineTitle, fetchRoutineItems]);

  useEffect(() => {
    if (locked) {
      setIsRoutineModalOpen(false);
      setEditRoutine(null);
      setEditText("");
      setNewContent("");
    }
  }, [locked]);

  return (
    <div className="bg-white/70 rounded-3xl shadow p-8 flex flex-col gap-6 w-full">
      {/* 헤더: 클릭 시 전체 편집 모달 오픈 */}
      <div className="flex items-center justify-between">
        <h2
          onClick={() => {
            if (locked) return;
            setTempTitle(routineTitle);
            setNewContent("");
            setIsRoutineModalOpen(true);
          }}
          className={`text-3xl font-extrabold tracking-tight flex items-center gap-2 transition-colors
            ${locked
              ? "text-gray-800"
              : "text-gray-800 cursor-pointer hover:text-blue-600"}
          `}
        >
          🍱 {routineTitle || "점심시간 루틴"}
        </h2>
      </div>

      {/* 루틴 흐름 대시보드 */}
      <div className="flex flex-wrap items-center gap-4 text-lg font-semibold">
        {routineItems.length === 0 ? (
          <span className="text-gray-400">아직 점심시간 루틴이 없습니다.</span>
        ) : (
          routineItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-blue-300 text-blue-600 font-bold">
                {index + 1}
              </span>
              <span>{item.text}</span>
              {index < routineItems.length - 1 && <span className="text-gray-400">→</span>}
            </div>
          ))
        )}
      </div>

      {/* [1] 메인 편집 모달 (제목 수정 + 항목 추가/삭제/순서변경) */}
      {isRoutineModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
          onClick={() => {
            if (locked) return;
            setIsRoutineModalOpen(false);
          }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">점심시간 루틴 편집</h3>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">루틴 제목</label>
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6"
            />

            <ul className="max-h-48 overflow-y-auto mb-6 space-y-2">
              {routineItems.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <span className="flex-1 truncate mr-2">{item.text}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { if (locked) return; moveRoutine(index, "up"); }}>▲</button>
                    <button onClick={() => { if (locked) return; moveRoutine(index, "down"); }}>▼</button>
                    <button
                      onClick={() => {
                        if (locked) return;
                        setEditRoutine(item); // 수정할 객체 저장
                        setEditText(item.text); // 입력란 초기값 설정
                      }}
                      className="text-blue-600"
                    >
                      수정
                    </button>
                    <button onClick={() => { if (locked) return; deleteRoutineItem(item.id); }} className="text-red-600">삭제</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="새 루틴 추가"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <button onClick={() => { if (locked) return; addRoutineItem(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg">추가</button>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => { if (locked) return; setIsRoutineModalOpen(false); }} className="px-4 py-2 bg-gray-200 rounded-lg">닫기</button>
              <button onClick={async () => { if (locked) return; await saveRoutineTitle(); setIsRoutineModalOpen(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* [2] 개별 항목 텍스트 수정 모달 (중첩 모달 처리) */}
      {editRoutine && (
        <EditItemModal
          title="루틴 항목 이름 수정"
          editRoutine={editRoutine}
          editText={editText}
          setEditText={setEditText}
          updateRoutine={updateRoutine}
          onClose={() => {
            setEditRoutine(null);
            setEditText("");
          }}
        />
      )}
    </div>
  );
}
