import React from "react";
import { STATUS_CONFIG } from "./AttendanceConstants";

export default function AttendanceDocumentList({
    docRequiredLogs,
    students,
    loading,
    onToggleDocumentStatus,
    onMonthSelect, // [추가] 월 선택 시 상위 컴포넌트에 알림
    monthlyCounts = {}, // [추가] 월별 미제출 카운트
    currentDate = new Date(), // [추가]
    onPrevYear, // [추가]
    onNextYear  // [추가]
}) {
    // [추가] 뷰 모드: 'months' | 'list' (초기값: 'months'로 설정하여 1-12월 버튼 먼저 노출)
    const [viewMode, setViewMode] = React.useState('months');

    // [추가] 제출 완료 항목 숨김 상태 (기본값: true)
    const [hideCompleted, setHideCompleted] = React.useState(true);

    // [추가] 날짜별 접기/피기 상태 관리
    const [expandedDates, setExpandedDates] = React.useState({});

    const currentYear = currentDate.getFullYear(); // [추가]

    // Toggle logic for date groups
    const toggleDateGroup = (date) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    // Filter logs based on toggle
    const filteredLogs = docRequiredLogs.filter(log => {
        if (hideCompleted && log.document_submitted) return false;
        return true;
    });

    // Grouping
    const groupedLogs = Object.entries(
        filteredLogs
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .reduce((acc, log) => {
                const dateKey = log.date;
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(log);
                return acc;
            }, {})
    );

    // Initial expand effect (expand all new groups by default)
    React.useEffect(() => {
        const newExpanded = {};
        groupedLogs.forEach(([date]) => {
            if (expandedDates[date] === undefined) {
                newExpanded[date] = true; // Default to open
            }
        });
        if (Object.keys(newExpanded).length > 0) {
            setExpandedDates(prev => ({ ...prev, ...newExpanded }));
        }
    }, [groupedLogs.length]); // Dependency on logs length

    // Handle Month Click
    const handleMonthClick = (month) => {
        // [수정] 현재 선택된 년도로 날짜 생성
        const monthStr = String(month).padStart(2, '0');
        const newDateStr = `${currentYear}-${monthStr}-01`;

        if (onMonthSelect) {
            onMonthSelect(newDateStr);
        }
        setViewMode('list');
    };

    // Render: Month Selector Grid
    if (viewMode === 'months') {
        const today = new Date();
        const thisYear = today.getFullYear();
        const thisMonth = today.getMonth() + 1;

        return (
            <section className="bg-orange-50/50 rounded-2xl shadow-sm border border-orange-100 overflow-hidden h-full">
                <div className="p-6 border-b border-orange-100/50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-orange-900">월별 서류 관리</h2>
                        </div>
                        <p className="text-sm text-orange-800/70">
                            확인하고 싶은 월을 선택해주세요.
                        </p>
                    </div>

                    {/* Year Navigation */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm">
                        <button onClick={onPrevYear} className="p-1 hover:bg-orange-50 rounded text-orange-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <span className="text-lg font-black text-orange-900 mx-1">{currentYear}년</span>
                        <button onClick={onNextYear} className="p-1 hover:bg-orange-50 rounded text-orange-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                        const count = monthlyCounts[month] || 0;
                        const isCurrentMonth = currentYear === thisYear && month === thisMonth; // [수정] 년도까지 확인

                        return (
                            <button
                                key={month}
                                onClick={() => handleMonthClick(month)}
                                className={`relative border rounded-xl p-4 transition-all group flex flex-col items-center justify-center gap-2 aspect-square md:aspect-auto md:h-24
                                    ${isCurrentMonth ? 'border-orange-400 bg-white ring-2 ring-orange-100' : 'border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50'}
                                `}
                            >
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-black transition-colors ${isCurrentMonth ? 'text-orange-600' : 'text-gray-300 group-hover:text-orange-500'}`}>
                                        {month}
                                    </span>
                                    <span className={`text-sm font-bold ${isCurrentMonth ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-600'}`}>
                                        월
                                    </span>
                                </div>

                                {count > 0 ? (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                        {count}건
                                    </span>
                                ) : (
                                    <span className="absolute top-2 right-2 bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                        완료
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>
        );
    }

    // Render: List View
    return (
        <section className="bg-orange-50/50 rounded-2xl shadow-sm border border-orange-100 overflow-hidden min-h-full flex flex-col">
            <div className="p-6 border-b border-orange-100/50 flex flex-wrap gap-4 items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    <button
                        onClick={() => setViewMode('months')}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-orange-300 transition-colors text-gray-500 hover:text-orange-600"
                        title="월 선택으로 돌아가기"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-orange-900">월별 출결 서류 관리</h2>
                            <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-bold rounded">질병·출석인정 대상</span>
                        </div>
                    </div>
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-2 rounded-lg border border-orange-200 shadow-sm hover:bg-orange-50 transition-colors">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={hideCompleted} onChange={() => setHideCompleted(!hideCompleted)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${hideCompleted ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${hideCompleted ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 hidden sm:inline">완료 숨김</span>
                    </label>
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-white flex-1 min-h-[400px]">
                {loading ? (
                    <div className="text-gray-400 animate-pulse text-center py-20">데이터 로딩 중...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-50 mb-2">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg mb-1">
                                {hideCompleted ? "제출 필요한 항목이 없습니다" : "해당하는 데이터가 없습니다"}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {hideCompleted ? "모든 서류 제출이 완료되었습니다! 🎉" : "질병이나 출석인정 관련 출결 상태인 학생이 최근에 없습니다."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        {groupedLogs.map(([date, logs]) => {
                            const dateObj = new Date(date);
                            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
                            const formattedDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${dayOfWeek})`;
                            const isExpanded = expandedDates[date] !== false; // Default true if undefined

                            return (
                                <div key={date} className="relative border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    {/* Date Header (Clickable) */}
                                    <div
                                        onClick={() => toggleDateGroup(date)}
                                        className="sticky top-0 z-20 flex items-center justify-between bg-orange-50/80 backdrop-blur-sm px-4 py-3 cursor-pointer hover:bg-orange-100/50 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-orange-400 rounded-full"></div>
                                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                                                {formattedDate}
                                            </h3>
                                            <span className="text-xs font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-100 shadow-sm">
                                                {logs.length}명
                                            </span>
                                        </div>
                                        {/* Expand Icon */}
                                        <svg className={`w-5 h-5 text-orange-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>

                                    {/* Compact List Rows (Collapsible) */}
                                    {isExpanded && (
                                        <div className="bg-white divide-y divide-gray-100 border-t border-gray-100 animate-fadeIn">
                                            {logs.map(log => {
                                                const student = students.find(s => s.id === log.student_id);
                                                return (
                                                    <div key={log.id}
                                                        className={`flex items-center justify-between px-4 py-3 hover:bg-orange-50/30 transition-colors cursor-pointer group ${log.document_submitted ? 'bg-gray-50/50' : ''}`}
                                                        onClick={() => onToggleDocumentStatus(log.id, log.document_submitted)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {/* Status Checkbox Design */}
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${log.document_submitted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-orange-400'}`}>
                                                                {log.document_submitted && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold text-base ${log.document_submitted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{student?.name}</span>
                                                                <span className="text-xs text-gray-400">{student?.number}번</span>
                                                            </div>

                                                            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${log.document_submitted ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-700'}`}>
                                                                {STATUS_CONFIG[log.status]?.label}
                                                            </span>
                                                        </div>

                                                        <div className={`text-xs font-medium transition-colors ${log.document_submitted ? 'text-green-600' : 'text-orange-400 group-hover:text-orange-600'}`}>
                                                            {log.document_submitted ? "제출 완료" : "제출 확인(클릭)"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </section >
    );
}
