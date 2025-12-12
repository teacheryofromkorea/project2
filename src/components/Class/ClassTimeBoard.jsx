import { supabase } from "../../lib/supabaseClient";
import useClassTimeBlockSelection from "../../hooks/useClassTimeBlockSelection";

/**
 * 수업시간 테스트용 보드 (최소 UI)
 * - 드롭다운으로 수업시간 선택
 * - 현재 선택된 수업시간 표시
 * - 자동 전환 / 수동 선택 / localStorage 복원 검증용
 */
export default function ClassTimeBoard({ classBlocks = [] }) {
  const {
    selectedClassBlockId,
    selectedClassBlock,
    selectClassBlockManually,
  } = useClassTimeBlockSelection(classBlocks);

  return (
    <div className="bg-white/70 rounded-2xl shadow p-4 space-y-3">
      <h3 className="text-lg font-bold text-gray-800">
        🧪 수업시간 테스트 보드
      </h3>

      {/* 수업시간 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">수업시간 선택</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={selectedClassBlockId || ""}
          onChange={(e) =>
            selectClassBlockManually(e.target.value || null)
          }
        >
          <option value="">선택 안함</option>
          {classBlocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.name || "수업"} ({block.start_time} ~ {block.end_time})
            </option>
          ))}
        </select>
      </div>

      {/* 현재 선택된 수업시간 표시 */}
      <div className="text-sm text-gray-700">
        {selectedClassBlock ? (
          <>
            <span className="font-semibold">현재 수업시간:</span>{" "}
            {selectedClassBlock.name || "수업"} (
            {selectedClassBlock.start_time} ~{" "}
            {selectedClassBlock.end_time})
          </>
        ) : (
          <span className="text-gray-400">
            선택된 수업시간이 없습니다.
          </span>
        )}
      </div>
    </div>
  );
}
