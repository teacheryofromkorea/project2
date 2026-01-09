import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

/**
 * useBreakRoutine
 *
 * 쉬는시간 루틴 CRUD 전담 훅 (Refactored: Single Persistent Record)
 * - 기존: id를 props로 받아서 특정 루틴만 조작
 * - 변경: 가장 최신(created_at desc) 루틴을 가져옴 -> 없으면 자동 생성 ("쉬는시간 루틴")
 *
 * 책임:
 * - 쉬는시간 루틴 제목 조회 / 저장 (없으면 자동생성)
 * - 쉬는시간 루틴 항목 조회
 * - 추가 / 삭제 / 수정 / 순서 변경
 */
export default function useBreakRoutine() {
  const [routineItems, setRoutineItems] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [titleId, setTitleId] = useState(null);

  const [newContent, setNewContent] = useState("");
  const [editRoutine, setEditRoutine] = useState(null);
  const [editText, setEditText] = useState("");

  // 쉬는시간 루틴 항목 조회
  const fetchRoutineItems = useCallback(async (currentTitleId) => {
    // titleId가 없으면 조회 불가
    const targetId = currentTitleId || titleId;
    if (!targetId) return;

    const { data, error } = await supabase
      .from("break_routine_items")
      .select("*")
      .eq("routine_id", targetId)
      .order("order_index", { ascending: true });

    if (!error) {
      setRoutineItems(data || []);
    } else {
      handleSupabaseError(error, "쉬는시간 루틴 항목을 불러오지 못했어요.");
    }
  }, [titleId]);

  // 쉬는시간 루틴 제목 조회 (+없으면 생성)
  const fetchRoutineTitle = useCallback(async () => {
    // 1. 가장 최신 루틴 1개 조회
    const { data, error } = await supabase
      .from("break_routine_title")
      .select("id, title")
      .limit(1);

    if (error) {
      handleSupabaseError(error, "쉬는시간 루틴 제목을 불러오지 못했어요.");
      return;
    }

    let currentId = null;
    let currentTitle = "쉬는시간 루틴";

    // 2. 데이터가 있으면 사용
    if (data && data.length > 0) {
      currentId = data[0].id;
      currentTitle = data[0].title;
    } else {
      // 3. 없으면 생성
      const { data: newData, error: insertError } = await supabase
        .from("break_routine_title")
        .insert({
          title: "쉬는시간 루틴",
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("Break routine insert error:", insertError);
        handleSupabaseError(insertError, "쉬는시간 루틴 초기 생성 실패");
        return;
      }

      if (newData) {
        currentId = newData.id;
        currentTitle = newData.title;
      } else {
        // INSERT 후 데이터를 못 가져온 경우 다시 조회
        const { data: refetchData } = await supabase
          .from("break_routine_title")
          .select("id, title")
          .limit(1);

        if (refetchData && refetchData.length > 0) {
          currentId = refetchData[0].id;
          currentTitle = refetchData[0].title;
        }
      }
    }

    setTitleId(currentId);
    setRoutineTitle(currentTitle);
    setTempTitle(currentTitle);

    fetchRoutineItems(currentId);
  }, [fetchRoutineItems]);

  // 루틴 항목 추가
  const addRoutineItem = useCallback(async () => {
    if (!newContent.trim()) return;
    if (!titleId) return;

    const { error } = await supabase.from("break_routine_items").insert({
      routine_id: titleId,
      content: newContent, // 테이블 스키마에 따라 컬럼명 주의 (routine_items는 content, others는 text 일수도)
      // 기존 코드: content
      order_index: routineItems.length,
    });

    if (error) {
      handleSupabaseError(error, "할 일 추가에 실패했어요.");
    } else {
      setNewContent("");
      fetchRoutineItems();
    }
  }, [titleId, newContent, routineItems.length, fetchRoutineItems]);

  // 루틴 항목 삭제
  const deleteRoutineItem = useCallback(
    async (id) => {
      const { error } = await supabase.from("break_routine_items").delete().eq("id", id);
      if (error) {
        handleSupabaseError(error, "할 일 삭제에 실패했어요.");
      } else {
        fetchRoutineItems();
      }
    },
    [fetchRoutineItems]
  );

  // 루틴 항목 순서 이동
  const moveRoutine = useCallback(
    async (index, direction) => {
      const list = [...routineItems];

      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === list.length - 1)
      ) {
        return;
      }

      const current = list[index];
      const target =
        direction === "up" ? list[index - 1] : list[index + 1];

      await supabase
        .from("break_routine_items")
        .update({ order_index: target.order_index })
        .eq("id", current.id);

      await supabase
        .from("break_routine_items")
        .update({ order_index: current.order_index })
        .eq("id", target.id);

      fetchRoutineItems();
    },
    [routineItems, fetchRoutineItems]
  );

  // 루틴 항목 수정
  const updateRoutine = useCallback(async () => {
    if (!editRoutine || !editText.trim()) return;

    const { error } = await supabase
      .from("break_routine_items")
      .update({ content: editText })
      .eq("id", editRoutine.id);

    if (error) {
      handleSupabaseError(error, "할 일 수정에 실패했어요.");
    } else {
      setEditRoutine(null);
      setEditText("");
      fetchRoutineItems();
    }
  }, [editRoutine, editText, fetchRoutineItems]);

  // 루틴 제목 저장
  const saveRoutineTitle = useCallback(async () => {
    if (!titleId) return;

    const { error } = await supabase
      .from("break_routine_title")
      .update({ title: tempTitle })
      .eq("id", titleId);

    if (error) {
      handleSupabaseError(error, "제목 저장에 실패했어요.");
    } else {
      setRoutineTitle(tempTitle);
    }
  }, [titleId, tempTitle]);

  return {
    routineItems,
    routineTitle,
    tempTitle,
    setTempTitle,
    newContent,
    setNewContent,
    editRoutine,
    setEditRoutine,
    editText,
    setEditText,

    fetchRoutineItems,
    fetchRoutineTitle,
    addRoutineItem,
    deleteRoutineItem,
    moveRoutine,
    updateRoutine,
    saveRoutineTitle,
  };
}
