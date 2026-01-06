/**
 * dateUtils.js
 * 
 * 날짜 및 시간 관련 유틸리티 함수들
 */

/**
 * 로컬 타임존(KST) 기준 'YYYY-MM-DD' 문자열을 반환합니다.
 * 
 * 기존 `new Date().toISOString().split('T')[0]` 방식은
 * 오전 9시 이전(KST)에 호출 시 "어제 날짜"가 나오는 버그가 있습니다.
 * 이를 방지하기 위해 로컬 시간을 기준으로 날짜를 추출합니다.
 */
export function getTodayString() {
    // 'en-CA' 로케일은 YYYY-MM-DD 형식을 반환합니다.
    return new Date().toLocaleDateString('en-CA');
}

/**
 * DB의 UTC 타임스탬프를 한국 시간 포맷으로 변환하여 표시합니다.
 * 예: "2024. 3. 15. 오후 2:30"
 */
export function formatDateTime(utcString) {
    if (!utcString) return "";
    return new Date(utcString).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
}
