export function handleSupabaseError(error, fallbackMessage = "저장에 실패했어요. 잠시 후 다시 시도해주세요.") {
  if (!error) return;

  console.error("[Supabase Error]", error);

  // 최소 UX: 사용자에게는 공통 메시지만
  alert(fallbackMessage);
}