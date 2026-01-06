

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import BaseModal from "../common/BaseModal";

export default function AddClassResourceModal({ isOpen, onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌐");
  const [loading, setLoading] = useState(false);

  // isOpen check handled by BaseModal

  const handleSubmit = async () => {
    if (!title || !url) {
      alert("콘텐츠 이름과 URL은 필수입니다.");
      return;
    }

    setLoading(true);

    // 현재 가장 큰 order_index 조회
    const { data: lastItem } = await supabase
      .from("class_resources")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex =
      lastItem?.order_index !== undefined
        ? lastItem.order_index + 1
        : 0;

    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    const { error } = await supabase.from("class_resources").insert({
      title,
      url: normalizedUrl,
      description,
      icon,
      order_index: nextOrderIndex,
    });

    setLoading(false);

    if (error) {
      console.error("수업 콘텐츠 추가 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
      return;
    }

    // 초기화
    setTitle("");
    setUrl("");
    setDescription("");
    setIcon("🌐");

    onAdded?.();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl w-[420px] p-6 space-y-4">
        <h3 className="text-lg font-bold">📚 수업 콘텐츠 추가</h3>

        <div>
          <label className="text-sm font-medium">콘텐츠 이름</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 유튜브"
          />
        </div>

        <div>
          <label className="text-sm font-medium">웹사이트 주소</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
          />
        </div>

        <div>
          <label className="text-sm font-medium">간단한 설명</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="선택"
          />
        </div>

        <div>
          <label className="text-sm font-medium">아이콘 (이모지)</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
            disabled={loading}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white"
            disabled={loading}
          >
            추가하기
          </button>
        </div>
      </div>
    </BaseModal>
  );
}