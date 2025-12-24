

function AttendanceConfirmModal({
  type, // "present" | "cancel"
  student,
  onConfirm,
  onClose,
}) {
  if (!student) return null;

  const isCancel = type === "cancel";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="
          w-[360px]
          rounded-3xl
          bg-white
          shadow-2xl
          px-8
          py-7
          flex
          flex-col
          gap-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 아이콘 */}
        <div className="flex justify-center text-4xl">
          {isCancel ? "❌" : "✅"}
        </div>

        {/* 메시지 */}
        <div className="text-center flex flex-col gap-2">
          <div className="text-xl font-bold text-gray-900">
            {student.name}
          </div>

          <div className="text-base text-gray-700 leading-relaxed">
            {isCancel
              ? "출석을 취소하시겠습니까?"
              : "출석 처리하시겠습니까?"}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={onClose}
            className="
              flex-1
              py-2.5
              rounded-full
              bg-gray-200
              hover:bg-gray-300
              text-gray-800
              font-semibold
              transition
            "
          >
            취소
          </button>

          <button
            onClick={onConfirm}
            className={`
              flex-1
              py-2.5
              rounded-full
              font-semibold
              text-white
              transition
              ${
                isCancel
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceConfirmModal;