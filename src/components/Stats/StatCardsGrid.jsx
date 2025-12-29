function StatCardsGrid({
  statTemplates = [],
  studentStatsMap = {},
  selectedStudentIds = [],
  isMultiSelectMode = false,
  onIncrease,
  onDecrease,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {statTemplates.map((stat) => {
        const statValue = getAverageValue(stat.id);

        const percent =
          stat.max_value > 0
            ? (statValue / stat.max_value) * 100
            : 0;

        return (
          <div
            key={stat.id}
            className="relative rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/10 p-5 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="font-semibold">
                {stat.name}
              </span>
            </div>

            <div className="text-3xl font-bold mb-2">
              {statValue} / {stat.max_value}
            </div>

            <div className="w-full h-3 bg-gray-200 rounded">
              <div
                className={`h-3 rounded ${stat.color}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() =>
                  onDecrease(
                    stat,
                    selectedStudentIds
                  )
                }
                className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold"
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
                className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 font-bold"
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