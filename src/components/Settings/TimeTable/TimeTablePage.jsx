import useCurrentTimeBlock from "../../../hooks/useCurrentTimeBlock";
import BasicTimeSection from "./BasicTimeSection";
import ClassTimeSection from "./ClassTimeSection";
import BreakTimeSection from "./BreakTimeSection";

export default function TimeTablePage() {
  const { activeBlock, loading } = useCurrentTimeBlock();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
          ⏰ 시간표 관리
        </h2>
        <p className="text-sm text-gray-600">
          교사가 커스텀한 시간표를 기준으로 탭 자동 전환 + 블록별 데이터 분리가 동작합니다.
        </p>
      </div>

      {!loading && (
        <div className="rounded-xl border bg-black/80 text-white p-3 text-sm">
          <div className="font-bold mb-1">🕒 현재 활성 블록 (디버그)</div>
          {activeBlock ? (
            <ul className="space-y-1">
              <li>type: {activeBlock.block_type}</li>
              <li>name: {activeBlock.name}</li>
              <li>
                time: {activeBlock.start_time} ~ {activeBlock.end_time}
              </li>
              <li>id: {activeBlock.id}</li>
            </ul>
          ) : (
            <div>현재 시간에 해당하는 블록 없음</div>
          )}
        </div>
      )}

      <BasicTimeSection />
      <ClassTimeSection /> 
      <BreakTimeSection />

    </div>
  );
}