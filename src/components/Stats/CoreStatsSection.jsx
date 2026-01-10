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
  onOptimisticStatUpdate,
  onOptimisticLog,
  externalStatUpdate,
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

  /* 
    모달 관련 로직은 이제 사용되지 않을 수 있지만, 
    추후 '길게 눌러서 사유 입력' 등의 기능을 위해 openReasonModal 함수 자체는 남겨둘 수 있습니다.
    하지만 현재 요구사항(즉시 반영)에 맞춰 handleIncrease/Decrease에서는 직접 실행합니다.
  */
  const openReasonModal = (mode, stat, targetIds) => {
    setPendingMode(mode);
    setPendingStat(stat);
    setPendingTargetIds(targetIds);
    setReason("");
    setReasonModalOpen(true);
  };

  // 🔄 외부(PraiseHistory)에서 변경된 스탯 반영 (로그 삭제 시)
  useEffect(() => {
    if (externalStatUpdate) {
      const { studentId, statId, delta } = externalStatUpdate;

      setStudentStatsMap((prevMap) => {
        const currentStats = prevMap[studentId] || [];
        const statIndex = currentStats.findIndex(
          (s) => s.stat_template_id === statId
        );

        if (statIndex === -1) return prevMap; // 없으면 무시

        const existingStat = currentStats[statIndex];
        const nextValue = Math.max(0, existingStat.value + delta);

        if (existingStat.value === nextValue) return prevMap; // 변화 없으면 무시

        const newStats = [...currentStats];
        newStats[statIndex] = { ...existingStat, value: nextValue };

        return {
          ...prevMap,
          [studentId]: newStats,
        };
      });

      // Gacha Progress도 업데이트
      if (onOptimisticStatUpdate) {
        onOptimisticStatUpdate({
          studentId,
          delta,
          statPerGacha
        });
      }
    }
  }, [externalStatUpdate]);

  const handleDecrease = (stat, targetIds) => {
    // 모달 없이 즉시 감소 (사유 없음)
    executeStatUpdate(stat, "decrease", targetIds, "");
  };

  // 🚀 통합 업데이트 로직 (Quick Update & Reason Update 공용)
  const executeStatUpdate = async (stat, mode, targetIds, reasonText) => {
    if (!stat || targetIds.length === 0) return;

    const delta = mode === "increase" ? 1 : -1;
    const currentMap = { ...studentStatsMap };
    const updatesToPersist = [];

    // 🚀 Optimistic Update: 즉시 UI 반영
    targetIds.forEach((studentId) => {
      const currentStats = currentMap[studentId] || [];
      const statIndex = currentStats.findIndex(
        (s) => s.stat_template_id === stat.id
      );

      let currentValue = 0;
      let existingStat = null;

      if (statIndex > -1) {
        existingStat = currentStats[statIndex];
        currentValue = existingStat.value;
      }

      const nextValue = Math.min(
        stat.max_value,
        Math.max(0, currentValue + delta)
      );

      // 값이 변하지 않으면 skip
      if (nextValue === currentValue) return;

      // 상태 업데이트를 위한 새로운 객체 생성
      const updatedStat = existingStat
        ? { ...existingStat, value: nextValue }
        : {
          student_id: studentId,
          stat_template_id: stat.id,
          value: nextValue,
        };

      // 맵 업데이트
      const newStats = [...currentStats];
      if (statIndex > -1) {
        newStats[statIndex] = updatedStat;
      } else {
        newStats.push(updatedStat);
      }
      currentMap[studentId] = newStats;

      // DB 저장을 위한 정보 수집
      updatesToPersist.push({
        studentId,
        nextValue,
        statId: stat.id,
      });
    });

    // 상태 즉시 반영 및 모달 닫기
    setStudentStatsMap(currentMap);
    setReasonModalOpen(false);

    // 🚀 Optimistic Update: 상위 컴포넌트(Gacha Progress/Tickets) 즉시 반영
    if (onOptimisticStatUpdate) {
      targetIds.forEach((studentId) => {
        onOptimisticStatUpdate({
          studentId,
          delta,
          statPerGacha,
        });

        // 🚀 Optimistic Update: 칭찬 히스토리 즉시 반영
        if (onOptimisticLog) {
          const student = studentsMap[studentId]; // studentsMap 사용 (미리 만들어둠)
          if (student) {
            const tempLog = {
              id: `temp-${Date.now()}-${studentId}`,
              created_at: new Date().toISOString(),
              delta,
              reason: reasonText,
              student: {
                id: student.id,
                name: student.name,
                number: student.number,
                gender: student.gender,
              },
              stat: {
                id: stat.id,
                name: stat.name,
                icon: stat.icon,
                color: stat.color,
              },
            };
            onOptimisticLog(tempLog);
          }
        }
      });
    }

    // 📡 Background Sync: 서버 통신은 백그라운드에서 처리
    try {
      for (const update of updatesToPersist) {
        // 1️⃣ student_stats upsert
        await supabase.from("student_stats").upsert(
          {
            student_id: update.studentId,
            stat_template_id: update.statId,
            value: update.nextValue,
          },
          {
            onConflict: "student_id,stat_template_id",
          }
        );

        // 2️⃣ 로그 기록
        await supabase.from("student_stat_logs").insert({
          student_id: update.studentId,
          stat_template_id: update.statId,
          delta,
          reason: reasonText,
        });

        // 3️⃣ Gacha Progress & Ticket handling (증가일 때만)
        if (delta === 1) {
          const { data: progressRow, error: progressReadError } = await supabase
            .from("students")
            .select("gacha_progress")
            .eq("id", update.studentId)
            .maybeSingle();

          if (!progressReadError) {
            const beforeProgress = progressRow?.gacha_progress ?? 0;
            const afterProgress = beforeProgress + 1;

            const { error: progressUpdateError } = await supabase
              .from("students")
              .update({ gacha_progress: afterProgress })
              .eq("id", update.studentId);

            if (!progressUpdateError) {
              // 🎟️ 설정된 기준을 넘긴 경우에만 티켓 지급
              const beforeTickets = Math.floor(beforeProgress / statPerGacha);
              const afterTickets = Math.floor(afterProgress / statPerGacha);
              const ticketToGive = afterTickets - beforeTickets;

              for (let i = 0; i < ticketToGive; i++) {
                await supabase.rpc("increment_gacha_ticket", {
                  target_student_id: update.studentId,
                });
              }
            }
          }
        }
      }

      // 🔄 최종 데이터 일관성을 위해 백그라운드에서 조용히 재동기화 (옵션)
      // onStudentsUpdated(true); // true = silent update
    } catch (error) {
      console.error("Optimistic update failed:", error);
      // 에러 발생 시 여기서 상태 롤백 로직을 추가할 수도 있음
      // 현재는 간단히 에러 로그만 출력하고 유지 (다음 fetch에서 보정됨)
    }
  };

  const handleConfirmReason = async () => {
    await executeStatUpdate(pendingStat, pendingMode, pendingTargetIds, reason);
  };

  const handleIncreaseQuick = (stat, targetIds) => {
    executeStatUpdate(stat, "increase", targetIds, "");
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
            onDecrease={handleDecrease}
            onIncrease={handleIncreaseQuick}
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