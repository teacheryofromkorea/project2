import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * useInitClassResources
 * --------------------
 * 최초 진입 시 1회,
 * 수업 도구 템플릿(class_resource_templates)을
 * 실제 수업 도구(class_resources)로 복사하는 초기화 훅
 *
 * - StrictMode 중복 실행 방지
 * - 이미 데이터가 있으면 아무 작업도 하지 않음
 */
export default function useInitClassResources() {
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const ensureClassResources = async () => {
      // 1. 기존 수업 도구 존재 여부 확인
      const { count, error: countError } = await supabase
        .from("class_resources")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("class_resources count 오류", countError);
        return;
      }

      // 이미 데이터가 있으면 종료
      if (count && count > 0) return;

      // 2. 템플릿 불러오기
      const { data: templates, error: templateError } = await supabase
        .from("class_resource_templates")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (templateError) {
        console.error("템플릿 불러오기 오류", templateError);
        return;
      }

      if (!templates || templates.length === 0) return;

      // 3. 템플릿 → 실제 수업 도구 복사
      const resources = templates.map((t) => ({
        title: t.title,
        url: t.url,
        icon: t.icon,
        description: t.description,
        order_index: t.order_index,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from("class_resources")
        .insert(resources);

      if (insertError) {
        console.error("class_resources 템플릿 복사 오류", insertError);
      }
    };

    ensureClassResources();
  }, []);
}