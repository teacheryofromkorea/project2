import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * useEndRoutine
 *
 * 하교시간 루틴 CRUD 전담 훅
 * - 점심시간(useLunchRoutine) 구조 복사
 * - 하교시간은 루틴 1세트 고정 (routine_id 없음)
 *
 * 책임:
 * - 하교 루틴 제목 조회 / 저장
 * - 하교 루틴 항목 조회
 * - 항목 추가 / 삭제 / 수정 / 순서 변경
 *
 * ❌ 학생, 미션, 체크 로직 포함하지 않음
 */
export default function useEndRoutine() {
  const [routineItems, setRoutineItems] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [titleId, setTitleId] = useState(null);

  const [newContent, setNewContent] = useState("");
  const [editRoutine, setEditRoutine] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchRoutineItems = useCallback(async () => {
    const { data } = await supabase
      .from("end_routine_items")
      .select("*")
      .order("order_index", { ascending: true });

    setRoutineItems(data || []);
  }, []);

  const fetchRoutineTitle = useCallback(async () => {
    const { data } = await supabase
      .from("end_routine_title")
      .select("id, title")
      .order("created_at", { ascending: true })
      .limit(1);

    if (!data || data.length === 0) return;

    setRoutineTitle(data[0].title);
    setTempTitle(data[0].title);
    setTitleId(data[0].id);
  }, []);

  const addRoutineItem = useCallback(async () => {
    if (!newContent.trim()) return;

    await supabase.from("end_routine_items").insert({
      text: newContent,
      order_index: routineItems.length,
    });

    setNewContent("");
    fetchRoutineItems();
  }, [newContent, routineItems.length, fetchRoutineItems]);

  const deleteRoutineItem = useCallback(
    async (id) => {
      await supabase.from("end_routine_items").delete().eq("id", id);
      fetchRoutineItems();
    },
    [fetchRoutineItems]
  );

  const moveRoutine = useCallback(
    async (index, direction) => {
      const list = [...routineItems];
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === list.length - 1)
      )
        return;

      const current = list[index];
      const target =
        direction === "up" ? list[index - 1] : list[index + 1];

      await supabase
        .from("end_routine_items")
        .update({ order_index: target.order_index })
        .eq("id", current.id);

      await supabase
        .from("end_routine_items")
        .update({ order_index: current.order_index })
        .eq("id", target.id);

      fetchRoutineItems();
    },
    [routineItems, fetchRoutineItems]
  );

  const updateRoutine = useCallback(async () => {
    if (!editRoutine || !editText.trim()) return;

    await supabase
      .from("end_routine_items")
      .update({ text: editText })
      .eq("id", editRoutine.id);

    setEditRoutine(null);
    setEditText("");
    fetchRoutineItems();
  }, [editRoutine, editText, fetchRoutineItems]);

  const saveRoutineTitle = useCallback(async () => {
    if (!tempTitle.trim() || !titleId) return;

    await supabase
      .from("end_routine_title")
      .update({ title: tempTitle })
      .eq("id", titleId);

    setRoutineTitle(tempTitle);
  }, [tempTitle, titleId]);

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