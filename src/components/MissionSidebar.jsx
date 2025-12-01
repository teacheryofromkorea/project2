const missions = ["알림장 적기", "교실 정리", "급식 예절 지키기"];

function MissionSidebar() {
  return (
    <aside className="bg-white/50 backdrop-blur rounded-3xl p-4 shadow-sm flex flex-col">
      <h2 className="text-2xl font-bold mb-4">🎯 오늘의 미션</h2>

      <ul className="space-y-2 flex-1">
        {missions.map((text, idx) => (
          <li key={idx}>
            <button className="w-full bg-white rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:bg-purple-50 transition">
              {idx + 1}. {text}
            </button>
          </li>
        ))}
      </ul>

      <button className="mt-4 w-full bg-purple-500 text-white text-sm font-semibold py-2 rounded-full">
        ✏️ 미션 편집
      </button>
    </aside>
  );
}

export default MissionSidebar;