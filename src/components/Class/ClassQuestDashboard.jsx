import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassQuestDashboard({
    students = [],
    quests = [],
    onAddQuest,
    onDeleteQuest,
    onToggleQuestCheck, // (questId, studentId) => void
}) {
    const [inputName, setInputName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputName.trim()) return;
        onAddQuest(inputName);
        setInputName("");
    };

    return (
        <div className="h-full flex flex-col bg-white/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md border border-white/50">
            {/* 🔹 상단 헤더: 제목 + 검색/추가 */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/60 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-xl text-xl">🔥</div>
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-800 leading-tight">퀘스트 현황판</h2>
                        <p className="text-[11px] text-gray-400 font-medium">
                            번호표를 참고하여 수행 여부를 체크하세요.
                        </p>
                    </div>
                </div>

                {/* 퀘스트 추가 폼 */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="새 퀘스트 추가..."
                        className="px-3 py-1.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none bg-white transition-all text-sm w-64"
                    />
                    <button
                        type="submit"
                        disabled={!inputName.trim()}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-orange-200 disabled:opacity-50"
                    >
                        + 추가
                    </button>
                </form>
            </div>

            {/* 🔹 퀘스트 범례 (Legend) 영역 - 세로 스택 (Large Visibility) */}
            {quests.length > 0 && (
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col gap-3 shrink-0 max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {quests.map((quest, index) => (
                        <div
                            key={quest.id}
                            className="flex items-center gap-4 bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-200 group relative hover:border-orange-300 transition-all"
                        >
                            {/* Number Badge (Large) */}
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-md">
                                {index + 1}
                            </div>

                            {/* Info (Large) */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="text-2xl font-bold text-gray-800 truncate leading-none mb-1" title={quest.title}>
                                    {quest.title}
                                </div>
                                <div className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                    <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                                        {quest.completed.size}명 완료
                                    </span>
                                    <span className="w-px h-3 bg-gray-300"></span>
                                    <span>미완료 {students.length - quest.completed.size}명</span>
                                </div>
                            </div>

                            {/* Delete Button (Large) */}
                            <button
                                onClick={() => {
                                    if (confirm(`'${quest.title}' 퀘스트를 삭제하시겠습니까?`)) onDeleteQuest(quest.id);
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all absolute right-4 top-1/2 -translate-y-1/2"
                                title="삭제"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 🔹 메인 콘텐츠: 테이블 뷰 (Compact Numbered) */}
            <div className="flex-1 overflow-auto bg-white/40 relative">
                {quests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="text-5xl opacity-20">📉</div>
                        <p className="text-lg font-medium">등록된 퀘스트가 없습니다.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse relative table-fixed">
                        <thead className="sticky top-0 z-40 shadow-sm text-xs uppercase tracking-wider h-10">
                            <tr>
                                {/* Sticky Header: Number */}
                                <th className="px-2 py-2 font-bold text-gray-500 w-14 text-center border-b border-r border-gray-200 bg-gray-50 sticky left-0 z-50">
                                    번호
                                </th>
                                {/* Sticky Header: Name */}
                                <th className="px-3 py-2 font-bold text-gray-600 bg-gray-50 border-b border-r border-gray-200 sticky left-14 z-50 w-24 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                                    이름
                                </th>
                                {/* Scrollable Columns: Just Numbers */}
                                {quests.map((quest, index) => (
                                    <th key={quest.id} className="px-1 border-b border-gray-100 bg-white text-center">
                                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold mx-auto">
                                            {index + 1}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student, index) => (
                                <tr
                                    key={student.id}
                                    className={`
                    hover:bg-orange-50/50 transition-colors group
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  `}
                                >
                                    {/* Sticky Column: Number */}
                                    <td className={`
                    px-2 py-1.5 font-bold text-gray-400 text-xs text-center border-r border-gray-200 sticky left-0 z-30 transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    group-hover:bg-orange-50
                  `}>
                                        {student.number}
                                    </td>

                                    {/* Sticky Column: Name */}
                                    <td className={`
                    px-3 py-1.5 font-bold text-gray-700 text-sm border-r border-gray-200 sticky left-14 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    group-hover:bg-orange-50
                  `}>
                                        {student.name}
                                    </td>

                                    {/* Scrollable Columns: Checkboxes */}
                                    {quests.map((quest) => {
                                        const isCompleted = quest.completed.has(student.id);
                                        return (
                                            <td key={`${student.id}-${quest.id}`} className="px-1 py-1 text-center">
                                                <button
                                                    onClick={() => onToggleQuestCheck(quest.id, student.id)}
                                                    className={`
                                                        w-full h-10 mx-auto rounded-lg border transition-all duration-200 flex items-center justify-center
                                                        ${isCompleted
                                                            ? "bg-green-500 border-green-600 text-white shadow-md shadow-green-200"
                                                            : "bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                                                        }
                                                    `}
                                                >
                                                    {isCompleted && (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
