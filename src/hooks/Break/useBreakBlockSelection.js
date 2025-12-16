import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import useCurrentTimeBlock from "../useCurrentTimeBlock";

/**
 * 쉬는시간 블록 선택 로직 전담 Hook
 *
 * 책임:
 * - 쉬는시간 블록 목록 조회
 * - 현재 시간에 따른 자동 선택
 * - 사용자 수동 선택 vs 자동 선택 정책
 * - localStorage 기반 마지막 선택 복원
 *
 * ⚠️ UI / 루틴 / 학생 / 미션 로직은 절대 포함하지 않음
 */
export default function useBreakBlockSelection() {
  const [breakBlocks, setBreakBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [nextBlockId, setNextBlockId] = useState(null);

  const { activeBlock } = useCurrentTimeBlock();

  // 자동 선택이 이미 한 번 수행되었는지 여부
  const autoSelectedRef = useRef(false);

  const LAST_BREAK_BLOCK_KEY = "lastBreakBlockId";

  /**
   * 쉬는시간 블록 목록 조회
   */
  const fetchBreakBlocks = useCallback(async () => {
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("block_type", "break")
      .order("order_index");

    if (!error) {
      setBreakBlocks(data ?? []);
    }
  }, []);

  /**
   * 최초 1회: 쉬는시간 블록 불러오기
   */
  useEffect(() => {
    fetchBreakBlocks();
  }, [fetchBreakBlocks]);

  /**
   * [정책 1]
   * 현재 시간이 쉬는시간(activeBlock)이고,
   * 아직 자동 선택을 하지 않았다면 → 해당 쉬는시간으로 자동 선택
   */
  useEffect(() => {
    if (!activeBlock) return;
    if (activeBlock.block_type !== "break") return;

    if (autoSelectedRef.current) return;
    if (activeBlock.id === selectedBlockId) return;

    setNextBlockId(activeBlock.id);
  }, [activeBlock, selectedBlockId]);

  /**
   * [정책 2]
   * 쉬는시간이 아닐 때 → localStorage에 저장된 마지막 선택 복원
   */
  useEffect(() => {
    if (!activeBlock || activeBlock.block_type === "break") return;

    const lastBlockId = localStorage.getItem(LAST_BREAK_BLOCK_KEY);
    if (!lastBlockId) return;

    const exists = breakBlocks.some((b) => b.id === lastBlockId);
    if (!exists) return;

    if (lastBlockId !== selectedBlockId) {
      setNextBlockId(lastBlockId);
    }
  }, [activeBlock, breakBlocks, selectedBlockId]);

  /**
   * [정책 3]
   * nextBlockId → selectedBlockId 반영
   * (실제 선택은 이 effect에서만 수행)
   */
  useEffect(() => {
    if (!nextBlockId) return;
    if (nextBlockId === selectedBlockId) return;

    setSelectedBlockId(nextBlockId);
    localStorage.setItem(LAST_BREAK_BLOCK_KEY, nextBlockId);

    autoSelectedRef.current = true;
    setNextBlockId(null);
  }, [nextBlockId, selectedBlockId]);

  return {
    breakBlocks,
    selectedBlockId,
    setSelectedBlockId,
  };
}
