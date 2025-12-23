import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

function StudentListPanel({ onStudentSelect }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("id, name, number, gender")
      .order("number", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        학생 목록 불러오는 중…
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        등록된 학생이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {students.map((student) => {
        const isSelected = student.id === selectedStudentId;

        return (
          <button
            key={student.id}
            onClick={() => {
              setSelectedStudentId(student.id);
              if (onStudentSelect) onStudentSelect(student);
            }}
            className={`
              w-full flex items-center justify-between
              px-3 py-2 rounded-lg border
              text-sm
              transition
              ${
                isSelected
                  ? "bg-indigo-100 border-indigo-500"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            <div className="flex items-center gap-2">
              {student.number != null && (
                <span className="text-xs font-semibold text-gray-500">
                  {student.number}번
                </span>
              )}
              <span className="font-medium text-gray-800">
                {student.name}
              </span>
            </div>

            <span className="text-xs text-gray-400">
              선택
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default StudentListPanel;