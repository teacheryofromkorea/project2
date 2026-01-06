import { useCallback, useState } from "react";
import { getTodayString } from "../../utils/dateUtils";
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
    const today = getTodayString();

    // 1. 오늘 날짜의 루틴이 있는지 확인
    const { data, error } = await supabase
      .from("end_routine_title")
      .select("id, title")
      .eq("date", today)
      .limit(1);

    if (error) {
      handleSupabaseError(error, "하교시간 루틴 제목을 불러오지 못했어요.");
      return;
    }

    // 2. 오늘 날짜 루틴이 있으면 -> 상태 업데이트 후 종료
    if (data && data.length > 0) {
      setTitleId(data[0].id);
      setRoutineTitle(data[0].title);
      setTempTitle(data[0].title);
      return;
    }

    // 3. 오늘 날짜 루틴이 없으면 -> '가장 최근' 날짜의 루틴을 찾아서 복사
    const { data: prevData } = await supabase
      .from("end_routine_title")
      .select("id, title")
      .lt("date", today)
      .order("date", { ascending: false })
      .limit(1);

    let newTitle = "하교시간 루틴";
    let prevItems = [];

    // 이전 기록이 있다면 제목과 ID 가져오기 (항목 복사를 위해)
    if (prevData && prevData.length > 0) {
      newTitle = prevData[0].title;
      const prevId = prevData[0].id;

      // 이전 루틴 항목들 가져오기
      const { data: prevItemsData } = await supabase
        .from("end_routine_items")
        .select("text, order_index")
        .eq("title_id", prevId);

      if (prevItemsData) prevItems = prevItemsData;
    }

    // 4. 오늘 날짜로 새로 생성 (제목은 이전 것 or 기본값)
    const { data: insertData, error: insertError } = await supabase
      .from("end_routine_title")
      .insert({
        date: today,
        title: newTitle,
      })
      .select()
      .single();

    if (insertError) {
      handleSupabaseError(insertError, "하교시간 루틴 제목 생성에 실패했어요.");
      return;
    }

    const newRoutineId = insertData.id;

    // 5. 이전 항목들이 있었다면 -> 오늘 생성된 ID로 복사해서 Insert
    if (prevItems.length > 0) {
      const itemsToInsert = prevItems.map((item) => ({
        title_id: newRoutineId,
        text: item.text,
        order_index: item.order_index,
      }));

      const { error: itemsError } = await supabase
        .from("end_routine_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("이전 루틴 항목 복사 실패:", itemsError);
        // 에러가 나도 타이틀은 생성되었으므로 치명적이지 않음 (빈 루틴으로 시작)
      }
    }

    // 6. 상태 업데이트
    setTitleId(newRoutineId);
    setRoutineTitle(insertData.title);
    setTempTitle(insertData.title);

    // 항목까지 복사했으므로 UI에 즉시 반영되도록 fetchItems 호출 (권장)
    // 하지만 여기서 setState(routineItems)를 직접 하기보다
    // 호출자가 useEffect로 의존성을 가지고 다시 fetch하게 하거나,
    // 여기서 setTitleId가 바뀌면 fetchRoutineItems가 트리거될 수 있음.
    // (useEffect 의존성: [titleId]) -> setTitleId(newRoutineId) 했으니 fetchRoutineItems 자동 실행됨.
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