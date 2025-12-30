import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import StatCardsGrid from "./StatCardsGrid";
import ReasonModal from "./ReasonModal";
// 🎟️ 가챠 쿠폰 지급 기준: 능력치 5 누적당 1장
const STAT_PER_GACHA = 5;

function CoreStatsSection({
  students = [],
  selectedStudentId,
  selectedStudentIds = [],
  isMultiSelectMode = false,
}) {
  const [statTemplates, setStatTemplates] = useState([]);
  const [studentStatsMap, setStudentStatsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(null); // "increase" | "decrease"
  const [pendingStat, setPendingStat] = useState(null);
  const [pendingTargetIds, setPendingTargetIds] = useState([]);
  const [reason, setReason] = useState("");

  const targetStudentIds = isMultiSelectMode
    ? selectedStudentIds
    : selectedStudentId
      ? [selectedStudentId]
      : [];

  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId
  );

  const title = isMultiSelectMode
    ? "선택된 학생들의 핵심 역량"
    : selectedStudent
      ? `${selectedStudent.name}의 핵심 역량`
      : "핵심 역량";

  useEffect(() => {
    async function loadTemplates() {
      const { data, error } = await supabase
        .from("stat_templates")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error) {
        setStatTemplates(data || []);
      }
    }

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
      // 🎟️ 능력치 5 누적당 가챠 쿠폰 지급
      if (delta === 1) {
        const beforeTickets = Math.floor(currentValue / STAT_PER_GACHA);
        const afterTickets = Math.floor(nextValue / STAT_PER_GACHA);
        const ticketToGive = afterTickets - beforeTickets;

        // 누적 기준을 넘긴 경우에만 지급
        for (let i = 0; i < ticketToGive; i++) {
          await supabase.rpc("increment_gacha_ticket", {
            target_student_id: studentId,
          });
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

    setReasonModalOpen(false);
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

  return (
    <section className="bg-transparent">
      <h2 className="text-lg font-semibold mb-6 text-white">{title}</h2>

      <StatCardsGrid
        statTemplates={statTemplates}
        studentStatsMap={studentStatsMap}
        selectedStudentIds={targetStudentIds}
        isMultiSelectMode={isMultiSelectMode}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
      />

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
    </section>
  );
}

export default CoreStatsSection;