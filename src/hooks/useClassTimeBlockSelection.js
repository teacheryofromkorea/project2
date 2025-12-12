import { useEffect, useMemo, useState } from "react";
import useCurrentTimeBlock from "./useCurrentTimeBlock";

const LAST_CLASS_BLOCK_KEY = "lastClassBlockId";

/**
 * 수업시간(Class) 블록 선택 훅
 * 우선순위:
 * 1) 현재 시간이 수업시간이면(activeBlock.block_type === "class") 해당 block 자동 선택
 * 2) 수업시간이 아니면 마지막으로 선택했던 수업시간(localStorage) 복원
 * 3) 사용자가 수동으로 선택하면 그 선택을 저장/유지
 *
 * @param {Array<{id:string, name?:string, block_type?:string, start_time?:string, end_time?:string}>} classBlocks
 */
export default function useClassTimeBlockSelection(classBlocks = []) {
  const { activeBlock } = useCurrentTimeBlock();

  // 현재 선택된 수업시간 block_id
  const [selectedClassBlockId, setSelectedClassBlockId] = useState(null);

  // effect에서는 "결정"만 하고, 실제 반영은 한 곳에서 처리
  const [nextBlockId, setNextBlockId] = useState(null);

  const selectedClassBlock = useMemo(() => {
    if (!selectedClassBlockId) return null;
    return classBlocks.find((b) => b.id === selectedClassBlockId) || null;
  }, [classBlocks, selectedClassBlockId]);

  // 1) 현재 시간이 수업시간이면 → 해당 block 자동 선택 대상으로 예약
  useEffect(() => {
    if (!activeBlock) return;
    if (activeBlock.block_type !== "class") return;

    // 같은 값이면 불필요한 업데이트 방지
    if (activeBlock.id === selectedClassBlockId) return;

    setNextBlockId(activeBlock.id);
  }, [activeBlock, selectedClassBlockId]);

  // 2) 수업시간이 아닐 때 + 아직 선택이 없을 때 → 마지막 선택 복원
  useEffect(() => {
    // 현재 시간이 수업시간이면 복원 로직은 건너뜀 (자동 선택이 우선)
    if (activeBlock && activeBlock.block_type === "class") return;

    // 이미 선택되어 있으면 복원하지 않음
    if (selectedClassBlockId) return;

    const last = localStorage.getItem(LAST_CLASS_BLOCK_KEY);
    if (!last) return;

    // 현재 불러온 수업시간 목록에 존재하는 값만 복원
    const exists = classBlocks.some((b) => b.id === last);
    if (!exists) return;

    setNextBlockId(last);
  }, [activeBlock, classBlocks, selectedClassBlockId]);

  // 3) 예약된 nextBlockId를 실제 선택으로 반영 (단일 반영 지점)
  useEffect(() => {
    if (!nextBlockId) return;
    if (nextBlockId === selectedClassBlockId) {
      setNextBlockId(null);
      return;
    }

    setSelectedClassBlockId(nextBlockId);
    localStorage.setItem(LAST_CLASS_BLOCK_KEY, nextBlockId);
    setNextBlockId(null);
  }, [nextBlockId, selectedClassBlockId]);

  // 사용자가 드롭다운 등에서 수동으로 선택할 때 쓰는 헬퍼
  const selectClassBlockManually = (blockId) => {
    const value = blockId || null;
    setNextBlockId(null);
    setSelectedClassBlockId(value);

    if (value) {
      localStorage.setItem(LAST_CLASS_BLOCK_KEY, value);
    } else {
      localStorage.removeItem(LAST_CLASS_BLOCK_KEY);
    }
  };

  return {
    selectedClassBlockId,
    selectedClassBlock,
    selectClassBlockManually,
    setSelectedClassBlockId, // 필요하면 직접 제어 가능
  };
}
