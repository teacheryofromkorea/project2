import React from "react";
import { STATUS_CONFIG } from "./AttendanceConstants";

export default function AttendanceMonthlyTable({
    currentDate,
    onPrevMonth,
    onNextMonth,
    statsData,
    students,
    loading
}) {
    // --- Grid Helpers ---
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatusForCell = (studentId, day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        const today = new Date();

        // Reset time for accurate comparison
        const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const checkDateZero = new Date(year, currentDate.getMonth(), day);

        const record = statsData.find(d => d.student_id === studentId && d.date === dateStr);

        if (record) return record.status || 'unchecked';

        // If no record, check if date is valid for "unchecked" (past or today)
        if (checkDateZero <= todayZero) {
            return 'unchecked';
        }

        return null; // Future dates show nothing
    };

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <h2 className="text-lg font-bold text-gray-900">월별 출결 현황</h2>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm">
                    <button onClick={onPrevMonth} className="p-1 hover:bg-gray-100 rounded-md transition"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                    <span className="font-bold text-gray-800 tabular-nums">
                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </span>
                    <button onClick={onNextMonth} className="p-1 hover:bg-gray-100 rounded-md transition"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>
            </div>

            {/* Legend (Refined Design) */}
            <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">출결 상태 범례</span>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 질병 */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col gap-3 hover:bg-blue-50 transition-colors">
                        <div className="text-blue-700 font-bold flex items-center gap-2 pb-2 border-b border-blue-100/50">
                            <span className="text-lg">🏥</span> 질병 관련
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 text-sm text-gray-700">
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["sick-absent"].icon}</span>{STATUS_CONFIG["sick-absent"].label}</div>
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["sick-early-leave"].icon}</span>{STATUS_CONFIG["sick-early-leave"].label}</div>
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["sick-late"].icon}</span>{STATUS_CONFIG["sick-late"].label}</div>
                        </div>
                    </div>

                    {/* 출석인정 */}
                    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 flex flex-col gap-3 hover:bg-purple-50 transition-colors">
                        <div className="text-purple-700 font-bold flex items-center gap-2 pb-2 border-b border-purple-100/50">
                            <span className="text-lg">📋</span> 출석인정 관련
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 text-sm text-gray-700">
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["authorized-absent"].icon}</span>{STATUS_CONFIG["authorized-absent"].label}</div>
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["authorized-early-leave"].icon}</span>{STATUS_CONFIG["authorized-early-leave"].label}</div>
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["authorized-late"].icon}</span>{STATUS_CONFIG["authorized-late"].label}</div>
                        </div>
                    </div>

                    {/* 미인정 */}
                    <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 flex flex-col gap-3 hover:bg-red-50 transition-colors">
                        <div className="text-red-700 font-bold flex items-center gap-2 pb-2 border-b border-red-100/50">
                            <span className="text-lg">❌</span> 미인정 관련
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 text-sm text-gray-700">
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["unauthorized-absent"].icon}</span>{STATUS_CONFIG["unauthorized-absent"].label}</div>
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["unauthorized-early-leave"].icon}</span>{STATUS_CONFIG["unauthorized-early-leave"].label}</div>
                            <div className="flex items-center"><span className="w-8 text-center font-bold text-lg leading-none">{STATUS_CONFIG["unauthorized-late"].icon}</span>{STATUS_CONFIG["unauthorized-late"].label}</div>
                        </div>
                    </div>
                </div>

                {/* Etc Row */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6 justify-between text-sm">
                    <div className="flex items-center gap-6">
                        <div className="font-bold text-gray-500 uppercase tracking-wider text-xs">기타</div>
                        <div className="flex items-center gap-2"><span className="text-green-600 font-bold text-lg">{STATUS_CONFIG["present"].icon}</span> {STATUS_CONFIG["present"].label}</div>
                        <div className="flex items-center gap-2"><span className="text-gray-300 font-bold text-lg">{STATUS_CONFIG["unchecked"].icon}</span> <span className="text-gray-500">{STATUS_CONFIG["unchecked"].label}</span></div>
                    </div>

                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 text-xs">
                        <span className="text-red-500 font-bold">◎</span>
                        <span className="text-gray-600 font-medium">서류 미제출 (조치 필요)</span>
                        <div className="w-px h-3 bg-gray-300 mx-1"></div>
                        <span className="text-gray-400">💡 서류 제출 완료 시 표시 사라짐</span>
                    </div>
                </div>
            </div>
            {/* Grid Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 h-10">
                            <th className="px-2 text-center font-bold text-gray-700 min-w-[80px] sticky left-0 bg-gray-50 z-10 border-r border-gray-200 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">학생명</th>
                            {daysArray.map(day => (
                                <th key={day} className="w-[30px] min-w-[30px] text-center font-normal text-gray-500 text-xs">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            <tr><td colSpan={daysInMonth + 1} className="py-20 text-center text-gray-400">데이터를 불러오는 중...</td></tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors h-10">
                                    {/* Name Column */}
                                    <td className="px-2 font-bold text-gray-900 bg-white border-r border-gray-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-center group-hover:bg-blue-50/30 whitespace-nowrap">
                                        <span className="text-xs text-gray-400 font-normal mr-1">{student.number}</span>
                                        {student.name}
                                    </td>
                                    {/* Days Columns */}
                                    {daysArray.map(day => {
                                        const status = getStatusForCell(student.id, day);
                                        const config = STATUS_CONFIG[status];
                                        // Weekend styling could go here
                                        return (
                                            <td key={day} className="text-center border-r border-gray-50 last:border-0 relative cursor-default p-0 align-middle">
                                                {status && (
                                                    <div className="w-full h-10 flex items-center justify-center group relative">
                                                        <span className={`text-base leading-none select-none ${config?.color}`}>{config?.icon}</span>

                                                        {/* Custom Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg font-medium">
                                                            {config?.label}
                                                            {/* Arrow */}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                        </div>

                                                        {/* Document Status Indicator Dot */}
                                                        {status && (status.startsWith('sick') || status.startsWith('authorized')) && (
                                                            statsData.find(d => d.student_id === student.id && d.date.endsWith(String(day).padStart(2, '0')))?.document_submitted === false && (
                                                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
