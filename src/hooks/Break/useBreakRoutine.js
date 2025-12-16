import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * useBreakRoutine
 *
 * 쉬는시간 루틴 CRUD 전담 훅
 *
 * 책임:
 * - 쉬는시간 루틴 제목 조회/저장
 * - 쉬는시간 루틴 항목 조회
 * - 추가 / 삭제 / 수정 / 순서 변경
 *
 * ❌ 학생 / 미션 / 시간 블록 로직 포함하지 않음
 */
export default function useBreakRoutine({ routineId }) {
  const [routineItems, setRoutineItems] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editRoutine, setEditRoutine] = useState(null);
  const [editText, setEditText] = useState("");

  // 쉬는시간 루틴 항목 조회
  const fetchRoutineItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("routine_items")
      .select("*")
      .eq("routine_id", routineId)
      .order("order_index", { ascending: true });

    if (!error) {
      setRoutineItems(data || []);
    }
  }, [routineId]);

  // 쉬는시간 루틴 제목 조회
  const fetchRoutineTitle = useCallback(async () => {
    const { data, error } = await supabase
      .from("routine_title")
      .select("title")
      .eq("id", routineId)
      .single();

    if (!error && data) {
      setRoutineTitle(data.title);
      setTempTitle(data.title);
    }
  }, [routineId]);

  // 루틴 항목 추가
  const addRoutineItem = useCallback(async () => {
    if (!newContent.trim()) return;

    await supabase.from("routine_items").insert({
      routine_id: routineId,
      content: newContent,
      order_index: routineItems.length,
    });

    setNewContent("");
    fetchRoutineItems();
  }, [routineId, newContent, routineItems.length, fetchRoutineItems]);

  // 루틴 항목 삭제
  const deleteRoutineItem = useCallback(
    async (id) => {
      await supabase.from("routine_items").delete().eq("id", id);
      fetchRoutineItems();
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
        .from("routine_items")
        .update({ order_index: target.order_index })
        .eq("id", current.id);

      await supabase
        .from("routine_items")
        .update({ order_index: current.order_index })
        .eq("id", target.id);

      fetchRoutineItems();
    },
    [routineItems, fetchRoutineItems]
  );

  // 루틴 항목 수정
  const updateRoutine = useCallback(async () => {
    if (!editRoutine || !editText.trim()) return;

    await supabase
      .from("routine_items")
      .update({ content: editText })
      .eq("id", editRoutine.id);

    setEditRoutine(null);
    setEditText("");
    fetchRoutineItems();
  }, [editRoutine, editText, fetchRoutineItems]);

  // 루틴 제목 저장
  const saveRoutineTitle = useCallback(async () => {
    await supabase
      .from("routine_title")
      .update({ title: tempTitle })
      .eq("id", routineId);

    setRoutineTitle(tempTitle);
    fetchRoutineTitle();
  }, [routineId, tempTitle, fetchRoutineTitle]);

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
