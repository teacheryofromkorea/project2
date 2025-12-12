import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * 현재 시간 기준 활성 time_block 계산 hook
 * - time_blocks.start_time <= now < end_time
 * - 매칭되는 block 1개 반환
 */
export default function useCurrentTimeBlock() {
  const [activeBlock, setActiveBlock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}:00`;

      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .lte("start_time", currentTime)
        .gt("end_time", currentTime)
        .order("order_index", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      setActiveBlock(error ? null : data);
      setLoading(false);
    }

    load();

    const timer = setInterval(load, 60 * 1000); // 1분마다 갱신
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return { activeBlock, loading };
}