import { useLock } from "../context/LockContext";

/**
 * LockButton
 * - locked: 현재 잠금 상태 (boolean)
 * - onLock: 잠금 처리 함수
 * - onUnlock: 잠금 해제 처리 함수
 */
export default function LockButton() {
  const { locked, lock, unlockWithPIN } = useLock();

  const handleClick = () => {
    if (!locked) {
      lock(); // localStorage에 즉시 저장됨
      return;
    }

    unlockWithPIN();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "px-3 py-2 rounded-xl font-semibold transition " +
        (locked
          ? "bg-gray-800 text-white hover:bg-gray-900"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300")
      }
      title={locked ? "잠금 해제" : "잠그기"}
    >
      {locked ? "🔓 잠금 해제" : "🔒 잠그기"}
    </button>
  );
}
