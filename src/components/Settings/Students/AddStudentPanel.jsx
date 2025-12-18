import React, { useEffect, useRef, useState } from "react";

export default function AddStudentPanel({
  newName,
  setNewName,
  newGender,
  setNewGender,
  newNumber,
  setNewNumber,
  newDuty,
  setNewDuty,
  formError,
  saving,
  handleAddStudent,
}) {
  const GENDER_STORAGE_KEY = "add_student_last_gender";

  const nameInputRef = useRef(null);
  const [uiGender, setUiGender] = useState(newGender || "male");

  useEffect(() => {
    const savedGender = localStorage.getItem(GENDER_STORAGE_KEY);
    if (savedGender === "male" || savedGender === "female") {
      setUiGender(savedGender);
      setNewGender(savedGender);
    } else if (newGender) {
      setUiGender(newGender);
    }
  }, []);

  return (
    <div className="relative overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] p-6 flex flex-col min-h-0">
      <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-white/5"></div>

      <h3 className="text-lg font-semibold mb-4 text-gray-700">학생 추가</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          // 성별만 유지
          setNewGender(uiGender);
          localStorage.setItem(GENDER_STORAGE_KEY, uiGender);

          // 그대로 저장
          handleAddStudent();

          // 이름만 초기화 + 포커스
          setNewName("");
          requestAnimationFrame(() => {
            nameInputRef.current?.focus();
          });
        }}
        className="flex flex-col gap-3 relative z-10"
      >
        {/* 이름 */}
        <input
          ref={nameInputRef}
          type="text"
          placeholder="이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/60 border border-white/40 shadow-inner text-sm"
        />

        {/* 성별 */}
        <div className="flex gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="gender"
              checked={uiGender === "male"}
              onChange={() => {
                setUiGender("male");
                setNewGender("male");
                localStorage.setItem(GENDER_STORAGE_KEY, "male");
              }}
            />
            남학생
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="gender"
              checked={uiGender === "female"}
              onChange={() => {
                setUiGender("female");
                setNewGender("female");
                localStorage.setItem(GENDER_STORAGE_KEY, "female");
              }}
            />
            여학생
          </label>
        </div>

        {/* 번호 */}
        <input
          type="number"
          min="1"
          placeholder="번호 (선택)"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/60 border border-white/40 shadow-inner text-sm"
        />

        {/* 1인1역 */}
        <input
          type="text"
          placeholder="1인 1역 (선택)"
          value={newDuty}
          onChange={(e) => setNewDuty(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/60 border border-white/40 shadow-inner text-sm"
        />

        {/* 오류 메시지 */}
        {formError && (
          <p className="text-sm text-red-500">{formError}</p>
        )}

        {/* 추가 버튼 */}
        <button
          type="submit"
          disabled={saving}
          className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          {saving ? "추가 중..." : "학생 추가"}
        </button>
      </form>
    </div>
  );
}