

import React from "react";

/**
 * 🎁 GachaResultModal (C-4)
 * - 가챠 결과를 보여주는 단순 모달
 * - 연출 최소 / UX 명확
 */
export default function GachaResultModal({
  isOpen,
  pet,
  onClose,
}) {
  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dim background */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-80 rounded-xl bg-white p-6 text-center shadow-xl">
        <div className="text-sm text-gray-500 mb-2">
          🎉 획득!
        </div>

        <div className="text-6xl mb-4">
          {pet.emoji || "🐾"}
        </div>

        <div className="text-lg font-bold mb-6">
          {pet.name}
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-purple-600 py-2 text-white hover:bg-purple-700"
        >
          확인
        </button>
      </div>
    </div>
  );
}