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
    <div className="h-full flex flex-col border-r bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">학생 선택</h2>

        <button
          onClick={onToggleMultiSelectMode}
          className={`text-sm px-3 py-1 rounded-full border transition ${
            isMultiSelectMode
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isMultiSelectMode ? "다중 선택 중" : "여러명 선택"}
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 번호 검색"
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-sm text-gray-500">
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
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "hover:bg-gray-50"
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
                  <div className="font-medium">
                    {student.number}. {student.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {student.gender || "미지정"}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      {isMultiSelectMode && (
        <div className="p-3 border-t text-sm text-gray-600">
          선택됨: <strong>{selectedStudentIds.length}</strong>명
        </div>
      )}
    </div>
  );
}