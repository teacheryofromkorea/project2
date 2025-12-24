

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

function StudentSelectModal({ seat, onClose, onAssigned }) {
  const [maleStudents, setMaleStudents] = useState([]);
  const [femaleStudents, setFemaleStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seat) return;
    fetchAvailableStudents();
  }, [seat]);

  const fetchAvailableStudents = async () => {
    setLoading(true);

    /**
     * 1) fetch all students
     * 2) fetch seats with assigned students
     * 3) filter out already assigned students
     */

    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id, name, number, gender")
      .order("number", { ascending: true });

    if (studentError) {
      console.error(studentError);
      setLoading(false);
      return;
    }

    const { data: usedSeats, error: seatError } = await supabase
      .from("classroom_seats")
      .select("student_id")
      .not("student_id", "is", null);

    if (seatError) {
      console.error(seatError);
      setLoading(false);
      return;
    }

    const usedStudentIds = new Set(
      (usedSeats || []).map((s) => s.student_id)
    );

    const available = students.filter(
      (s) => !usedStudentIds.has(s.id)
    );

    const males = available.filter((s) => s.gender === "male");
    const females = available.filter((s) => s.gender === "female");

    setMaleStudents(males);
    setFemaleStudents(females);
    setLoading(false);
  };

  const handleAssign = async (student) => {
    const { error } = await supabase
      .from("classroom_seats")
      .update({ student_id: student.id })
      .eq("id", seat.id);

    if (error) {
      console.error(error);
      return;
    }

    if (onAssigned) onAssigned();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          학생 선택
        </h2>

        {loading ? (
          <div className="text-sm text-gray-400 text-center">
            학생 불러오는 중…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* 남학생 */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                남학생
              </h3>
              <div className="flex flex-col gap-2">
                {maleStudents.length === 0 && (
                  <div className="text-xs text-gray-400">
                    배치 가능한 학생 없음
                  </div>
                )}
                {maleStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleAssign(student)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
                               hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-semibold text-gray-500">
                      {student.number}번
                    </span>
                    <span className="font-medium text-gray-800">
                      {student.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 여학생 */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                여학생
              </h3>
              <div className="flex flex-col gap-2">
                {femaleStudents.length === 0 && (
                  <div className="text-xs text-gray-400">
                    배치 가능한 학생 없음
                  </div>
                )}
                {femaleStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleAssign(student)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
                               hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-semibold text-gray-500">
                      {student.number}번
                    </span>
                    <span className="font-medium text-gray-800">
                      {student.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentSelectModal;