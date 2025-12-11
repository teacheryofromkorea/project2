import React from "react";

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
  return (
    <div className="relative overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] p-6 flex flex-col min-h-0">
      <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-white/5"></div>

      <h3 className="text-lg font-semibold mb-4 text-gray-700">학생 추가</h3>

      <form
        onSubmit={handleAddStudent}
        className="flex flex-col gap-3 relative z-10"
      >
        {/* 이름 */}
        <input
          type="text"
          placeholder="이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/60 border border-white/40 shadow-inner text-sm"
        />

        {/* 성별 */}
        <div className="flex gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="gender"
              checked={newGender === "male"}
              onChange={() => setNewGender("male")}
            />
            남학생
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="gender"
              checked={newGender === "female"}
              onChange={() => setNewGender("female")}
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