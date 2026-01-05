import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUEST_COLORS = [
    { bg: "bg-red-100", border: "border-red-200", text: "text-red-700", badge: "bg-red-500", hover: "hover:bg-red-50" },
    { bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-500", hover: "hover:bg-orange-50" },
    { bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500", hover: "hover:bg-amber-50" },
    { bg: "bg-green-100", border: "border-green-200", text: "text-green-700", badge: "bg-green-500", hover: "hover:bg-green-50" },
    { bg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-500", hover: "hover:bg-emerald-50" },
    { bg: "bg-teal-100", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-500", hover: "hover:bg-teal-50" },
    { bg: "bg-cyan-100", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-500", hover: "hover:bg-cyan-50" },
    { bg: "bg-sky-100", border: "border-sky-200", text: "text-sky-700", badge: "bg-sky-500", hover: "hover:bg-sky-50" },
    { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-500", hover: "hover:bg-blue-50" },
    { bg: "bg-indigo-100", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-500", hover: "hover:bg-indigo-50" },
    { bg: "bg-violet-100", border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-500", hover: "hover:bg-violet-50" },
    { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-500", hover: "hover:bg-purple-50" },
    { bg: "bg-fuchsia-100", border: "border-fuchsia-200", text: "text-fuchsia-700", badge: "bg-fuchsia-500", hover: "hover:bg-fuchsia-50" },
    { bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-700", badge: "bg-pink-500", hover: "hover:bg-pink-50" },
    { bg: "bg-rose-100", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-500", hover: "hover:bg-rose-50" },
];

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
        <div className="h-full flex gap-4 overflow-hidden p-2">
            {/* 🟧 [좌측 패널 65%] 퀘스트 빌보드 (Large Display) */}
            <div className="flex-[0.65] flex flex-col gap-3 min-w-0">
                {/* 헤더 */}
                <div className="bg-white/80 rounded-xl p-3 shadow-md backdrop-blur border border-white/50 shrink-0">
                    <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                        <span>🔥</span>
                        <span>QUEST BOARD</span>
                    </h2>
                </div>

                {/* 퀘스트 카드 리스트 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pb-2">
                    {quests.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center bg-white/40 rounded-2xl border-2 border-dashed border-white/50 text-gray-400 p-8 text-center">
                            <p className="text-lg font-bold">진행 중인 퀘스트가 없습니다</p>
                            <p className="text-sm">오른쪽 패널에서 퀘스트를 추가해보세요!</p>
                        </div>
                    ) : (
                        quests.map((quest, index) => {
                            const color = QUEST_COLORS[index % QUEST_COLORS.length];
                            const completedCount = quest.completed.size;
                            const totalCount = students.length;
                            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            return (
                                <div
                                    key={quest.id}
                                    className={`relative bg-white rounded-2xl p-5 shadow-lg border-l-8 ${color.border} flex flex-col gap-3 group transition-transform hover:scale-[1.02]`}
                                    style={{ borderLeftColor: 'transparent' }} // 오버라이드 방지용
                                >
                                    {/* 왼쪽 컬러 바 (border-l 대신 절대위치로 확실하게) */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-3 rounded-l-2xl ${color.badge}`} />

                                    <div className="pl-2 flex items-start gap-4">
                                        {/* Number Badge (Huge) */}
                                        <div className={`shrink-0 w-16 h-16 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center text-4xl font-extrabold shadow-inner`}>
                                            {index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pt-1">
                                            {/* Title (Biggest) */}
                                            <h3 className="text-3xl font-black text-gray-800 leading-tight mb-2 break-keep" style={{ wordBreak: "keep-all" }}>
                                                {quest.title}
                                            </h3>

                                            {/* Progress Bar & Stats */}
                                            <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full ${color.badge} transition-all duration-700 ease-out`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                                <span className={`${color.text} bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100`}>
                                                    {percent}% 완료
                                                </span>
                                                <span>
                                                    {completedCount} / {totalCount} 명
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button (Hover Only) */}
                                    <button
                                        onClick={() => {
                                            if (confirm(`'${quest.title}' 퀘스트를 삭제하시겠습니까?`)) onDeleteQuest(quest.id);
                                        }}
                                        className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        title="퀘스트 삭제"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 🟦 [우측 패널 35%] 학생 명단 (Compact Table) */}
            <div className="flex-[0.35] flex flex-col bg-white/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md border border-white/50">
                <div className="p-3 border-b border-gray-100 bg-white/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        <h2 className="text-base font-bold text-gray-800">체크리스트</h2>
                    </div>
                    {/* 간단한 추가 폼 (왼쪽에 배치) */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            placeholder="새 퀘스트..."
                            className="px-2 py-1 rounded border border-gray-200 text-sm w-32 focus:w-48 transition-all outline-none focus:border-indigo-400"
                        />
                        <button
                            type="submit"
                            disabled={!inputName.trim()}
                            className="px-2 py-1 bg-indigo-500 text-white rounded text-sm font-bold hover:bg-indigo-600 disabled:opacity-50"
                        >
                            +
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-auto bg-white/40 relative">
                    {quests.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                            <span className="text-3xl opacity-20">📝</span>
                            <span className="text-sm">퀘스트를 추가해주세요</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse relative table-fixed">
                            <thead className="sticky top-0 z-40 h-10 shadow-sm">
                                <tr>
                                    {/* Num */}
                                    <th className="w-12 text-center bg-gray-50 border-b border-r border-gray-200 text-xs font-bold text-gray-500 sticky left-0 z-50">
                                        No.
                                    </th>
                                    {/* Name */}
                                    <th className="w-20 text-center bg-gray-50 border-b border-r border-gray-200 text-xs font-bold text-gray-600 sticky left-12 z-50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                                        이름
                                    </th>
                                    {/* Quest Columns (Just Numbers) */}
                                    {quests.map((quest, index) => {
                                        const color = QUEST_COLORS[index % QUEST_COLORS.length];
                                        return (
                                            <th key={quest.id} className={`w-14 text-center border-b border-gray-200 ${color.bg}`}>
                                                <div className={`w-6 h-6 rounded-full ${color.badge} text-white text-xs font-bold flex items-center justify-center mx-auto shadow-sm`}>
                                                    {index + 1}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student, idx) => (
                                    <tr key={student.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/50 transition-colors group`}>
                                        <td className={`bg-inherit border-r border-gray-200 text-center text-xs font-bold text-gray-400 sticky left-0 z-30 group-hover:bg-indigo-50`}>
                                            {student.number}
                                        </td>
                                        <td className={`bg-inherit border-r border-gray-200 text-center text-sm font-bold text-gray-700 sticky left-12 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] group-hover:bg-indigo-50 truncate px-1`}>
                                            {student.name}
                                        </td>
                                        {quests.map((quest, qIdx) => {
                                            const isCompleted = quest.completed.has(student.id);
                                            const color = QUEST_COLORS[qIdx % QUEST_COLORS.length];
                                            return (
                                                <td key={quest.id} className="text-center p-1">
                                                    <button
                                                        onClick={() => onToggleQuestCheck(quest.id, student.id)}
                                                        className={`
                                                            w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto
                                                            ${isCompleted
                                                                ? `${color.badge} text-white shadow-md scale-100`
                                                                : "bg-white border border-gray-200 text-gray-300 hover:border-gray-400 hover:scale-105"
                                                            }
                                                        `}
                                                    >
                                                        {isCompleted && (
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
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
        </div>
    );
}
