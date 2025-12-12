/**
 * 수업시간 – 좌측 학생 패널
 *
 * 역할:
 * - 수업 중 다루는 학생 리스트 영역
 * - 교시별 상점 표시 및 증가 (+ 버튼)
 * - 디자인은 청사진 단계 (구조 안정성 우선)
 */

export default function ClassStudentPanel({
  students = [],
  periodPoints = {},
  onAddPoint,
  selectedStudentIds = new Set(),
  onToggleSelect,
}) {
  return (
    <div className="bg-white/70 rounded-2xl shadow p-4 h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">
        👩‍🎓 학생 리스트
      </h3>

      {students.length === 0 ? (
        <p className="text-xs text-gray-400">
          학생 데이터를 불러오는 중입니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => {
            const point = periodPoints[student.id] || 0;

            return (
              <li
                key={student.id}
                onClick={() => onToggleSelect?.(student.id)}
                className={`flex items-center text-sm cursor-pointer rounded px-1
                  ${selectedStudentIds.has(student.id)
                    ? "bg-blue-100 ring-1 ring-blue-300"
                    : "hover:bg-gray-100"}
                `}
              >
                {/* 학생 이름 (왼쪽, 줄임 처리) */}
                <span className="font-medium text-gray-800 truncate flex-1 pr-2">
                  {student.name}
                </span>

                {/* 상점 컨트롤 (오른쪽 고정 영역) */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-blue-600 font-semibold min-w-[24px] text-right">
                    +{point}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPoint?.(student.id);
                    }}
                    className="px-2 py-0.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
