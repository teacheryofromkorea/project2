import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import BaseModal from "../common/BaseModal";

export default function EditClassResourceModal({
  isOpen,
  resource,
  onClose,
  onUpdated,
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🔗");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // 모달 열릴 때 기존 값 세팅
  useEffect(() => {
    if (!isOpen || !resource) return;

    setTitle(resource.title || "");
    setUrl(resource.url || "");
    setIcon(resource.icon || "🔗");
    setDescription(resource.description || "");
  }, [isOpen, resource]);

  const handleUpdate = async () => {
    if (!title || !url) {
      alert("제목과 URL은 필수입니다.");
      return;
    }

    setLoading(true);

    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    const { error } = await supabase
      .from("class_resources")
      .update({
        title,
        url: normalizedUrl,
        icon,
        description,
      })
      .eq("id", resource.id);

    setLoading(false);

    if (error) {
      alert("콘텐츠 수정 중 오류가 발생했습니다.");
      return;
    }

    onUpdated();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      {resource && (
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-bold">✏️ 콘텐츠 편집</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">아이콘</label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">간단한 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="선택 사항"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={async () => {
                if (!window.confirm("이 콘텐츠를 삭제할까요?\n(복구할 수 없습니다)")) return;

                const { error } = await supabase
                  .from("class_resources")
                  .delete()
                  .eq("id", resource.id);

                if (error) {
                  alert("삭제 중 오류가 발생했습니다.");
                  return;
                }

                onUpdated();
                onClose();
              }}
              className="text-sm text-red-600 hover:underline"
            >
              삭제
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 text-sm"
              >
                취소
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}