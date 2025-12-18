import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TeamBuilder() {
  /* -------------------------
     1. 학생 데이터
  ------------------------- */
  const [students, setStudents] = useState([]);
  const [presentStudentIds, setPresentStudentIds] = useState([]);

  /* -------------------------
     2. 팀 결과
  ------------------------- */
  const [teams, setTeams] = useState([]);
  const [teamNames, setTeamNames] = useState([]);

  /* -------------------------
     3. 옵션
  ------------------------- */
  const [teamCount, setTeamCount] = useState(4);

  useEffect(() => {
    setTeamNames((prev) =>
      Array.from({ length: teamCount }, (_, idx) => prev[idx] || `팀 ${idx + 1}`)
    );
  }, [teamCount]);

  const [onlyPresent, setOnlyPresent] = useState(true);
  const [balanceGender, setBalanceGender] = useState(false);

  /* -------------------------
     4. 학생 불러오기
  ------------------------- */
  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: studentData, error: studentError }, { data: attendanceData, error: attendanceError }] =
      await Promise.all([
        supabase.from("students").select("*").order("number"),
        supabase
          .from("student_attendance_status")
          .select("student_id")
          .eq("date", today)
          .eq("present", true),
      ]);

    if (studentError || attendanceError) return;

    const presentIds = (attendanceData || []).map((a) => a.student_id);

    setStudents(studentData || []);
    setPresentStudentIds(presentIds);
  }

  function reshuffleTeams() {
    if (teams.length === 0) return;
    const flat = teams.flat();
    const shuffled = [...flat].sort(() => Math.random() - 0.5);
    const result = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((student, index) => {
      result[index % teamCount].push(student);
    });
    setTeams(result);
    setTeamNames((prev) =>
      result.map((_, idx) => prev[idx] || `팀 ${idx + 1}`)
    );
  }

  /* -------------------------
     5. 팀 편성 로직 (일단 랜덤)
  ------------------------- */
  function buildTeams() {
    const sourceStudents = onlyPresent
      ? students.filter((s) => presentStudentIds.includes(s.id))
      : students;

    let pool = [...sourceStudents];

    // 성별 균형 옵션이 켜진 경우
    if (balanceGender) {
      const boys = pool.filter((s) => s.gender === "남");
      const girls = pool.filter((s) => s.gender === "여");

      const shuffledBoys = boys.sort(() => Math.random() - 0.5);
      const shuffledGirls = girls.sort(() => Math.random() - 0.5);

      const result = Array.from({ length: teamCount }, () => []);

      let i = 0;
      while (shuffledBoys.length || shuffledGirls.length) {
        if (shuffledBoys.length) {
          result[i % teamCount].push(shuffledBoys.shift());
          i++;
        }
        if (shuffledGirls.length) {
          result[i % teamCount].push(shuffledGirls.shift());
          i++;
        }
      }

      setTeamNames((prev) =>
        result.map((_, idx) => prev[idx] || `팀 ${idx + 1}`)
      );
      setTeams(result);
      return;
    }

    // 기본 랜덤
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const result = Array.from({ length: teamCount }, () => []);

    shuffled.forEach((student, index) => {
      result[index % teamCount].push(student);
    });

    setTeamNames((prev) =>
      result.map((_, idx) => prev[idx] || `팀 ${idx + 1}`)
    );
    setTeams(result);
  }

  function copyTeamsToClipboard() {
    if (teams.length === 0) return;

    const text = teams
      .map((team, idx) => {
        const members = team.map((s) => `- ${s.name}`).join("\n");
        return `${teamNames[idx] || `팀 ${idx + 1}`}\n${members}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
    alert("팀 결과가 복사되었습니다!");
  }

  /* -------------------------
     6. UI
  ------------------------- */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧩 팀 편성 도구</h1>

      {/* 컨트롤 */}
      <div className="flex flex-wrap items-center gap-3 bg-white/60 rounded-2xl p-4 shadow">
        <label className="text-sm font-medium text-gray-700">팀 수</label>
        <input
          type="number"
          min={2}
          value={teamCount}
          onChange={(e) => setTeamCount(Number(e.target.value))}
          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700 ml-2">
          <input
            type="checkbox"
            checked={onlyPresent}
            onChange={(e) => setOnlyPresent(e.target.checked)}
          />
          출석한 학생만 포함
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 ml-2">
          <input
            type="checkbox"
            checked={balanceGender}
            onChange={(e) => setBalanceGender(e.target.checked)}
          />
          성별 균형 맞추기
        </label>

        <button
          onClick={buildTeams}
          className="px-4 py-2 rounded-lg bg-blue-500/90 text-white text-sm hover:bg-blue-600"
        >
          팀 만들기
        </button>

        <button
          onClick={reshuffleTeams}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
        >
          다시 섞기
        </button>

        <button
          onClick={copyTeamsToClipboard}
          className="px-4 py-2 rounded-lg bg-green-500/90 text-white text-sm hover:bg-green-600"
        >
          팀 결과 복사
        </button>
      </div>

      {/* 결과 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {teams.map((team, idx) => (
          <div
            key={idx}
            className="bg-white/60 backdrop-blur rounded-2xl p-4 shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <input
                value={teamNames[idx] || `팀 ${idx + 1}`}
                onChange={(e) => {
                  const next = [...teamNames];
                  next[idx] = e.target.value;
                  setTeamNames(next);
                }}
                className="font-semibold bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-gray-500 text-sm"
              />
              <span className="text-xs text-gray-500">
                {team.length}명
              </span>
            </div>
            <ul className="text-sm space-y-1">
              {team.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}