import React from "react";

export default function ReasonModal({
  open,
  mode, // "increase" | "decrease"
  statName,
  targetCount,
  reason,
  onChangeReason,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const title = `${statName ?? "능력치"} ${
    mode === "increase" ? "증가" : "감소"
  } 사유`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <p className="text-sm text-gray-600 mb-3">
          선택된 학생 {targetCount ?? 0}명에게 적용됩니다.
        </p>

        <textarea
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
          placeholder="사유를 입력하세요 (예: 수업 중 적극적인 발표)"
          className="w-full h-28 p-3 border rounded-md resize-none focus:outline-none focus:ring"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
          >
            취소
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}