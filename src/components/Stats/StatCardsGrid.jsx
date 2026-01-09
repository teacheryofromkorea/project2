function StatCardsGrid({
  statTemplates = [],
  studentStatsMap = {},
  selectedStudentIds = [],
  isMultiSelectMode = false,
  onIncrease,
  onDecrease,
  gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}) {
  const getAverageValue = (statId) => {
    if (selectedStudentIds.length === 0) return 0;

    const values = selectedStudentIds.map((studentId) => {
      const stats = studentStatsMap[studentId] || [];
      return (
        stats.find(
          (s) => s.stat_template_id === statId
        )?.value ?? 0
      );
    });

    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  };

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {statTemplates.map((stat) => {
        const statValue = getAverageValue(stat.id);

        const percent =
          stat.max_value > 0
            ? (statValue / stat.max_value) * 100
            : 0;

        return (
          <div
            key={stat.id}
            className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/5 p-4 text-white shadow-lg"
          >
            {/* 상단: 아이콘 + 이름 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{stat.icon || "✨"}</span>
              <span className="font-semibold text-sm truncate flex-1">
                {stat.name}
              </span>
            </div>

            {/* 중앙: 점수 표시 */}
            <div className="text-2xl font-bold mb-3 text-center">
              {statValue} <span className="text-base text-white/50">/ {stat.max_value}</span>
            </div>

            {/* 프로그레스 바 */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* 하단: +/- 버튼 */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  onDecrease(
                    stat,
                    selectedStudentIds
                  )
                }
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold text-lg transition flex items-center justify-center"
              >
                −
              </button>

              <button
                onClick={() =>
                  onIncrease(
                    stat,
                    selectedStudentIds
                  )
                }
                className="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-300 font-bold text-lg transition flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatCardsGrid;