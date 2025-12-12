// src/components/Settings/Students/StudentCard.jsx
import React from "react";

/**
 * 학생 카드 하나 (남/여 공통)
 *
 * props:
 * - stu: 학생 객체
 * - variant: "male" | "female"
 * - isEditing: boolean (지금 이 카드가 수정 모드인지)
 * - tempNumber, tempName, tempDuty: 인라인 수정용 임시 값
 * - onChangeNumber(value), onChangeName(value), onChangeDuty(value)
 * - onStartEdit(stu): 수정 모드 진입
 * - onSave(stu): 수정 내용 저장
 * - onCancel(): 수정 취소
 * - onDelete(stu): 삭제
 * - deleting: boolean (삭제 중인지)
 */
export default function StudentCard({
  stu,
  variant,
  edit,
  remove,
}) {
  const {
    isEditing,
    tempNumber,
    tempName,
    tempDuty,
    onChangeNumber,
    onChangeName,
    onChangeDuty,
    onStartEdit,
    onSave,
    onCancel,
  } = edit;

  const {
    onDelete,
    deleting,
  } = remove;

  const isMale = variant === "male";

  const cardBgClass = isMale
    ? "bg-blue-200/20"
    : "bg-pink-200/20";

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await onSave(stu);
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className={`relative p-4 rounded-2xl backdrop-blur-xl ${cardBgClass} border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-lg transition cursor-pointer`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 min-w-0 flex-grow">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-2 w-full">
                {/* 번호 + 이름 한 줄 */}
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    value={tempNumber ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      onChangeNumber(stu.id, v === "" ? "" : Number(v));
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-20 px-2 py-1 rounded-lg bg-white/70 border border-white/40 shadow-inner text-sm"
                  />

                  <input
                    type="text"
                    value={tempName ?? ""}
                    onChange={(e) => onChangeName(stu.id, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-1 rounded-lg bg-white/70 border border-white/40 shadow-inner text-sm"
                  />
                </div>

                {/* duty 전체 폭 */}
                <input
                  type="text"
                  value={tempDuty ?? ""}
                  onChange={(e) => onChangeDuty(stu.id, e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="1인1역"
                  className="w-full px-3 py-1 rounded-lg bg-white/70 border border-white/40 shadow-inner text-sm"
                />

                {/* 수정/삭제 아이콘 (수정 모드일 때도 보이게, 저장용 버튼 역할) */}
                <div className="flex items-center justify-end gap-3 pr-1 mt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(stu);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition text-lg"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(stu);
                    }}
                    disabled={deleting}
                    className="text-red-500 hover:text-red-700 transition text-lg"
                  >
                    {deleting ? "…" : "🗑️"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {stu.number && (
                <span className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-br from-white/80 to-white/40 text-gray-800 font-semibold shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.08)] border border-white/50 backdrop-blur-md">
                  {stu.number}
                </span>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {stu.name}
                </p>
                {stu.duty && (
                  <span className="text-xs text-gray-600 ml-1 truncate">
                    {stu.duty}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* 우측 아이콘 영역 (기본 모드에서만 보임) */}
        {!isEditing && (
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(stu);
              }}
              className="text-blue-600 hover:text-blue-800 transition text-lg"
            >
              ✏️
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(stu);
              }}
              disabled={deleting}
              className="text-red-500 hover:text-red-700 transition text-lg"
            >
              {deleting ? "…" : "🗑️"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}