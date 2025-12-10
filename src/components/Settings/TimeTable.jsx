import { useState } from "react";

export default function TimeTable() {
  // 나중에 Supabase에서 가져올 데이터 대신, 일단 목업 데이터로 UI 구조만 보기
  const [blocks] = useState([
    {
      id: "1",
      name: "등교 시간",
      block_type: "arrival",
      start_time: "08:30",
      end_time: "09:00",
      order_index: 1,
    },
    {
      id: "2",
      name: "1교시 수업",
      block_type: "class",
      start_time: "09:00",
      end_time: "09:40",
      order_index: 2,
    },
    {
      id: "3",
      name: "1교시 쉬는시간",
      block_type: "break",
      start_time: "09:40",
      end_time: "09:50",
      order_index: 3,
    },
    {
      id: "4",
      name: "점심시간",
      block_type: "lunch",
      start_time: "12:00",
      end_time: "12:40",
      order_index: 10,
    },
    {
      id: "5",
      name: "하교 시간",
      block_type: "dismissal",
      start_time: "14:00",
      end_time: "15:00",
      order_index: 99,
    },
  ]);

  const [filter, setFilter] = useState("all");

  const filteredBlocks =
    filter === "all"
      ? blocks
      : blocks.filter((b) => b.block_type === filter);

  const typeLabelMap = {
    arrival: "등교",
    class: "수업",
    break: "쉬는시간",
    lunch: "점심",
    dismissal: "하교",
  };

  return (
    <div className="h-full w-full flex flex-col gap-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⏰ 시간표 설정
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            등교, 수업, 쉬는시간, 점심, 하교 시간을 한 곳에서 관리합니다.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow
                     hover:bg-blue-700 active:scale-95 transition"
        >
          + 새 시간 블록 추가
        </button>
      </div>

      {/* 블록 유형 필터 버튼들 */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "전체" },
          { key: "arrival", label: "등교시간" },
          { key: "class", label: "수업시간" },
          { key: "break", label: "쉬는시간" },
          { key: "lunch", label: "점심시간" },
          { key: "dismissal", label: "하교시간" },
        ].map((item) => {
          const isActive = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={
                "px-3 py-1 rounded-full text-xs font-medium border transition " +
                (isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 테이블 영역 */}
      <div className="flex-1 rounded-2xl bg-white/80 shadow p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 px-2 w-16">순서</th>
              <th className="py-2 px-2 w-36">유형</th>
              <th className="py-2 px-2">이름</th>
              <th className="py-2 px-2 w-28">시작</th>
              <th className="py-2 px-2 w-28">종료</th>
              <th className="py-2 px-2 w-28 text-center">활성</th>
              <th className="py-2 px-2 w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-gray-400 text-sm"
                >
                  선택한 조건에 해당하는 시간 블록이 없습니다.
                </td>
              </tr>
            ) : (
              filteredBlocks.map((block) => (
                <tr
                  key={block.id}
                  className="border-b last:border-b-0 hover:bg-gray-50/80"
                >
                  <td className="py-2 px-2 text-gray-500">
                    {block.order_index}
                  </td>
                  <td className="py-2 px-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {typeLabelMap[block.block_type] ?? block.block_type}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-800">{block.name}</td>
                  <td className="py-2 px-2 text-gray-700">
                    {block.start_time}
                  </td>
                  <td className="py-2 px-2 text-gray-700">
                    {block.end_time}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50 border border-green-200 text-xs text-green-700">
                      ●
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-full text-xs text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 안내 문구 */}
      <p className="text-xs text-gray-400">
        ※ 시간표는 앞으로 자동 교시 감지, 출석/착석 로그, 통계 화면에 모두 활용될 예정입니다.
      </p>
    </div>
  );
}