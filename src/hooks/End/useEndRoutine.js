import { useState, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

/**
 * useEndRoutine
 *
 * 하교시간 루틴 CRUD 전담 훅 (Refactored: Single Persistent Record)
 * - 기존: 매일매일 새로운 날짜(date)로 루틴을 생성/복사 (History 방식)
 * - 변경: 날짜와 상관없이 "가장 최근에 생성된" 단 하나의 루틴 설정을 계속 사용/수정 (Config 방식)
 *
 * 로직:
 * 1. DB에서 가장 최신 end_routine_title을 하나 가져옵니다.
 * 2. 없으면 하나 생성합니다.
 * 3. 이후 모든 수정(아이템 추가/삭제/타이틀변경)은 이 ID를 대상으로 수행합니다.
 */
export default function useEndRoutine() {
  const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [titleId, setTitleId] = useState(null);

  const [routineItems, setRoutineItems] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [editRoutine, setEditRoutine] = useState(null);
  const [editText, setEditText] = useState("");

  // 중복 INSERT 방지용 락
  const isInsertingRef = useRef(false);

  /* ===============================
     1. 루틴 아이템 조회
     =============================== */
  const fetchRoutineItems = useCallback(async (currentTitleId) => {
    // titleId가 없으면 조회 불가 (state fallback)
    const targetId = currentTitleId || titleId;
    if (!targetId) return;

    const { data, error } = await supabase
      .from("end_routine_items")
      .select("*")
      .eq("title_id", currentTitleId)
      .order("order_index", { ascending: true });

    if (error) {
      handleSupabaseError(error, "하교시간 루틴 항목을 불러오지 못했어요.");
    } else {
      setRoutineItems(data || []);
    }
  }, []);

  /* ===============================
     2. 루틴 제목(설정) 조회 - 핵심 로직 변경
     =============================== */
  const fetchRoutineTitle = useCallback(async () => {
    // 1. 가장 최신 루틴 1개 조회 (날짜 무관)
    const { data, error } = await supabase
      .from("end_routine_title")
      .select("id, title")
      .order("created_at", { ascending: false }) // 최신순
      .limit(1);

    if (error) {
      handleSupabaseError(error, "하교시간 루틴 제목을 불러오지 못했어요.");
      return;
    }

    let currentId = null;
    let currentTitle = "하교시간 루틴";

    // 2. 데이터가 있으면 그 ID를 사용
    if (data && data.length > 0) {
      currentId = data[0].id;
      currentTitle = data[0].title;
    } else {
      // 3. 데이터가 아예 없으면(최초 사용) -> 하나 생성
      // 중복 INSERT 방지: 이미 진행 중이면 건너뛰고 잠시 후 refetch
      if (isInsertingRef.current) {
        // 다른 호출이 INSERT 중이므로 잠시 대기 후 refetch
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: waitData } = await supabase
          .from("end_routine_title")
          .select("id, title")
          .order("created_at", { ascending: false })
          .limit(1);

        if (waitData && waitData.length > 0) {
          currentId = waitData[0].id;
          currentTitle = waitData[0].title;
        }
      } else {
        // 락 획득
        isInsertingRef.current = true;

        const { data: newData, error: insertError } = await supabase
          .from("end_routine_title")
          .insert({
            title: "하교시간 루틴",
            date: new Date().toISOString().slice(0, 10),
          })
          .select()
          .maybeSingle();

        // 락 해제
        isInsertingRef.current = false;

        // 중복 키 에러(23505)면 이미 다른 곳에서 생성됨 -> 무시하고 refetch
        if (insertError && insertError.code !== "23505") {
          console.error("End routine insert error:", insertError);
          handleSupabaseError(insertError, "하교시간 루틴 초기 생성 실패");
          return;
        }

        if (newData) {
          currentId = newData.id;
          currentTitle = newData.title;
        } else {
          // INSERT 성공했지만 데이터 못가져왔거나, 중복 에러 발생 시 다시 조회
          const { data: refetchData } = await supabase
            .from("end_routine_title")
            .select("id, title")
            .order("created_at", { ascending: false })
            .limit(1);

          if (refetchData && refetchData.length > 0) {
            currentId = refetchData[0].id;
            currentTitle = refetchData[0].title;
          }
        }
      }
    }

    // 상태 업데이트
    setTitleId(currentId);
    setRoutineTitle(currentTitle);
    setTempTitle(currentTitle);

    // 해당 ID의 아이템들 조회
    fetchRoutineItems(currentId);
  }, [fetchRoutineItems]);

  /* ===============================
     3. 루틴 항목 추가
     =============================== */
  const addRoutineItem = useCallback(async () => {
    if (!newContent.trim() || !titleId) return;

    const { error } = await supabase.from("end_routine_items").insert({
      title_id: titleId,
      text: newContent,
      order_index: routineItems.length,
    });

    if (error) {
      handleSupabaseError(error, "할 일 추가에 실패했어요.");
    } else {
      setNewContent("");
      fetchRoutineItems(titleId);
    }
  }, [newContent, titleId, routineItems.length, fetchRoutineItems]);

  /* ===============================
     4. 루틴 항목 삭제
     =============================== */
  const deleteRoutineItem = useCallback(
    async (itemId) => {
      if (!titleId) return;

      const { error } = await supabase
        .from("end_routine_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        handleSupabaseError(error, "할 일 삭제에 실패했어요.");
      } else {
        fetchRoutineItems(titleId);
      }
    },
    [titleId, fetchRoutineItems]
  );

  /* ===============================
     5. 루틴 항목 순서 변경
     =============================== */
  const moveRoutine = useCallback(
    async (index, direction) => {
      if (!titleId) return;

      const list = [...routineItems];
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === list.length - 1)
      ) {
        return;
      }

      const current = list[index];
      const target = direction === "up" ? list[index - 1] : list[index + 1];

      // Optimistic Update (UI 먼저)
      const newList = [...list];
      // 순서는 DB 업데이트 후 fetch로 갱신되므로 UI state 직접 조작은 생략해도 되지만 
      // 깜빡임 방지를 위해 할 수도 있음. 여기선 DB기반 신뢰성 유지.

      await supabase
        .from("end_routine_items")
        .update({ order_index: target.order_index })
        .eq("id", current.id);

      await supabase
        .from("end_routine_items")
        .update({ order_index: current.order_index })
        .eq("id", target.id);

      fetchRoutineItems(titleId);
    },
    [routineItems, titleId, fetchRoutineItems]
  );

  /* ===============================
     6. 루틴 항목 내용 수정
     =============================== */
  const updateRoutine = useCallback(async () => {
    if (!editRoutine || !editText.trim() || !titleId) return;

    const { error } = await supabase
      .from("end_routine_items")
      .update({ text: editText })
      .eq("id", editRoutine.id);

    if (error) {
      handleSupabaseError(error, "할 일 수정에 실패했어요.");
    } else {
      setEditRoutine(null);
      setEditText("");
      fetchRoutineItems(titleId);
    }
  }, [editRoutine, editText, titleId, fetchRoutineItems]);

  /* ===============================
     7. 루틴 제목 저장
     =============================== */
  const saveRoutineTitle = useCallback(async () => {
    if (!tempTitle.trim() || !titleId) return;

    const { error } = await supabase
      .from("end_routine_title")
      .update({ title: tempTitle })
      .eq("id", titleId);

    if (error) {
      handleSupabaseError(error, "제목 저장에 실패했어요.");
    } else {
      setRoutineTitle(tempTitle);
    }
  }, [tempTitle, titleId]);

  return {
    routineTitle,
    tempTitle,
    setTempTitle,
    routineItems,

    newContent,
    setNewContent,
    editRoutine,
    setEditRoutine,
    editText,
    setEditText,

    fetchRoutineItems, // 이제 외부에서 호출 가능
    fetchRoutineTitle, // 이제 이 함수 하나로 초기화 (title + items)
    saveRoutineTitle,
    addRoutineItem,
    deleteRoutineItem,
    moveRoutine,
    updateRoutine,
  };
}