

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function SeatAssignModal({ seat, onClose, onAssigned }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, number, gender")
        .order("number", { ascending: true });

      if (!error) {
        setStudents(data || []);
      } else {
        console.error(error);
      }
    };

    fetchStudents();
  }, []);

  const assignStudent = async (studentId) => {
    setLoading(true);

    const { error } = await supabase
      .from("classroom_seats")
      .update({ student_id: studentId })
      .eq("id", seat.id);

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    if (onAssigned) onAssigned();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            좌석 배정 ({seat.label || `${seat.row}-${seat.col}`})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {students.map((s) => (
            <button
              key={s.id}
              disabled={loading}
              onClick={() => assignStudent(s.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                {s.number != null && (
                  <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {s.number}
                  </span>
                )}
                <span className="font-semibold">{s.name}</span>
              </div>
              <span className="text-xs text-gray-400">배정</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeatAssignModal;