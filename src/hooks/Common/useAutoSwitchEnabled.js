/**
 * useAutoSwitchEnabled
 *
 * TopNav의 "자동 전환" 스위치 상태를 조회하는 공통 훅
 *
 * - true  : 자동 전환 ON
 * - false : 자동 전환 OFF
 *
 * ⚠️ 이 훅은 상태를 가지지 않는다.
 * ⚠️ localStorage 값만 "읽기 전용"으로 사용한다.
 *
 * 자동 전환 여부 판단이 필요한 모든 시간 관련 hook에서 사용한다.
 */
export function useAutoSwitchEnabled() {
  return localStorage.getItem("autoTabSwitch") !== "off";
}