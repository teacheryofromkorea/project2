import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const STORAGE_KEY = "tool_team_builder_result_v1";
const HISTORY_KEY = "tool_team_builder_history_v1";

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
  const [buildMode, setBuildMode] = useState("teamCount"); // "teamCount" | "teamSize"
  const [teamSize, setTeamSize] = useState(4);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [history, setHistory] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);

  // 추가된 상태들
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");

  useEffect(() => {
    setTeamNames((prev) =>
      Array.from({ length: teamCount }, (_, idx) => prev[idx] || `팀 ${idx + 1}`)
    );
  }, [teamCount]);

  const [onlyPresent, setOnlyPresent] = useState(true);
  const [balanceGender, setBalanceGender] = useState(false);
  const [genderOnly, setGenderOnly] = useState("all"); // "all" | "male" | "female"

  useEffect(() => {
    if (genderOnly !== "all") {
      setBalanceGender(false);
    }
  }, [genderOnly]);

  /* -------------------------
     4. 학생 불러오기
  ------------------------- */
  useEffect(() => {
    fetchStudents();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTeams(parsed.teams || []);
        setTeamNames(parsed.teamNames || []);
        setTeamCount(parsed.teamCount || 4);
      } catch (e) {
        console.error("Failed to load team builder data", e);
      }
    }

    const historyRaw = localStorage.getItem(HISTORY_KEY);
    if (historyRaw) {
      try {
        setHistory(JSON.parse(historyRaw));
      } catch (e) {
        console.error("Failed to load team history", e);
      }
    }
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
    let sourceStudents = onlyPresent
      ? students.filter((s) => presentStudentIds.includes(s.id))
      : students;

    if (genderOnly === "male") {
      sourceStudents = sourceStudents.filter((s) => s.gender === "male");
    }
    if (genderOnly === "female") {
      sourceStudents = sourceStudents.filter((s) => s.gender === "female");
    }

    const calculatedTeamCount =
      buildMode === "teamSize"
        ? Math.ceil(sourceStudents.length / teamSize)
        : teamCount;

    let pool = [...sourceStudents];

    // 성별 균형 옵션이 켜진 경우
    if (balanceGender) {
      const boys = pool.filter((s) => s.gender === "남");
      const girls = pool.filter((s) => s.gender === "여");

      const shuffledBoys = boys.sort(() => Math.random() - 0.5);
      const shuffledGirls = girls.sort(() => Math.random() - 0.5);

      const result = Array.from({ length: calculatedTeamCount }, () => []);

      let i = 0;
      while (shuffledBoys.length || shuffledGirls.length) {
        if (shuffledBoys.length) {
          result[i % calculatedTeamCount].push(shuffledBoys.shift());
          i++;
        }
        if (shuffledGirls.length) {
          result[i % calculatedTeamCount].push(shuffledGirls.shift());
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
    const result = Array.from({ length: calculatedTeamCount }, () => []);

    shuffled.forEach((student, index) => {
      result[index % calculatedTeamCount].push(student);
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
    <div className="min-h-full w-full bg-gradient-to-t from-blue-100/60 via-sky-50/40 to-yellow-100/70 p-3 rounded-3xl overflow-hidden">
      <div className="p-6 space-y-6 bg-white/20 backdrop-blur-[2px] rounded-3xl">
      <h1 className="text-2xl font-bold">🧩 팀 편성 도구</h1>

      {/* 컨트롤 */}
      <div className="bg-white/60 rounded-3xl p-4 shadow space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 기준 선택 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 shrink-0">기준</label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="buildMode"
                checked={buildMode === "teamCount"}
                onChange={() => setBuildMode("teamCount")}
              />
              팀 수
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="buildMode"
                checked={buildMode === "teamSize"}
                onChange={() => setBuildMode("teamSize")}
              />
              인원 수
            </label>
          </div>

          {/* 수치 입력 */}
          <div className="flex items-center gap-2">
            {buildMode === "teamCount" ? (
              <>
                <label className="text-sm font-medium text-gray-700 shrink-0">팀</label>
                <input
                  type="number"
                  min={2}
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                />
              </>
            ) : (
              <>
                <label className="text-sm font-medium text-gray-700 shrink-0">인원</label>
                <input
                  type="number"
                  min={2}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                />
              </>
            )}
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyPresent}
                onChange={(e) => setOnlyPresent(e.target.checked)}
              />
              출석한 사람만
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={balanceGender}
                onChange={(e) => setBalanceGender(e.target.checked)}
                disabled={genderOnly !== "all"}
              />
              성별 균등
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={genderOnly === "male"}
                onChange={(e) =>
                  setGenderOnly(e.target.checked ? "male" : "all")
                }
              />
              남자끼리
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={genderOnly === "female"}
                onChange={(e) =>
                  setGenderOnly(e.target.checked ? "female" : "all")
                }
              />
              여자끼리
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          {/* 1줄: 주요 액션 */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={buildTeams}
              className="px-6 py-2 rounded-xl bg-blue-500/90 text-white text-sm font-medium hover:bg-blue-600"
            >
              팀 만들기
            </button>

            <button
              onClick={reshuffleTeams}
              className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
            >
              다시 섞기
            </button>

            <button
              onClick={copyTeamsToClipboard}
              className="px-5 py-2 rounded-xl bg-green-500/90 text-white text-sm hover:bg-green-600"
            >
              결과 복사
            </button>

          </div>

          {/* 2줄: 저장 / 불러오기 */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-5 py-2 rounded-xl bg-indigo-500/90 text-white text-sm hover:bg-indigo-600"
            >
              💾 저장하기
            </button>

            <button
              onClick={() => setShowLoadModal(true)}
              className="px-5 py-2 rounded-xl bg-amber-500/90 text-white text-sm hover:bg-amber-600"
            >
              📂 불러오기
            </button>
          </div>
        </div>
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
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[320px] space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              결과 초기화
            </h3>
            <p className="text-sm text-gray-600">
              현재 팀 편성 결과가 모두 삭제됩니다.
              <br />
              정말 초기화할까요?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setTeams([]);
                  setTeamNames([]);
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] space-y-4">
            <h3 className="text-lg font-semibold">팀 편성 저장</h3>

            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="예: 3교시 수학 모둠"
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
            />

            <p className="text-xs text-gray-500 leading-relaxed">
              • 팀 이름은 필수입니다.<br />
              • 최근 <b>10개</b>까지만 저장됩니다.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-sm"
              >
                취소
              </button>

              <button
                onClick={() => {
                  if (teams.length === 0) return;
                  if (!saveLabel.trim()) {
                    alert("팀 이름을 입력해주세요.");
                    return;
                  }

                  const existingIndex = history.findIndex(
                    (h) => h.label === saveLabel.trim()
                  );

                  let next = [...history];

                  const record = {
                    createdAt: new Date().toISOString(),
                    label: saveLabel.trim(),
                    teamCount,
                    teamNames,
                    teams,
                  };

                  if (existingIndex !== -1) {
                    // 덮어쓰기
                    if (!window.confirm("같은 이름의 팀이 있습니다. 덮어쓸까요?")) {
                      return;
                    }
                    next.splice(existingIndex, 1);
                  }

                  next = [record, ...next].slice(0, 10);

                  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
                  setHistory(next);

                  setSaveLabel("");
                  setShowSaveModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] space-y-4">
            <h3 className="text-lg font-semibold">저장된 팀 불러오기</h3>

            {history.length === 0 ? (
              <p className="text-sm text-gray-500">저장된 팀이 없습니다.</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((h, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {h.label || "이름 없는 팀"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(h.createdAt).toLocaleString()} · {h.teamCount}팀
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setTeams(h.teams);
                          setTeamNames(h.teamNames);
                          setTeamCount(h.teamCount);
                          setShowLoadModal(false);
                        }}
                        className="text-sm px-1 py-1 rounded-lg bg-amber-500 text-white"
                      >
                        불러오기
                      </button>

                      <button
                        onClick={() => {
                          if (!window.confirm("이 팀을 삭제할까요?")) return;
                          const next = history.filter((_, i) => i !== idx);
                          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
                          setHistory(next);
                        }}
                        className="text-sm px-1 py-1 rounded-lg bg-red-500 text-white"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}