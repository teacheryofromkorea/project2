import { useEffect, useMemo, useState, useRef } from "react";
import useCurrentTimeBlock from "./useCurrentTimeBlock";

/**
 * useClassTimeBlockSelection
 * -------------------------
 * 수업시간(Class) 교시 선택 "정책" 훅
 *
 * 이 훅은 UI가 아닌 "결정 규칙"만 담당한다.
 *
 * 선택 우선순위:
 * 1) 현재 시간이 수업시간(class)이면 → 해당 교시 자동 선택
 * 2) 수업시간이 아닐 경우 → 마지막으로 선택한 교시(localStorage) 복원
 * 3) 사용자가 수동으로 선택한 경우 → 그 선택을 최우선으로 유지
 *
 * 설계 특징:
 * - 여러 effect에서 결정을 하되, 실제 state 반영은 단일 effect에서만 수행
 *   (React setState 루프 / 경고 방지)
 * - UI, DB, 컴포넌트 구조에 의존하지 않는 순수 정책 훅
 *
 * 사용 위치 예:
 * - ClassPage (교시 상태의 source of truth)
 * - ClassResourceBoard (교시 선택 UI)
 */

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

  // 현재 선택된 수업시간 block_id (최종 선택 결과)
  const [selectedClassBlockId, setSelectedClassBlockId] = useState(null);

  // effect들에서 "다음에 선택할 교시"를 예약하는 임시 상태
  // → 실제 setState는 아래 단일 effect에서만 수행
  const [nextBlockId, setNextBlockId] = useState(null);

  // 사용자가 수동으로 교시를 선택했는지 여부
  const hasManualOverrideRef = useRef(false);

  // 어떤 activeBlock에서 수동 선택했는지 기록
  const manualOverrideForActiveIdRef = useRef(null);

  const selectedClassBlock = useMemo(() => {
    if (!selectedClassBlockId) return null;
    return classBlocks.find((b) => b.id === selectedClassBlockId) || null;
  }, [classBlocks, selectedClassBlockId]);

  // [정책 1]
  // 현재 시간이 수업시간(class)인 경우,
  // 해당 교시를 자동 선택 대상으로 예약
  useEffect(() => {
    if (!activeBlock) return;
    if (activeBlock.block_type !== "class") return;

    const isManualOverrideThisActive =
      hasManualOverrideRef.current &&
      manualOverrideForActiveIdRef.current === activeBlock.id;

    // 수동 선택 중이면 자동 선택 금지
    if (isManualOverrideThisActive) return;

    if (activeBlock.id === selectedClassBlockId) return;

    setNextBlockId(activeBlock.id);
  }, [activeBlock, selectedClassBlockId]);

  // [정책 2]
  // 현재 시간이 수업시간이 아닐 때,
  // 아직 선택이 없다면 마지막 선택(localStorage)을 복원
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

  // [단일 반영 지점]
  // 예약된 nextBlockId를 실제 선택 상태로 반영
  // → 모든 setSelectedClassBlockId는 여기서만 수행
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

  // 교시(activeBlock)가 바뀌면 수동 override 해제 → 다음 교시는 자동 선택 허용
  useEffect(() => {
    if (!activeBlock?.id) {
      hasManualOverrideRef.current = false;
      manualOverrideForActiveIdRef.current = null;
      return;
    }

    if (
      manualOverrideForActiveIdRef.current &&
      manualOverrideForActiveIdRef.current !== activeBlock.id
    ) {
      hasManualOverrideRef.current = false;
      manualOverrideForActiveIdRef.current = null;
    }
  }, [activeBlock]);

  // 사용자가 드롭다운 등에서 교시를 직접 선택할 때 사용하는 API
  // - 자동 선택 예약(nextBlockId)은 취소
  // - 선택 결과를 localStorage에 즉시 반영
  const selectClassBlockManually = (blockId) => {
    const value = blockId || null;

    // 수동 선택 기록
    hasManualOverrideRef.current = true;
    manualOverrideForActiveIdRef.current = activeBlock?.id ?? null;

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
