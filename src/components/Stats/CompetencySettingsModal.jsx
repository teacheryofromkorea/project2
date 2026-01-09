import React, { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";
import { supabase } from "../../lib/supabaseClient";
import { Trash2, Edit2, Plus, X, Check } from "lucide-react";

export default function CompetencySettingsModal({
    isOpen,
    onClose,
    currentMax, // CoreStatsSection에서 넘겨준 대표값(혹은 첫번째 값)
    onUpdateMaxValue, // (newMax) => void
    onTemplatesUpdated, // () => void  (부모가 다시 fetch하도록)
}) {
    const [maxValue, setMaxValue] = useState(currentMax);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    // 생성
    const [newStatName, setNewStatName] = useState("");
    const [newStatIcon, setNewStatIcon] = useState("✨");
    const [isAdding, setIsAdding] = useState(false);

    // 수정
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editIcon, setEditIcon] = useState("");

    // 모달 열릴 때마다 목록 새로고침 & max값 동기화
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            setMaxValue(currentMax);
        }
    }, [isOpen, currentMax]);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("stat_templates")
            .select("*")
            .order("order_index", { ascending: true });

        if (!error) {
            setTemplates(data || []);
        }
        setLoading(false);
    };

    /* ===============================
       Helper: 아이콘 자동 추천
       =============================== */
    const getAutoIcon = (name) => {
        const n = name.trim();
        if (!n) return "✨";

        if (n.includes("창의") || n.includes("아이디어")) return "🎨";
        if (n.includes("배려") || n.includes("나눔") || n.includes("봉사") || n.includes("인성") || n.includes("마음")) return "💖";
        if (n.includes("발표") || n.includes("소통") || n.includes("경청") || n.includes("말하")) return "🎤";
        if (n.includes("체력") || n.includes("운동") || n.includes("건강") || n.includes("스포츠")) return "💪";
        if (n.includes("독서") || n.includes("지혜") || n.includes("공부") || n.includes("학습")) return "📚";
        if (n.includes("성실") || n.includes("노력") || n.includes("끈기") || n.includes("열정")) return "🔥";
        if (n.includes("협동") || n.includes("리더") || n.includes("친구")) return "🤝";
        if (n.includes("질서") || n.includes("정리") || n.includes("청소") || n.includes("규칙")) return "🧹";
        if (n.includes("수학") || n.includes("과학") || n.includes("계산")) return "🧠";
        if (n.includes("예술") || n.includes("음악") || n.includes("미술")) return "🎵";
        if (n.includes("자존") || n.includes("감사") || n.includes("행복")) return "🍀";

        return "✨"; // 기본값
    };

    const handleNameChange = (val) => {
        setNewStatName(val);
        setNewStatIcon(getAutoIcon(val));
    };

    /* ===============================
       1. Max Value 일괄 저장
       =============================== */
    const handleSaveMaxValue = async () => {
        const num = parseInt(maxValue, 10);
        if (isNaN(num) || num <= 0) return;

        if (onUpdateMaxValue) {
            await onUpdateMaxValue(num);
        } else {
            await supabase
                .from("stat_templates")
                .update({ max_value: num })
                .gt("id", 0);
        }
        fetchTemplates();
    };

    /* ===============================
       2. 역량 추가
       =============================== */
    const handleAddStat = async () => {
        if (!newStatName.trim()) return;

        const { error } = await supabase.from("stat_templates").insert({
            name: newStatName.trim(),
            icon: newStatIcon || "✨",
            max_value: maxValue, // 현재 설정된 max값 따라감
            order_index: templates.length + 1, // 맨 뒤
        });

        if (!error) {
            setNewStatName("");
            setNewStatIcon("✨");
            setIsAdding(false);
            await fetchTemplates();
            onTemplatesUpdated?.();
        }
    };

    /* ===============================
       3. 역량 삭제
       =============================== */
    const handleDeleteStat = async (id) => {
        if (!confirm("정말 이 역량을 삭제하시겠습니까?\n관련된 학생들의 점수 기록도 함께 삭제될 수 있습니다.")) {
            return;
        }

        const { error } = await supabase.from("stat_templates").delete().eq("id", id);
        if (!error) {
            await fetchTemplates();
            onTemplatesUpdated?.();
        }
    };

    /* ===============================
       4. 역량 수정 (이름 + 아이콘)
       =============================== */
    const startEdit = (tpl) => {
        setEditingId(tpl.id);
        setEditName(tpl.name);
        setEditIcon(tpl.icon || "✨");
    };

    const saveEdit = async () => {
        if (!editName.trim()) return;

        const { error } = await supabase
            .from("stat_templates")
            .update({
                name: editName.trim(),
                icon: editIcon,
            })
            .eq("id", editingId);

        if (!error) {
            setEditingId(null);
            await fetchTemplates();
            onTemplatesUpdated?.();
        }
    };

    if (!isOpen) return null;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* 헤더 */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">핵심 역량 설정</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        평가 항목을 추가, 수정하거나 점수 체계를 변경합니다.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2">
                    {/* 섹션 1: 최대 점수 설정 */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🏆 최대 점수 (Max Value)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={maxValue}
                                onChange={(e) => setMaxValue(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none font-bold text-center"
                                min="1"
                            />
                            <button
                                onClick={handleSaveMaxValue}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition text-sm"
                            >
                                일괄 적용
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            * 적용 시 모든 역량의 최대 점수가 변경됩니다.
                        </p>
                    </div>

                    {/* 섹션 2: 역량 리스트 */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700">
                                📝 역량 목록 ({templates.length})
                            </label>
                            <button
                                onClick={() => {
                                    setNewStatName("");
                                    setNewStatIcon("✨");
                                    setIsAdding(true);
                                }}
                                className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition font-medium"
                            >
                                <Plus size={14} /> 추가하기
                            </button>
                        </div>

                        {/* 리스트 */}
                        <div className="space-y-2">
                            {templates.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition"
                                >
                                    {editingId === tpl.id ? (
                                        // 수정 모드
                                        <div className="flex flex-1 items-center gap-2">
                                            <input
                                                type="text"
                                                value={editIcon}
                                                onChange={(e) => setEditIcon(e.target.value)}
                                                className="w-8 text-center px-1 py-1 border border-blue-300 rounded focus:outline-none text-lg"
                                                placeholder="✨"
                                            />
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none text-sm"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        if (e.nativeEvent.isComposing) return;
                                                        saveEdit();
                                                    }
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={saveEdit}
                                                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        // 일반 모드
                                        <>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl w-8 text-center">{tpl.icon || "✨"}</span>
                                                <span className="font-medium text-gray-700">
                                                    {tpl.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(tpl)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStat(tpl.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* 추가 폼 */}
                            {isAdding && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-200 rounded-xl animate-fade-in-down">
                                    <input
                                        type="text"
                                        value={newStatIcon}
                                        onChange={(e) => setNewStatIcon(e.target.value)}
                                        className="w-10 h-10 text-center bg-white border border-blue-200 rounded text-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="✨"
                                    />
                                    <input
                                        type="text"
                                        placeholder="새 역량 이름 (예: 창의성)"
                                        value={newStatName}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className="flex-1 px-2 py-1.5 bg-white border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                if (e.nativeEvent.isComposing) return;
                                                handleAddStat();
                                            }
                                            if (e.key === "Escape") setIsAdding(false);
                                        }}
                                    />
                                    <button
                                        onClick={handleAddStat}
                                        className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 빈 상태 안내 */}
                        {templates.length === 0 && !isAdding && !loading && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                등록된 역량이 없습니다. 추가해주세요!
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}
