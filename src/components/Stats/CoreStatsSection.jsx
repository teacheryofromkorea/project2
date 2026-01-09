import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import StatCardsGrid from "./StatCardsGrid";
import ReasonModal from "./ReasonModal";
import CompetencySettingsModal from "./CompetencySettingsModal";
import RadarChart from "./RadarChart";
import { Settings } from "lucide-react";

// 🎟️ 가챠 쿠폰 지급 기준: 능력치 5 누적당 1장
const STAT_PER_GACHA = 5;

function CoreStatsSection({
  students = [],
  selectedStudentId,
  selectedStudentIds = [],
  isMultiSelectMode = false,
  onStudentsUpdated,
  onNestedModalStateChange, // New prop to notify parent about internal modal state
}) {
  const [statTemplates, setStatTemplates] = useState([]);
  const [studentStatsMap, setStudentStatsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(null); // "increase" | "decrease"
  const [pendingStat, setPendingStat] = useState(null);
  const [pendingTargetIds, setPendingTargetIds] = useState([]);
  const [reason, setReason] = useState("");

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Notify parent whenever internal modal state changes
  useEffect(() => {
    onNestedModalStateChange?.(reasonModalOpen || settingsOpen);
  }, [reasonModalOpen, settingsOpen, onNestedModalStateChange]);

  const targetStudentIds = isMultiSelectMode
    ? selectedStudentIds
    : selectedStudentId
      ? [selectedStudentId]
      : [];

  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId
  );

  // 학생별 gacha_progress 빠른 참조용
  const studentsMap = Object.fromEntries(
    students.map((s) => [s.id, s])
  );

  const title = isMultiSelectMode
    ? "선택된 학생들의 핵심 역량"
    : selectedStudent
      ? `${selectedStudent.name}의 핵심 역량`
      : "핵심 역량";

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("stat_templates")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error) {
      setStatTemplates(data || []);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    async function loadStudentStats() {
      if (targetStudentIds.length === 0) {
        setStudentStatsMap({});
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("student_stats")
        .select("*")
        .in("student_id", targetStudentIds);

      if (!error) {
        const map = {};
        targetStudentIds.forEach((id) => {
          map[id] = data.filter(
            (s) => s.student_id === id
          );
        });
        setStudentStatsMap(map);
      }

      setLoading(false);
    }

    loadStudentStats();
  }, [targetStudentIds.join(",")]);

  const openReasonModal = (mode, stat, targetIds) => {
    setPendingMode(mode);
    setPendingStat(stat);
    setPendingTargetIds(targetIds);
    setReason("");
    setReasonModalOpen(true);
  };

  const handleIncrease = (stat, targetIds) => {
    openReasonModal("increase", stat, targetIds);
  };

  const handleDecrease = (stat, targetIds) => {
    openReasonModal("decrease", stat, targetIds);
  };

  const handleConfirmReason = async () => {
    if (!pendingStat || pendingTargetIds.length === 0) return;

    const delta = pendingMode === "increase" ? 1 : -1;

    for (const studentId of pendingTargetIds) {
      const currentStats = studentStatsMap[studentId] || [];
      const currentValue =
        currentStats.find(
          (s) => s.stat_template_id === pendingStat.id
        )?.value ?? 0;

      const nextValue = Math.min(
        pendingStat.max_value,
        Math.max(0, currentValue + delta)
      );

      // 값이 변하지 않으면 skip
      if (nextValue === currentValue) continue;

      // 1️⃣ student_stats upsert
      await supabase.from("student_stats").upsert(
        {
          student_id: studentId,
          stat_template_id: pendingStat.id,
          value: nextValue,
        },
        {
          onConflict: "student_id,stat_template_id",
        }
      );

      // 2️⃣ 로그 기록
      await supabase.from("student_stat_logs").insert({
        student_id: studentId,
        stat_template_id: pendingStat.id,
        delta,
        reason,
      });
      // ⚠️ gacha_progress는 능력치를 '올린 기록'만 누적하는 내부 보상 카운터
      // 능력치를 내릴 때는 절대 감소하지 않는다
      if (delta === 1) {
        // ✅ props(students) 값은 최신이 아닐 수 있으므로, DB에서 현재 gacha_progress를 직접 읽어서 증가
        const { data: progressRow, error: progressReadError } = await supabase
          .from("students")
          .select("gacha_progress")
          .eq("id", studentId)
          .maybeSingle();

        if (progressReadError) {
          console.error("[gacha_progress] read failed", progressReadError);
        } else {
          const beforeProgress = progressRow?.gacha_progress ?? 0;
          const afterProgress = beforeProgress + 1;

          const { error: progressUpdateError } = await supabase
            .from("students")
            .update({ gacha_progress: afterProgress })
            .eq("id", studentId);

          if (progressUpdateError) {
            console.error("[gacha_progress] update failed", progressUpdateError);
          } else {
            // 🎟️ 기준(5점)을 넘긴 경우에만 티켓 지급
            const beforeTickets = Math.floor(beforeProgress / STAT_PER_GACHA);
            const afterTickets = Math.floor(afterProgress / STAT_PER_GACHA);
            const ticketToGive = afterTickets - beforeTickets;

            for (let i = 0; i < ticketToGive; i++) {
              const { error: ticketError } = await supabase.rpc(
                "increment_gacha_ticket",
                {
                  target_student_id: studentId,
                }
              );
              if (ticketError) {
                console.error("[gacha_ticket] increment failed", ticketError);
              }
            }
          }
        }
      }
    }

    // 🔄 최신 값 다시 로드
    const { data } = await supabase
      .from("student_stats")
      .select("*")
      .in("student_id", pendingTargetIds);

    const map = {};
    pendingTargetIds.forEach((id) => {
      map[id] = data.filter(
        (s) => s.student_id === id
      );
    });

    setStudentStatsMap((prev) => ({
      ...prev,
      ...map,
    }));

    // 🔄 부모(StatsPage)에서 students / gacha 관련 상태 다시 fetch
    if (typeof onStudentsUpdated === "function") {
      await onStudentsUpdated();
    }

    setReasonModalOpen(false);
  };

  const handleUpdateMaxValue = async (newMax) => {
    // 모든 템플릿의 max_value를 업데이트한다고 가정
    // 실제로는 개별 템플릿 업데이트도 가능하겠지만, UX 단순화를 위해 일괄 적용
    const updates = statTemplates.map((tpl) => ({
      id: tpl.id,
      max_value: newMax,
    }));

    for (const update of updates) {
      await supabase
        .from("stat_templates")
        .update({ max_value: update.max_value })
        .eq("id", update.id);
    }

    await loadTemplates(); // 최신 템플릿 정보 다시 로드
    setSettingsOpen(false);
  };

  if (loading) {
    return (
      <section className="bg-transparent">
        <h2 className="text-lg font-semibold mb-6 text-white">{title}</h2>
        <div className="text-sm text-gray-500">
          능력치 불러오는 중…
        </div>
      </section>
    );
  }

  // 대표 Max Value 가져오기 (없으면 기본 10)
  const currentMax = statTemplates.length > 0 ? statTemplates[0].max_value : 10;

  return (
    <section className="bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
          title="최대 수치 설정"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* 왼쪽: 레이더 차트 */}
        <div className="w-full lg:w-1/3 flex flex-col items-center">
          <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl w-full flex flex-col items-center justify-center aspect-square">
            {statTemplates.length >= 3 ? (
              <RadarChart
                stats={statTemplates.map((tpl) => {
                  // 평균값 계산 (StatCardsGrid 로직과 동일하게)
                  const values = targetStudentIds.map((studentId) => {
                    const stats = studentStatsMap[studentId] || [];
                    return (
                      stats.find((s) => s.stat_template_id === tpl.id)?.value ?? 0
                    );
                  });
                  const sum = values.reduce((a, b) => a + b, 0);
                  const avg =
                    values.length > 0 ? Math.round(sum / values.length) : 0;

                  return {
                    name: tpl.name,
                    value: avg,
                    max: tpl.max_value || 10,
                  };
                })}
                size={320}
              />
            ) : (
              <div className="text-center text-white/50 px-4">
                <p className="text-lg mb-2">📊</p>
                <p className="font-semibold text-white/80 mb-1">분석 그래프 준비 중</p>
                <p className="text-xs">
                  핵심 역량이 3개 이상일 때<br />
                  그래프가 표시됩니다.<br />
                  (현재: {statTemplates.length}개)
                </p>
              </div>
            )}
          </div>
          {statTemplates.length >= 3 && (
            <p className="text-white/40 text-xs mt-4 text-center">
              * 그래프는 {isMultiSelectMode ? "선택된 학생들의 평균" : "학생의 현재"}{" "}
              상태를 보여줍니다.
            </p>
          )}
        </div>

        {/* 오른쪽: 카드 그리드 */}
        <div className="flex-1 w-full">
          <StatCardsGrid
            statTemplates={statTemplates}
            studentStatsMap={studentStatsMap}
            selectedStudentIds={targetStudentIds}
            isMultiSelectMode={isMultiSelectMode}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            gridClass={
              statTemplates.length >= 3
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" // 차트 있을 때: 기본 2열, 아주 넓으면 3열
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // 차트 없을 때: 기존대로
            }
          />
        </div>
      </div>

      <ReasonModal
        open={reasonModalOpen}
        mode={pendingMode}
        statName={pendingStat?.name}
        targetCount={pendingTargetIds.length}
        reason={reason}
        onChangeReason={setReason}
        onConfirm={handleConfirmReason}
        onClose={() => setReasonModalOpen(false)}
      />

      <CompetencySettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentMax={currentMax}
        onUpdateMaxValue={handleUpdateMaxValue}
        onTemplatesUpdated={loadTemplates}
      />
    </section>
  );
}

export default CoreStatsSection;