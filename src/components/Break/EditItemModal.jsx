// src/components/BreakTime/EditItemModal.jsx

import React from 'react';
import BaseModal from "../common/BaseModal";

export default function EditItemModal({
  isOpen = true, // Added default true if mostly rendered conditionally, or expect prop
  editRoutine,
  editText,
  setEditText,
  updateRoutine,
  onClose,
  title = "루틴 수정",
}) {
  // editRoutine이 없으면 렌더링하지 않음
  if (!editRoutine) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[300px]">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
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
    </BaseModal>
  );
}
