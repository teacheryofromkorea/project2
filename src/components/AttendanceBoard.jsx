import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AttendanceBoard() {
  const [students, setStudents] = useState([]);

  // -------------------------------
  // 1) 학생 목록 불러오기
  // -------------------------------

  const girls = students.filter((s) => s.gender === "F");
  const boys = students.filter((s) => s.gender === "M");

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (error) console.error(error);
    else setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // -------------------------------
  // 2) 출석 버튼 (status 업데이트)
  // -------------------------------
  const markPresent = async (id, currentStatus) => {
    const newStatus = currentStatus === "present" ? "absent" : "present";

    const { error } = await supabase
      .from("students")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) console.error(error);
    else fetchStudents(); // 다시 불러오기
  };

  return (
    <div className="flex gap-6 w-full">
      
      {/* 여학생 박스 */}
      <div className="flex-1 bg-pink-100/60 rounded-3xl p-4 shadow">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 rounded-full bg-pink-200 text-pink-800 font-bold shadow-sm">
            👧 여학생 ({girls.length}명)
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {girls.map((s) => (
            <div
              key={s.id}
              className="bg-white/80 rounded-3xl p-5 shadow-md hover:shadow-lg transition flex flex-col items-center space-y-3"
            >
              <div className="font-semibold text-base text-center whitespace-nowrap">
                {s.name}
              </div>

              {s.status === "present" ? (
                <button
                  onClick={() => markPresent(s.id, s.status)}
                  className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm shadow whitespace-nowrap"
                >
                  미션
                </button>
              ) : (
                <button
                  onClick={() => markPresent(s.id, s.status)}
                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm shadow whitespace-nowrap"
                >
                  출석
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 남학생 박스 */}
      <div className="flex-1 bg-blue-100/60 rounded-3xl p-4 shadow">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 rounded-full bg-blue-200 text-blue-800 font-bold shadow-sm">
            👦 남학생 ({boys.length}명)
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {boys.map((s) => (
            <div
              key={s.id}
              className="bg-white/80 rounded-3xl p-5 shadow-md hover:shadow-lg transition flex flex-col items-center space-y-3"
            >
              <div className="font-semibold text-base text-center whitespace-nowrap">
                {s.name}
              </div>

              {s.status === "present" ? (
                <button
                  onClick={() => markPresent(s.id, s.status)}
                  className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm shadow whitespace-nowrap"
                >
                  미션
                </button>
              ) : (
                <button
                  onClick={() => markPresent(s.id, s.status)}
                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm shadow whitespace-nowrap"
                >
                  출석
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AttendanceBoard;