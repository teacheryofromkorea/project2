import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import StatCardsGrid from "./StatCardsGrid";
import ReasonModal from "./ReasonModal";
import CompetencySettingsModal from "./CompetencySettingsModal";
import HorizontalStatChart from "./HorizontalStatChart";
import { Settings } from "lucide-react";
import confetti from "canvas-confetti";
import TicketGrantModal from "./TicketGrantModal";

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

  // 🎟️ 가챠 티켓 지급 기준 (Supabase에서 불러옴)
  const [statPerGacha, setStatPerGacha] = useState(5);

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(null); // "increase" | "decrease"
  const [pendingStat, setPendingStat] = useState(null);
  const [pendingTargetIds, setPendingTargetIds] = useState([]);
  const [reason, setReason] = useState("");

  const [settingsOpen, setSettingsOpen] = useState(false);

  // 🎟️ 티켓 지급 모달 상태
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [grantedStudentNames, setGrantedStudentNames] = useState([]);

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

  const loadStatPerGacha = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "stat_per_gacha")
      .maybeSingle();

    if (!error && data) {
      setStatPerGacha(parseInt(data.value, 10) || 5);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadStatPerGacha();
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
            // 🎟️ 설정된 기준을 넘긴 경우에만 티켓 지급
            const beforeTickets = Math.floor(beforeProgress / statPerGacha);
            const afterTickets = Math.floor(afterProgress / statPerGacha);
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

  // 🎟️ 가챠 티켓 직접 지급
  const handleGiveTicket = async () => {
    if (targetStudentIds.length === 0) return;

    for (const studentId of targetStudentIds) {
      await supabase.rpc("increment_gacha_ticket", {
        target_student_id: studentId,
      });
    }

    // 🎉 화려한 축하 효과
    // 티켓 모양 confetti (중앙에서 터짐)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef3c7"],
      shapes: ["square"],
      scalar: 1.2,
    });

    // 좌우에서 터지는 추가 confetti
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#fbbf24", "#f59e0b"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#fbbf24", "#f59e0b"],
      });
    }, 150);

    // 모달로 알림 (학생 이름 표시)
    const names = targetStudentIds.map((id) => {
      const student = students.find((s) => s.id === id);
      return student?.name || "알 수 없음";
    });
    setGrantedStudentNames(names);
    setTicketModalOpen(true);

    // 부모 컴포넌트에 변경 알림 (true = 백그라운드 업데이트, 로딩 스피너 X)
    if (onStudentsUpdated) {
      await onStudentsUpdated(true);
    }
  };

  return (
    <section className="bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>

        <div className="flex items-center gap-2">
          {/* 🎟️ 가챠 티켓 직접 지급 버튼 (숨쉬는 반짝임 효과) */}
          <button
            onClick={handleGiveTicket}
            disabled={targetStudentIds.length === 0}
            className={`
              relative px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300
              ${targetStudentIds.length > 0
                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-900 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95"
                : "bg-white/10 text-white/30 cursor-not-allowed"}
            `}
            title="가챠 티켓 1장 지급"
          >
            {/* 숨쉬는 글로우 효과 */}
            {targetStudentIds.length > 0 && (
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-50 blur-md animate-pulse -z-10" />
            )}
            <span className="flex items-center gap-1.5">
              <span>🎟️</span>
              <span>티켓 +1</span>
            </span>
          </button>

          {/* ⚙️ 설정 버튼 */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
            title="최대 수치 설정"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* 왼쪽: 수평 스탯 차트 */}
        <div className="w-full lg:w-1/3 flex flex-col h-full">
          <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl w-full flex-1">
            <HorizontalStatChart
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
                  icon: tpl.icon,
                  value: avg,
                  max: tpl.max_value || 10,
                };
              })}
            />
          </div>
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

      <TicketGrantModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        studentNames={grantedStudentNames}
        ticketCount={1}
      />
    </section>
  );
}

export default CoreStatsSection;