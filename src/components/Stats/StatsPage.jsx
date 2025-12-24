import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * StatsPage
 * 좌측: 학생 선택
 * 우측: 선택된 학생의 능력치 (RPG 스타일)
 */
function StatsPage() {
  const [students, setStudents] = useState([]);
  const [statTemplates, setStatTemplates] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pendingStat, setPendingStat] = useState(null);
  const [reason, setReason] = useState("");
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, name, number")
        .order("number", { ascending: true });
      if (studentsError) {
        console.error("Error fetching students:", studentsError);
      } else {
        setStudents(studentsData || []);
        if (studentsData && studentsData.length > 0) {
          setSelectedStudentId(studentsData[0].id);
        } else {
          setSelectedStudentId(null);
        }
      }

      // Fetch stat templates
      const { data: statTemplatesData, error: statTemplatesError } =
        await supabase
          .from("stat_templates")
          .select("*")
          .order("order_index", { ascending: true });
      if (statTemplatesError) {
        console.error("Error fetching stat templates:", statTemplatesError);
      } else {
        setStatTemplates(statTemplatesData || []);
      }

      setLoading(false);
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchStudentStats() {
      if (!selectedStudentId) {
        setStudentStats([]);
        return;
      }
      const { data, error } = await supabase
        .from("student_stats")
        .select("*")
        .eq("student_id", selectedStudentId);
      if (error) {
        console.error("Error fetching student stats:", error);
        setStudentStats([]);
      } else {
        setStudentStats(data || []);
      }
    }
    fetchStudentStats();
  }, [selectedStudentId]);

  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId,
  );

  const confirmStatChange = async () => {
    if (!pendingStat || !selectedStudentId) return;

    const { stat, delta } = pendingStat;

    const current =
      studentStats.find(
        s => s.stat_template_id === stat.id
      )?.value ?? 0;

    const nextValue = Math.max(
      0,
      Math.min(stat.max_value, current + delta)
    );

    await supabase
      .from("student_stats")
      .upsert(
        {
          student_id: selectedStudentId,
          stat_template_id: stat.id,
          value: nextValue,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id,stat_template_id",
        }
      );

    await supabase.from("student_stat_logs").insert({
      student_id: selectedStudentId,
      stat_template_id: stat.id,
      delta,
      reason: reason || null,
    });

    setStudentStats(prev => {
      const exists = prev.find(
        s => s.stat_template_id === stat.id
      );

      if (exists) {
        return prev.map(s =>
          s.stat_template_id === stat.id
            ? { ...s, value: nextValue }
            : s
        );
      }

      return [
        ...prev,
        {
          stat_template_id: stat.id,
          value: nextValue,
        },
      ];
    });

    setReason("");
    setPendingStat(null);
    setIsReasonOpen(false);
  };

  return (
    <div className="h-full flex">
      {/* 좌측: 학생 목록 */}
      <div className="w-64 border-r bg-white p-4">
        <h2 className="font-bold text-lg mb-4">👧 학생</h2>
        <ul className="space-y-2">
          {students.map((student) => (
            <li
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`cursor-pointer rounded px-3 py-2 ${
                student.id === selectedStudentId
                  ? "bg-blue-100 font-bold"
                  : "hover:bg-gray-100"
              }`}
            >
              {student.number}번 {student.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 우측: 능력치 영역 */}
      <div className="flex-1 p-6 bg-gray-50">
        {loading ? (
          <div className="text-gray-500">로딩 중...</div>
        ) : selectedStudent ? (
          <>
            <h1 className="text-2xl font-bold mb-6">
              🎮 {selectedStudent.name}의 능력치
            </h1>

            <div className="grid grid-cols-3 gap-4">
              {statTemplates.map((stat) => {
                const statValue =
                  studentStats.find(
                    (s) => s.stat_template_id === stat.id,
                  )?.value ?? 0;
                const percent = (statValue / stat.max_value) * 100;

                return (
                  <div
                    key={stat.id}
                    className="bg-white rounded-xl shadow p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{stat.icon}</span>
                      <span className="font-semibold">
                        {stat.name}
                      </span>
                    </div>

                    <div className="text-3xl font-bold mb-2">
                      {statValue} / {stat.max_value}
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded">
                      <div
                        className={`h-3 rounded ${stat.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={() => {
                          setPendingStat({ stat, delta: -1 });
                          setIsReasonOpen(true);
                        }}
                        className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold"
                      >
                        −
                      </button>

                      <button
                        onClick={() => {
                          setPendingStat({ stat, delta: 1 });
                          setIsReasonOpen(true);
                        }}
                        className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-gray-500">
            학생을 선택해주세요.
          </div>
        )}
      </div>
      {isReasonOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            setIsReasonOpen(false);
            setPendingStat(null);
            setReason("");
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">
              능력치 변경 사유
            </h3>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 수업 참여, 친구 도움, 과제 성실"
              className="w-full h-24 border rounded-lg p-3 text-sm"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setIsReasonOpen(false);
                  setPendingStat(null);
                  setReason("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                취소
              </button>

              <button
                onClick={confirmStatChange}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPage;