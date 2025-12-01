const routineItems = [
  "책가방 정리",
  "필기구 준비",
  "알림장 확인",
  "하루 계획 세우기",
];

function RoutineSidebar() {
  return (
    <aside className="bg-white/50 backdrop-blur rounded-3xl p-4 shadow-sm flex flex-col">
      <h2 className="text-2xl font-bold mb-4">✏️ 등교시 루틴</h2>

      <ul className="space-y-2 flex-1">
        {routineItems.map((text, idx) => (
          <li key={idx}>
            <button className="w-full bg-white rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:bg-pink-50 transition">
              {idx + 1}. {text}
            </button>
          </li>
        ))}
      </ul>

      <button className="mt-4 w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded-full">
        ✏️ 루틴 편집
      </button>
    </aside>
  );
}

export default RoutineSidebar;