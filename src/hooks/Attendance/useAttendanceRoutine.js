import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";

/**
 * useAttendanceRoutine
 *
 * 등교시간 루틴 CRUD 전담 훅 (Refactored: Single Persistent Record)
 * - 테이블: attendance_routine_title / attendance_routine_items
 * - 동작: 가장 최신(created_at desc) 루틴을 가져옴 -> 없으면 자동 생성
 */
export default function useAttendanceRoutine() {
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
        const targetId = currentTitleId || titleId;
        if (!targetId) return;

        const { data, error } = await supabase
            .from("attendance_routine_items")
            .select("*")
            .eq("title_id", targetId)
            .order("order_index", { ascending: true });

        if (error) {
            handleSupabaseError(error, "등교시간 루틴 항목을 불러오지 못했어요.");
        } else {
            setRoutineItems(data || []);
        }
    }, [titleId]);

    /* ===============================
       루틴 제목 조회 (+없으면 생성)
       =============================== */
    const fetchRoutineTitle = useCallback(async () => {
        // 1. 가장 최신 루틴 1개 조회
        const { data, error } = await supabase
            .from("attendance_routine_title")
            .select("id, title")
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            handleSupabaseError(error, "등교시간 루틴 제목을 불러오지 못했어요.");
            return;
        }

        let currentId = null;
        let currentTitle = "등교시간 루틴";

        // 2. 데이터가 있으면 사용
        if (data && data.length > 0) {
            currentId = data[0].id;
            currentTitle = data[0].title;
        } else {
            // 3. 없으면 생성
            const { data: newData, error: insertError } = await supabase
                .from("attendance_routine_title")
                .insert({
                    title: "등교시간 루틴",
                })
                .select()
                .single();

            if (insertError) {
                handleSupabaseError(insertError, "등교시간 루틴 초기 생성 실패");
                return;
            }
            currentId = newData.id;
            currentTitle = newData.title;
        }

        setTitleId(currentId);
        setRoutineTitle(currentTitle);
        setTempTitle(currentTitle);

        fetchRoutineItems(currentId);
    }, [fetchRoutineItems]);

    /* ===============================
       루틴 항목 추가
       =============================== */
    /* ===============================
       루틴 항목 추가
       =============================== */
    const addRoutineItem = useCallback(async () => {
        if (!newContent.trim()) return;
        if (!titleId) return;

        const { error } = await supabase.from("attendance_routine_items").insert({
            title_id: titleId,
            text: newContent,
            order_index: routineItems.length,
        });

        if (error) {
            handleSupabaseError(error, "할 일 추가에 실패했어요.");
        } else {
            setNewContent("");
            fetchRoutineItems();
            window.dispatchEvent(new Event("routines:updated"));
        }
    }, [newContent, titleId, routineItems.length, fetchRoutineItems]);

    /* ===============================
       루틴 항목 삭제
       =============================== */
    const deleteRoutineItem = useCallback(
        async (id) => {
            const { error } = await supabase
                .from("attendance_routine_items")
                .delete()
                .eq("id", id);

            if (error) {
                handleSupabaseError(error, "할 일 삭제에 실패했어요.");
            } else {
                fetchRoutineItems();
                window.dispatchEvent(new Event("routines:updated"));
            }
        },
        [fetchRoutineItems]
    );

    /* ===============================
       루틴 항목 순서 이동
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

            await supabase
                .from("attendance_routine_items")
                .update({ order_index: target.order_index })
                .eq("id", current.id);

            await supabase
                .from("attendance_routine_items")
                .update({ order_index: current.order_index })
                .eq("id", target.id);

            fetchRoutineItems();
            window.dispatchEvent(new Event("routines:updated"));
        },
        [routineItems, titleId, fetchRoutineItems]
    );

    /* ===============================
       루틴 항목 수정
       =============================== */
    const updateRoutine = useCallback(async () => {
        if (!editRoutine || !editText.trim()) return;

        const { error } = await supabase
            .from("attendance_routine_items")
            .update({ text: editText })
            .eq("id", editRoutine.id);

        if (error) {
            handleSupabaseError(error, "할 일 수정에 실패했어요.");
        } else {
            setEditRoutine(null);
            setEditText("");
            fetchRoutineItems();
            window.dispatchEvent(new Event("routines:updated"));
        }
    }, [editRoutine, editText, fetchRoutineItems]);

    /* ===============================
       루틴 제목 저장
       =============================== */
    const saveRoutineTitle = useCallback(async () => {
        if (!titleId) return;

        const { error } = await supabase
            .from("attendance_routine_title")
            .update({ title: tempTitle })
            .eq("id", titleId);

        if (error) {
            handleSupabaseError(error, "제목 저장에 실패했어요.");
        } else {
            setRoutineTitle(tempTitle);
            window.dispatchEvent(new Event("routines:updated"));
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
