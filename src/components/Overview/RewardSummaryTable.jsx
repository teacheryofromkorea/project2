export default function RewardSummaryTable({ rows = [] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        아직 저장된 상점 / 벌점 기록이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 px-2">번호</th>
            <th className="py-2 px-2">이름</th>
            <th className="py-2 px-2 text-right">⭐ 상점</th>
            <th className="py-2 px-2 text-right">⚠️ 벌점</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.student_id}
              className="border-b last:border-b-0"
            >
              <td className="py-2 px-2">{row.number}</td>
              <td className="py-2 px-2 font-medium">
                {row.name}
              </td>
              <td className="py-2 px-2 text-right font-semibold text-green-600">
                +{row.reward}
              </td>
              <td className="py-2 px-2 text-right font-semibold text-red-500">
                -{row.penalty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}