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
    <div className="flex flex-col bg-white/5 backdrop-blur-xl text-white h-[calc(100%-2rem)] m-1 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold text-lg text-white tracking-wide">학생 선택</h2>

        <button
          type="button"
          onClick={onToggleMultiSelectMode}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${isMultiSelectMode
            ? "bg-purple-500/80 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
        >
          {isMultiSelectMode ? "다중 선택 ON" : "여러명 선택"}
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          placeholder="이름 또는 번호 검색"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/20 text-white placeholder-white/30 border border-white/5 focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:bg-black/30 transition-all"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-sm text-center text-white/40 animate-pulse">
            데이터를 불러오는 중...
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
                className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 border-b border-white/5
                  ${isSelected
                    ? "bg-white/10 border-l-4 border-l-purple-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                    : "hover:bg-white/5 border-l-4 border-l-transparent"
                  }`}
              >
                {isMultiSelectMode && (
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStudentIds.includes(student.id) ? 'bg-purple-500 border-purple-500' : 'border-white/30 bg-white/5'}`}>
                    {selectedStudentIds.includes(student.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                )}

                <div className="flex-1">
                  <div className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    <span className="opacity-50 mr-2">{student.number}</span>
                    {student.name}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {student.gender || "미지정"}
                  </div>
                </div>
              </div>
            );
          })}

        {!loading && filteredStudents.length === 0 && (
          <div className="p-6 text-center text-sm text-white/30">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* Footer */}
      {isMultiSelectMode && (
        <div className="p-4 border-t border-white/10 bg-purple-900/20 backdrop-blur-md">
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-200">선택된 학생</span>
            <span className="font-bold text-white bg-purple-500/30 px-2 py-0.5 rounded-md border border-purple-500/20">
              {selectedStudentIds.length}명
            </span>
          </div>
        </div>
      )}
    </div>
  );
}