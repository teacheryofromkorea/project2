import { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";
import { useLock } from "../../context/LockContext";

/**
 * Generic Routine Sidebar component for Break/Lunch/End tabs
 * Displays routines in a styled sidebar matching Attendance tab design
 */
export default function GenericRoutineSidebar({
    routineTitle,
    routineItems,
    tempTitle,
    setTempTitle,
    newContent,
    setNewContent,
    editRoutine,
    setEditRoutine,
    editText,
    setEditText,
    addRoutineItem,
    deleteRoutineItem,
    moveRoutine,
    updateRoutine,
    saveRoutineTitle,
    // Optional: for Break tab time block selector
    breakBlocks,
    selectedBlockId,
    setSelectedBlockId,
}) {
    const { locked } = useLock();
    const [isEditing, setIsEditing] = useState(false);

    // ESC handler removed (BaseModal handles it)

    useEffect(() => {
        if (locked) {
            setIsEditing(false);
            setEditRoutine?.(null);
            setEditText?.("");
        }
    }, [locked, setEditRoutine, setEditText]);

    const handleSaveAndClose = async () => {
        if (locked) return;
        await saveRoutineTitle?.();
        setIsEditing(false);
    };

    return (
        <>
            <aside className="relative h-full bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 flex flex-col overflow-hidden">
                {/* Decorative brush stroke blob */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-4 -left-8 w-48 h-64">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/35 via-purple-400/25 to-indigo-300/15 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] blur-lg" />
                        <div className="absolute top-8 left-12 w-32 h-40 bg-gradient-to-bl from-purple-500/30 via-indigo-400/20 to-transparent rounded-[60%_40%_30%_70%/40%_60%_40%_60%] blur-md" />
                        <div className="absolute top-16 left-8 w-24 h-32 bg-gradient-to-tr from-indigo-500/25 to-transparent rounded-[50%_50%_60%_40%/30%_70%_60%_40%] blur-sm" />
                    </div>
                </div>

                <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight flex items-center gap-2 relative z-10">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    {routineTitle || "루틴"}
                </h2>

                {/* Break time block selector */}
                {breakBlocks && selectedBlockId !== undefined && setSelectedBlockId && (
                    <div className="mb-4 relative z-10">
                        <select
                            value={selectedBlockId || ""}
                            onChange={(e) => setSelectedBlockId?.(e.target.value || null)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {breakBlocks.map((block) => (
                                <option key={block.id} value={block.id}>
                                    {block.name} ({block.start_time?.slice(0, 5)} ~ {block.end_time?.slice(0, 5)})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <ul className="space-y-2 flex-1 flex flex-col justify-center min-h-0 overflow-y-auto px-1 relative z-10">
                    {routineItems.map((item, idx) => (
                        <li key={item.id || idx}>
                            <button className="relative w-full bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl px-4 py-3 text-left transition-all duration-200 group shadow-sm hover:shadow-md">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <span className="text-slate-700 text-lg font-bold group-hover:text-indigo-900 transition-colors leading-relaxed block">
                                            {item.text || item.content}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    disabled={locked}
                    className={`mt-6 w-full text-sm font-semibold py-3 rounded-xl transition-all border relative z-10
            ${locked
                            ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
                            : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 hover:shadow-sm"
                        }
          `}
                    onClick={() => {
                        if (locked) return;
                        setTempTitle?.(routineTitle);
                        setNewContent?.("");
                        setIsEditing(true);
                    }}
                >
                    Edit Routines
                </button>
            </aside>

            {/* Edit Modal */}
            <BaseModal
                isOpen={isEditing}
                onClose={() => {
                    if (editRoutine) return;
                    setIsEditing(false);
                }}
            >
                <div className="bg-white p-6 rounded-3xl w-[400px] shadow-xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">루틴 편집</h3>

                    <label className="block text-sm font-medium text-gray-700 mb-2">루틴 제목</label>
                    <input
                        className="w-full border rounded-lg px-3 py-2 mb-4 font-semibold"
                        value={tempTitle || routineTitle}
                        onChange={(e) => setTempTitle?.(e.target.value)}
                    />

                    <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {routineItems.map((item, index) => (
                            <li key={item.id || index} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg text-sm">
                                <span className="flex-1 truncate mr-2">{item.text || item.content}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => { if (locked) return; moveRoutine?.(index, "up"); }} className="text-gray-500 font-bold">▲</button>
                                    <button onClick={() => { if (locked) return; moveRoutine?.(index, "down"); }} className="text-gray-500 font-bold">▼</button>
                                    <button
                                        onClick={() => {
                                            if (locked) return;
                                            setEditRoutine?.(item);
                                            setEditText?.(item.text || item.content);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (locked) return;
                                            deleteRoutineItem?.(item.id);
                                        }}
                                        className="text-red-600 hover:text-red-800 font-bold"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <label className="block text-sm font-medium text-gray-700 mb-2">새 루틴 항목</label>
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="새 루틴 추가"
                            value={newContent || ""}
                            onChange={(e) => setNewContent?.(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <button
                            onClick={() => { if (locked) return; addRoutineItem?.(); }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            추가
                        </button>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                if (locked) return;
                                setIsEditing(false);
                            }}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            닫기
                        </button>
                        <button
                            onClick={handleSaveAndClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </BaseModal>

            {/* Edit Item Modal */}
            <BaseModal isOpen={!!editRoutine} onClose={() => { setEditRoutine?.(null); setEditText?.(""); }}>
                <div className="bg-white p-6 rounded-2xl w-[300px] shadow-xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-4">루틴 수정</h3>
                    <input
                        value={editText || ""}
                        onChange={(e) => setEditText?.(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => { if (locked) return; updateRoutine?.(); }}
                        className="w-full bg-blue-600 text-white rounded-full py-2 mb-2 font-semibold"
                    >
                        저장
                    </button>
                    <button
                        onClick={() => {
                            if (locked) return;
                            setEditRoutine?.(null);
                            setEditText?.("");
                        }}
                        className="w-full bg-gray-300 rounded-full py-2 font-semibold"
                    >
                        취소
                    </button>
                </div>
            </BaseModal>
        </>
    );
}
