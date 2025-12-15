import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AddClassResourceModal from "./AddClassResourceModal";
import EditClassResourceModal from "./EditClassResourceModal";

export default function ClassResourceBoard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingResource, setEditingResource] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("class_resources")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("수업 콘텐츠 불러오기 실패:", error);
      setLoading(false);
      return;
    }

    // order_index 보정: 없으면 배열 index로 세팅
    const normalized = (data || []).map((r, idx) => ({
      ...r,
      order_index: r.order_index ?? idx,
    }));
    setResources(normalized);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openResource = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const deleteResource = async (id) => {
    const confirmed = window.confirm(
      "이 수업 콘텐츠를 삭제할까요?\n(삭제 후 복구할 수 없습니다)"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("class_resources")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("수업 콘텐츠 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    fetchResources();
  };

  const moveResource = async (id, direction) => {
    const index = resources.findIndex((r) => r.id === id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= resources.length) return;

    // 1) 프론트에서 순서 먼저 변경(optimistic)
    const reordered = [...resources];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setResources(reordered);

    // 2) DB에 전체 order_index를 'update'로 재기록 (upsert 대신 update 사용)
    //    -> 기존 row만 업데이트하므로, insert 경로/충돌/NOT NULL 문제를 피함
    const updates = reordered.map((r, idx) => ({ id: r.id, order_index: idx }));

    try {
      const results = await Promise.all(
        updates.map((u) =>
          supabase
            .from("class_resources")
            .update({ order_index: u.order_index })
            .eq("id", u.id)
        )
      );

      const firstError = results.find((res) => res.error)?.error;
      if (firstError) {
        console.error("콘텐츠 정렬 실패:", firstError);
        alert("정렬 중 오류가 발생했습니다.");
        // 롤백: DB 기준으로 다시 로드
        fetchResources();
        return;
      }
    } catch (err) {
      console.error("콘텐츠 정렬 실패:", err);
      alert("정렬 중 오류가 발생했습니다.");
      fetchResources();
      return;
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        수업 콘텐츠를 불러오는 중입니다…
      </div>
    );
  }


  return (
    <>
      <div className="flex items-center justify-between mb-3">
        {/* 좌측 제목 */}
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-700">
          📚 수업 도구

        </h3>

        {/* 우측 버튼 영역 */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
          >
            + 도구 추가
          </button>

          <button
            onClick={() => {
              setSelectMode((prev) => !prev);
              setSelectedIds(new Set());
            }}
            className={`px-3 py-1.5 rounded-lg text-sm
              ${
                selectMode
                  ? "bg-gray-300 text-gray-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            {selectMode ? "선택 취소" : "도구 삭제"}
          </button>

          {selectMode && (
            <button
              onClick={async () => {
                if (selectedIds.size === 0) {
                  alert("삭제할 콘텐츠를 선택하세요.");
                  return;
                }
                if (
                  !window.confirm(
                    `${selectedIds.size}개의 콘텐츠를 삭제할까요?\n(복구할 수 없습니다)`
                  )
                )
                  return;

                const ids = Array.from(selectedIds);
                const { error } = await supabase
                  .from("class_resources")
                  .delete()
                  .in("id", ids);

                if (error) {
                  alert("삭제 중 오류가 발생했습니다.");
                  return;
                }

                setSelectMode(false);
                setSelectedIds(new Set());
                fetchResources();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
            >
              선택 삭제
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {resources.length === 0 ? (
          <div className="col-span-4 text-sm text-gray-400 text-center py-10">
            아직 등록된 수업 콘텐츠가 없습니다.
          </div>
        ) : (
          resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => {
                if (!selectMode) return;

                const next = new Set(selectedIds);
                next.has(resource.id)
                  ? next.delete(resource.id)
                  : next.add(resource.id);
                setSelectedIds(next);
              }}
              className="group relative bg-white rounded-xl shadow p-3 flex flex-col justify-between cursor-pointer"
            >
              {selectMode && (
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 w-4 h-4"
                  checked={selectedIds.has(resource.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const next = new Set(selectedIds);
                    e.target.checked
                      ? next.add(resource.id)
                      : next.delete(resource.id);
                    setSelectedIds(next);
                  }}
                />
              )}

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                {!selectMode && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveResource(resource.id, "up");
                      }}
                      className="w-6 h-6 rounded-full bg-white shadow text-xs hover:bg-blue-50"
                      title="위로 이동"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveResource(resource.id, "down");
                      }}
                      className="w-6 h-6 rounded-full bg-white shadow text-xs hover:bg-blue-50"
                      title="아래로 이동"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingResource(resource);
                        setIsEditModalOpen(true);
                      }}
                      className="w-6 h-6 rounded-full bg-white shadow text-xs hover:bg-yellow-50"
                      title="콘텐츠 편집"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              <div>
                <div className="text-xl mb-1">
                  {resource.icon || "🌐"}
                </div>
                <h4 className="font-bold text-sm mb-1">
                  {resource.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {resource.description || "설명 없음"}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openResource(resource.url);
                }}
                className="mt-4 w-full py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                새 창에서 열기
              </button>
            </div>
          ))
        )}
      </div>

      <AddClassResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={fetchResources}
      />
      <EditClassResourceModal
        isOpen={isEditModalOpen}
        resource={editingResource}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingResource(null);
        }}
        onUpdated={fetchResources}
      />
    </>
  );
}