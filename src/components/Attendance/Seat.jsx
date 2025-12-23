function Seat({ seat, student, isPresent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-xl border
        flex flex-col items-center justify-center
        aspect-square
        transition
        ${
          student
            ? isPresent
              ? "bg-green-100 border-green-400"
              : "bg-white border-gray-300 hover:bg-gray-50"
            : "bg-gray-100 border-dashed border-gray-300"
        }
      `}
    >
      {student ? (
        <>
          <div className="text-sm font-semibold text-gray-800">
            {student.name}
          </div>
          {student.number != null && (
            <div className="text-xs text-gray-500">
              {student.number}번
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-gray-400">빈 자리</div>
      )}

      {seat.label && (
        <div className="absolute bottom-1 right-1 text-[10px] text-gray-400">
          {seat.label}
        </div>
      )}
    </button>
  );
}

export default Seat; // 🔥 이 줄이 핵심