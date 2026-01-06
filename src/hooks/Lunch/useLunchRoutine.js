import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

/**
 * useLunchRoutine
 *
 * 점심시간 루틴 CRUD 전담 훅 (Refactored: Single Persistent Record)
 * - 기존: 가장 오래된(created_at asc) 루틴을 가져옴 -> 없으면 동작 안함
 * - 변경: 가장 최신(created_at desc) 루틴을 가져옴 -> 없으면 자동 생성
 *
 * 책임:
 * - 점심 루틴 제목 조회 / 저장 (없으면 자동생성)
 * - 점심 루틴 항목 조회
 * - 항목 추가 / 삭제 / 수정 / 순서 변경
 */
export default function useLunchRoutine() {
  /* ===============================
     상태
     =============================== */
  const [routineItems, setRoutineItems] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [titleId, setTitleId] = useState(null);

  const [newContent, setNewContent] = useState("");
  const [editRoutine, setEditRoutine] = useState(null);
  const [editText, setEditText] = useState("");

  /* ===============================
     루틴 항목 조회
     =============================== */
  const fetchRoutineItems = useCallback(async (currentTitleId) => {
    // titleId를 인자로 받거나 상태에서 사용 (초기 로딩 시 인자 사용)
    const targetId = currentTitleId || titleId;
    if (!targetId) return;

    const { data, error } = await supabase
      .from("lunch_routine_items")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      handleSupabaseError(error, "점심시간 루틴 목록을 불러오지 못했어요.");
      return;
    }
    setRoutineItems(data || []);
  }, [titleId]);

  /* ===============================
     루틴 제목 조회 (+없으면 생성)
     =============================== */
  const fetchRoutineTitle = useCallback(async () => {
    // 1. 가장 최신 루틴 1개 조회
    const { data, error } = await supabase
      .from("lunch_routine_title")
      .select("id, title")
      .order("created_at", { ascending: false }) // 최신순
      .limit(1);

    if (error) {
      handleSupabaseError(error, "점심시간 루틴 제목을 불러오지 못했어요.");
      return;
    }

    let currentId = null;
    let currentTitle = "점심시간 루틴";

    // 2. 데이터가 있으면 사용
    if (data && data.length > 0) {
      currentId = data[0].id;
      currentTitle = data[0].title;
    } else {
      // 3. 없으면 생성
      const { data: newData, error: insertError } = await supabase
        .from("lunch_routine_title")
        .insert({
          title: "점심시간 루틴",
          // date 컬럼이 필수인지 확인 필요. 보통 default now()거나 null 허용이면 생략 가능.
          // 기존 코드 참조하니 date 컬럼을 안 넣었었음.
        })
        .select()
        .single();

      if (insertError) {
        handleSupabaseError(insertError, "점심시간 루틴 초기 생성 실패");
        return;
      }
      currentId = newData.id;
      currentTitle = newData.title;
    }

    setTitleId(currentId);
    setRoutineTitle(currentTitle);
    setTempTitle(currentTitle);

    // 아이템 조회 (기존엔 FK가 없어서 그냥 불렀음)
    fetchRoutineItems(currentId);
  }, [fetchRoutineItems]);

  /* ===============================
     루틴 항목 추가
     =============================== */
  const addRoutineItem = useCallback(async () => {
    if (!newContent.trim()) return;

    // lunch_routine_items에 title_id가 없다면 그냥 insert
    // 하지만 만약 나중에 구조를 맞춘다면 title_id를 넣어야 함.
    // 기존 코드: .insert({ text: ..., order_index: ... }) -> title_id 없음.
    // 따라서 여기도 그대로 유지. 단, "단일 설정"이므로 큰 문제 없음.

    const { error } = await supabase.from("lunch_routine_items").insert({
      text: newContent,
      order_index: routineItems.length,
    });
    handleSupabaseError(error, "점심시간 루틴 추가에 실패했어요.");

    setNewContent("");
    fetchRoutineItems();
  }, [newContent, routineItems.length, fetchRoutineItems]);

  /* ===============================
     루틴 항목 삭제
     =============================== */
  const deleteRoutineItem = useCallback(
    async (id) => {
      const { error } = await supabase.from("lunch_routine_items").delete().eq("id", id);
      handleSupabaseError(error, "점심시간 루틴 삭제에 실패했어요.");
      fetchRoutineItems();
    },
    [fetchRoutineItems]
  );

  /* ===============================
     루틴 항목 순서 이동
     =============================== */
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

      const { error: error1 } = await supabase
        .from("lunch_routine_items")
        .update({ order_index: target.order_index })
        .eq("id", current.id);
      handleSupabaseError(error1, "점심시간 루틴 순서 변경에 실패했어요.");

      const { error: error2 } = await supabase
        .from("lunch_routine_items")
        .update({ order_index: current.order_index })
        .eq("id", target.id);
      handleSupabaseError(error2, "점심시간 루틴 순서 변경에 실패했어요.");

      fetchRoutineItems();
    },
    [routineItems, fetchRoutineItems]
  );

  /* ===============================
     루틴 항목 수정
     =============================== */
  const updateRoutine = useCallback(async () => {
    if (!editRoutine || !editText.trim()) return;

    const { error } = await supabase
      .from("lunch_routine_items")
      .update({ text: editText })
      .eq("id", editRoutine.id);
    handleSupabaseError(error, "점심시간 루틴 수정에 실패했어요.");

    setEditRoutine(null);
    setEditText("");
    fetchRoutineItems();
  }, [editRoutine, editText, fetchRoutineItems]);

  /* ===============================
     루틴 제목 저장
     =============================== */
  const saveRoutineTitle = useCallback(async () => {
    if (!tempTitle.trim()) return;
    if (!titleId) return;

    const { error } = await supabase
      .from("lunch_routine_title")
      .update({ title: tempTitle })
      .eq("id", titleId);

    if (error) {
      handleSupabaseError(error, "점심시간 루틴 제목 저장에 실패했어요.");
      return;
    }

    setRoutineTitle(tempTitle);
  }, [tempTitle, titleId]);

  return {
    // 상태
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

    // 액션
    fetchRoutineItems,
    fetchRoutineTitle,
    addRoutineItem,
    deleteRoutineItem,
    moveRoutine,
    updateRoutine,
    saveRoutineTitle,
  };
}
