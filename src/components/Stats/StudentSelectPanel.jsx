import { useMemo, useState } from "react";

export default function StudentSelectPanel({
  students = [],
  selectedStudentId,
  selectedStudentIds = [],
  isMultiSelectMode = false,
  onSelectStudent,
  onToggleStudent,
  onToggleMultiSelectMode,
  loading = false,
}) {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        String(s.number).includes(search)
    );
  }, [students, search]);

  return (
    <div className="h-full flex flex-col border-r border-white/10 bg-indigo-950/90 text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold text-lg text-white">학생 선택</h2>

        <button
          onClick={onToggleMultiSelectMode}
          className={`text-sm px-3 py-1 rounded-full border transition ${
            isMultiSelectMode
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
          }`}
        >
          {isMultiSelectMode ? "다중 선택 중" : "여러명 선택"}
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 번호 검색"
          className="w-full px-3 py-2 rounded-md text-sm bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring focus:ring-purple-500/40"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-sm text-white/50">
            학생 불러오는 중…
          </div>
        )}

        {!loading &&
          filteredStudents.map((student) => {
            const isSelected = isMultiSelectMode
              ? selectedStudentIds.includes(student.id)
              : selectedStudentId === student.id;

            return (
              <div
                key={student.id}
                onClick={() =>
                  isMultiSelectMode
                    ? onToggleStudent(student.id)
                    : onSelectStudent(student.id)
                }
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                  ${
                    isSelected
                      ? "bg-indigo-800/80"
                      : "hover:bg-white/10"
                  }`}
              >
                {isMultiSelectMode && (
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    readOnly
                  />
                )}

                <div className="flex-1">
                  <div className="font-medium text-white">
                    {student.number}. {student.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {student.gender || "미지정"}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      {isMultiSelectMode && (
        <div className="p-3 border-t border-white/10 text-sm text-white/70">
          선택됨: <strong>{selectedStudentIds.length}</strong>명
        </div>
      )}
    </div>
  );
}