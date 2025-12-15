import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import RewardSummaryTable from "./RewardSummaryTable";

export default function RewardSummarySection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewardSummary = async () => {
      const { data, error } = await supabase
        .from("student_point_history")
        .select(`
          student_id,
          students (
            name,
            number
          ),
          delta
        `);

      if (error) {
        console.error("누적 상점 조회 실패", error);
        setLoading(false);
        return;
      }

      const summaryMap = {};

      data.forEach((row) => {
        const id = row.student_id;
        if (!summaryMap[id]) {
          summaryMap[id] = {
            student_id: id,
            name: row.students?.name ?? "이름없음",
            number: row.students?.number ?? 0,
            reward: 0, // 상점 (+)
            penalty: 0, // 벌점 (-)
          };
        }
        if (row.delta > 0) {
          summaryMap[id].reward += row.delta;
        } else if (row.delta < 0) {
          summaryMap[id].penalty += Math.abs(row.delta);
        }
      });

      const summaryList = Object.values(summaryMap).sort(
        (a, b) => b.reward - a.reward
      );

      setRows(summaryList);
      setLoading(false);
    };

    fetchRewardSummary();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/70 rounded-2xl shadow p-4 text-sm text-gray-500">
        누적 상점을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow p-4 space-y-3">
      <h2 className="text-lg font-bold text-gray-800">
        ⭐ 누적 상점 현황
      </h2>

      <RewardSummaryTable rows={rows} />
    </div>
  );
}