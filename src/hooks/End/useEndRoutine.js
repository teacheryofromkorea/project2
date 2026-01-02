import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

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
    if (!titleId) return;

    const { data, error } = await supabase
      .from("end_routine_items")
      .select("*")
      .eq("title_id", titleId)
      .order("order_index", { ascending: true });

    if (error) {
      handleSupabaseError(error, "하교시간 루틴 목록을 불러오지 못했어요.");
      return;
    }

    setRoutineItems(data || []);
  }, [titleId]);

  const fetchRoutineTitle = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("end_routine_title")
      .select("id, title")
      .eq("date", today)
      .limit(1);

    if (error) {
      handleSupabaseError(error, "하교시간 루틴 제목을 불러오지 못했어요.");
      return;
    }

    if (!data || data.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from("end_routine_title")
        .insert({
          date: today,
          title: "하교시간 루틴",
        })
        .select()
        .single();

      if (insertError) {
        handleSupabaseError(insertError, "하교시간 루틴 제목 생성에 실패했어요.");
        return;
      }

      setTitleId(insertData.id);
      setRoutineTitle(insertData.title);
      setTempTitle(insertData.title);
      return;
    }

    setTitleId(data[0].id);
    setRoutineTitle(data[0].title);
    setTempTitle(data[0].title);
  }, []);

  const addRoutineItem = useCallback(async () => {
    if (!titleId) return;
    if (!newContent.trim()) return;

    const { error } = await supabase.from("end_routine_items").insert({
      title_id: titleId,
      text: newContent,
      order_index: routineItems.length,
    });
    handleSupabaseError(error, "하교시간 루틴 추가에 실패했어요.");

    setNewContent("");
    fetchRoutineItems();
  }, [newContent, routineItems.length, fetchRoutineItems, titleId]);

  const deleteRoutineItem = useCallback(
    async (id) => {
      const { error } = await supabase.from("end_routine_items").delete().eq("id", id);
      handleSupabaseError(error, "하교시간 루틴 삭제에 실패했어요.");
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

      const { error: error1 } = await supabase
        .from("end_routine_items")
        .update({ order_index: target.order_index })
        .eq("id", current.id);
      handleSupabaseError(error1, "하교시간 루틴 순서 변경에 실패했어요.");

      const { error: error2 } = await supabase
        .from("end_routine_items")
        .update({ order_index: current.order_index })
        .eq("id", target.id);
      handleSupabaseError(error2, "하교시간 루틴 순서 변경에 실패했어요.");

      fetchRoutineItems();
    },
    [routineItems, fetchRoutineItems]
  );

  const updateRoutine = useCallback(async () => {
    if (!editRoutine || !editText.trim()) return;

    const { error } = await supabase
      .from("end_routine_items")
      .update({ text: editText })
      .eq("id", editRoutine.id);
    handleSupabaseError(error, "하교시간 루틴 수정에 실패했어요.");

    setEditRoutine(null);
    setEditText("");
    fetchRoutineItems();
  }, [editRoutine, editText, fetchRoutineItems]);

  const saveRoutineTitle = useCallback(async () => {
    if (!tempTitle.trim() || !titleId) return;

    const { error } = await supabase
      .from("end_routine_title")
      .update({ title: tempTitle })
      .eq("id", titleId);

    if (error) {
      handleSupabaseError(error, "하교시간 루틴 제목 저장에 실패했어요.");
      return;
    }

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