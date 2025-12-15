/**
 * ClassStudentPanel
 * -----------------
 * 수업 화면 좌측에 표시되는 학생 리스트 패널
 *
 * 책임(What this component does):
 * 1. 수업 중 학생 목록 표시
 * 2. 선택된 교시 기준 상/벌점 표시
 * 3. 학생 선택(다중 선택) UI 제공
 * 4. 개별 학생 상점(+), 벌점(-) 버튼 처리
 *
 * 책임 아님(What this component does NOT do):
 * - 교시 상태 관리
 * - 상/벌점 누적 저장
 * - 학생 데이터 fetch
 *
 * 👉 순수 UI 컴포넌트 (state는 부모에서 내려받음)
 */

export default function ClassStudentPanel({
  // 학생 목록
  students = [],

  // { [studentId]: number } 형태의 교시별 상/벌점
  periodPoints = {},

  // 상점 / 벌점 핸들러 (부모에서 전달)
  onAddPoint,
  onRemovePoint,

  // 선택된 학생 id 집합 (다중 선택)
  selectedStudentIds = new Set(),

  // 학생 선택 토글 핸들러
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
            // 현재 교시에서의 학생 상/벌점 (없으면 0)
            const point = periodPoints[student.id] || 0;

            return (
              <li
                key={student.id}
                // 학생 선택 (상점 버튼 클릭 시에는 전파 중단)
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

                {/* 상점 컨트롤 영역 (우측 고정) */}
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`text-xs font-semibold min-w-[28px] text-right ${
                      point >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {point >= 0 ? `+${point}` : point}
                  </span>

                  {/* 벌점 (-) 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePoint?.(student.id);
                    }}
                    className="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    -
                  </button>

                  {/* 상점 (+) 버튼 */}
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
