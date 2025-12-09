// src/components/BreakTime/EditItemModal.jsx

import React from 'react';

export default function EditItemModal({
  editRoutine,
  editText,
  setEditText,
  updateRoutine,
  onClose,
}) {
  // editRoutine이 없으면 렌더링하지 않음
  if (!editRoutine) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[300px]">
        <h3 className="text-lg font-bold mb-4">루틴 수정</h3>
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={updateRoutine} // 부모의 업데이트 함수 호출
          className="w-full bg-blue-600 text-white rounded-full py-2 mb-2 font-semibold"
        >
          저장
        </button>
        <button
          onClick={onClose} // 부모의 닫기 함수 호출
          className="w-full bg-gray-300 rounded-full py-2 font-semibold"
        >
          취소
        </button>
      </div>
    </div>
  );
}
