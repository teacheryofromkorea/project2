import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import { getTodayString } from "../../utils/dateUtils";

// --- Icons & Labels Configuration (Matched to User Reference) ---
const STATUS_CONFIG = {
    // 1. 질병 관련 (Sick)
    "sick-absent": { label: "질병결석", icon: "♡", color: "text-black", group: "sick" },
    "sick-early-leave": { label: "질병조퇴", icon: "@", color: "text-black", group: "sick" },
    "sick-late": { label: "질병지각", icon: "#", color: "text-black", group: "sick" },

    // 2. 출석인정 관련 (Authorized)
    "authorized-absent": { label: "출석인정결석", icon: "△", color: "text-black", group: "authorized" },
    "authorized-early-leave": { label: "출석인정조퇴", icon: "▷", color: "text-black", group: "authorized" },
    "authorized-late": { label: "출석인정지각", icon: "◁", color: "text-black", group: "authorized" },

    // 3. 미인정 관련 (Unauthorized)
    "unauthorized-absent": { label: "미인정결석", icon: "♥", color: "text-black", group: "unauthorized" }, // Using filled heart
    "unauthorized-early-leave": { label: "미인정조퇴", icon: "◎", color: "text-black", group: "unauthorized" },
    "unauthorized-late": { label: "미인정지각", icon: "X", color: "text-black", group: "unauthorized" },

    // 4. 기타 (Etc)
    "present": { label: "출석", icon: "✅", color: "text-green-600", group: "etc" },
    "unchecked": { label: "미체크", icon: "⚪", color: "text-gray-300", group: "etc" }, // Using gray circle
};

const getStatusIcon = (status) => STATUS_CONFIG[status]?.icon || "";

export default function AttendanceStatsSection() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [statsData, setStatsData] = useState([]); // All attendance data for the month
    const [students, setStudents] = useState([]);
    const [todayStats, setTodayStats] = useState({ present: 0, sick: 0, authorized: 0, unauthorized: 0, unchecked: 0 });
    const [loading, setLoading] = useState(true);

    // Month navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const fetchStudents = async () => {
        const { data } = await supabase.from("students").select("*").order("number", { ascending: true });
        setStudents(data || []);
    };

    const fetchAttendanceData = async () => {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        const todayStr = getTodayString();

        const { data: monthData, error } = await supabase
            .from("student_attendance_status")
            .select("*")
            .gte("date", startDate)
            .lte("date", endDate);

        if (error) {
            handleSupabaseError(error, "출결 데이터를 불러오지 못했어요.");
        } else {
            setStatsData(monthData || []);
        }

        const { data: todayData } = await supabase
            .from("student_attendance_status")
            .select("*")
            .eq("date", todayStr);

        const tStats = { present: 0, sick: 0, authorized: 0, unauthorized: 0, unchecked: 0 };

        // Calculate stats
        todayData?.forEach(d => {
            const s = d.status || 'unchecked';
            if (s === 'unchecked') tStats.unchecked++;
            else if (s === 'present') tStats.present++;
            else if (s.startsWith('sick')) tStats.sick++;
            else if (s.startsWith('authorized')) tStats.authorized++;
            else if (s.startsWith('unauthorized')) tStats.unauthorized++;
        });

        // Add implicitly unchecked
        // Use students.length if available, otherwise rely on loaded data count approximation or 0
        // Ideally wait for students to load.
        if (students.length > 0) {
            const checkedCount = todayData?.length || 0;
            tStats.unchecked += Math.max(0, students.length - checkedCount);
        }

        setTodayStats(tStats);
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            fetchAttendanceData();
        }
    }, [currentDate, students]);

    // --- Grid Helpers ---
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatusForCell = (studentId, day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        const record = statsData.find(d => d.student_id === studentId && d.date === dateStr);
        return record?.status || null;
    };

    const docRequiredLogs = statsData.filter(d =>
        d.status && (d.status.startsWith('sick') || d.status.startsWith('authorized'))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const toggleDocumentStatus = async (logId, currentStatus) => {
        const { error } = await supabase
            .from("student_attendance_status")
            .update({ document_submitted: !currentStatus })
            .eq("id", logId);

        if (!error) {
            setStatsData(prev => prev.map(d => d.id === logId ? { ...d, document_submitted: !currentStatus } : d));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. Today's Status Cards */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <h2 className="text-lg font-bold text-gray-900">오늘 출결</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-mono">{getTodayString()}</span>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    <div className="bg-emerald-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-200 hover:scale-105 transition-transform">
                        <span className="text-3xl font-extrabold mb-1">{todayStats.present}</span>
                        <span className="text-xs font-bold opacity-80">출석</span>
                    </div>
                    <div className="bg-blue-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
                        <span className="text-3xl font-extrabold mb-1">{todayStats.sick}</span>
                        <span className="text-xs font-bold opacity-80">질병</span>
                    </div>
                    <div className="bg-purple-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-purple-200 hover:scale-105 transition-transform">
                        <span className="text-3xl font-extrabold mb-1">{todayStats.authorized}</span>
                        <span className="text-xs font-bold opacity-80">출석인정</span>
                    </div>
                    <div className="bg-red-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-red-200 hover:scale-105 transition-transform">
                        <span className="text-3xl font-extrabold mb-1">{todayStats.unauthorized}</span>
                        <span className="text-xs font-bold opacity-80">미인정</span>
                    </div>
                    <div className="bg-gray-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-gray-200 hover:scale-105 transition-transform">
                        <span className="text-3xl font-extrabold mb-1">{todayStats.unchecked}</span>
                        <span className="text-xs font-bold opacity-80">미체크</span>
                    </div>
                </div>
            </section>

            {/* 2. Monthly Grid */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <h2 className="text-lg font-bold text-gray-900">월별 출결 현황</h2>
                    </div>
                    <div className="flex items-center gap-4 bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-md transition"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                        <span className="font-bold text-gray-800 tabular-nums">
                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-md transition"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
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
                                                <td key={day} className="text-center border-r border-gray-50 last:border-0 relative cursor-default p-0">
                                                    {status && (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className={`text-base leading-none select-none ${config?.color}`} title={config?.label}>{config?.icon}</span>

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

            {/* 3. Document Management */}
            <section className="bg-orange-50/50 rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                <div className="p-6 border-b border-orange-100/50 flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <h2 className="text-lg font-bold text-orange-900">월별 출결 서류 관리</h2>
                            <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-bold rounded">질병·출석인정 대상</span>
                        </div>
                        <p className="text-sm text-orange-800/70 mt-1">
                            질병 또는 출석인정 관련 출결 상태인 학생들의 서류 제출 현황을 관리합니다.<br />
                            날짜 카드를 클릭하시면 해당 날짜의 학생 명단과 서류 상태를 확인할 수 있습니다.
                        </p>
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            서류 제출 완료된 학생도 계속 표시되어 관리 상태를 유지할 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-white min-h-[200px] flex flex-col justify-center items-center">
                    {loading ? (
                        <div className="text-gray-400 animate-pulse">데이터 로딩 중...</div>
                    ) : docRequiredLogs.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-50 mb-2">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-bold text-lg mb-1">서류 제출이 필요한 학생이 없습니다</h3>
                                <p className="text-gray-500 text-sm">질병이나 출석인정 관련 출결 상태인 학생이 최근에 없습니다.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {docRequiredLogs.map(log => {
                                const student = students.find(s => s.id === log.student_id);
                                return (
                                    <div key={log.id}
                                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group overflow-hidden ${log.document_submitted ? 'border-gray-100 bg-gray-50/50' : 'border-orange-100 bg-white hover:border-orange-300 hover:shadow-md'}`}
                                        onClick={() => toggleDocumentStatus(log.id, log.document_submitted)}>

                                        {/* Checkmark Watermark for submitted */}
                                        {log.document_submitted && (
                                            <div className="absolute -right-4 -bottom-4 text-green-100 pointer-events-none">
                                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-3 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-lg ${log.document_submitted ? 'text-gray-500' : 'text-gray-900'}`}>{student?.name}</span>
                                                <span className="text-xs text-gray-400">{student?.number}번</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-gray-400 mb-0.5">{log.date}</div>
                                                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${log.document_submitted ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>
                                                    {STATUS_CONFIG[log.status]?.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 relative z-10">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${log.document_submitted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-orange-400'}`}>
                                                {log.document_submitted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                            </div>
                                            <span className={`text-sm font-bold transition-colors ${log.document_submitted ? 'text-green-600' : 'text-gray-600 group-hover:text-orange-800'}`}>
                                                {log.document_submitted ? "제출 완료됨" : "서류 미제출 (클릭하여 완료)"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </section>
        </div>
    );
}
