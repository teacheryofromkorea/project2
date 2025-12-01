function StudentCard({ name, isPresent, onToggle }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 p-3 shadow-sm flex flex-col justify-between">
      <div className="text-sm font-semibold text-gray-800 mb-3 text-center">
        {name}
      </div>

      <button
        onClick={onToggle}
        className={`w-full rounded-full py-1.5 text-xs font-semibold transition ${
          isPresent
            ? "bg-green-500 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {isPresent ? "출석 완료" : "출석"}
      </button>
    </div>
  );
}

export default StudentCard;