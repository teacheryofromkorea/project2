import BaseModal from "../common/BaseModal";

export default function ExchangeResultModal({ open, result, onClose }) {
  // result가 없으면 렌더링하지 않음 (isOpen이 true라도)
  if (!result) return null;

  const { type, pet, refund } = result;

  return (
    <BaseModal isOpen={open} onClose={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        {type === "new" && (
          <>
            <div className="text-2xl mb-2">🎉</div>
            <h2 className="text-lg font-bold mb-2">교환 성공!</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{pet.name}</strong> 펫을 획득했어요!
            </p>
          </>
        )}

        {type === "duplicate" && (
          <>
            <div className="text-2xl mb-2">♻️</div>
            <h2 className="text-lg font-bold mb-2">이미 가진 펫이에요</h2>
            <p className="text-sm text-gray-600 mb-4">
              조각 <strong>{refund}</strong>개를 돌려받았어요.
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2 text-white"
        >
          확인
        </button>
      </div>
    </BaseModal>
  );
}
