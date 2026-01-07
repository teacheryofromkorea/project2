import React, { useState, useRef } from "react";
import { createPortal } from "react-dom"; // [추가] Portal import
import { STATUS_CONFIG } from "./AttendanceConstants";

// [추가] Portal Tooltip Component
const PortalTooltip = ({ visible, x, y, label, isDocMissing }) => {
    if (!visible) return null;

    return createPortal(
        <div
            className="fixed z-[9999] pointer-events-none flex flex-col items-center animate-in fade-in duration-200"
            style={{ left: x, top: y, transform: 'translate(-50%, -100%)', marginTop: '-8px' }}
        >
            <div className="px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded shadow-xl font-medium whitespace-nowrap flex flex-col items-center gap-0.5 relative">
                <span>{label}</span>
                {isDocMissing && (
                    <span className="text-red-300 font-bold flex items-center gap-1 text-[11px] mt-0.5">
                        <span>⚠️</span> 서류 미제출
                    </span>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
        </div>,
        document.body
    );
};

// [추가] 공휴일 목록 (양력 기준 고정 공휴일)
const FIXED_HOLIDAYS = {
    "01-01": "신정",
    "03-01": "삼일절",
    "05-05": "어린이날",
    "06-06": "현충일",
    "08-15": "광복절",
    "10-03": "개천절",
    "10-09": "한글날",
    "12-25": "성탄절"
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function AttendanceMonthlyTable({
    currentDate,
    onPrevMonth,
    onNextMonth,
    statsData,
    students,
    loading,
    onCellClick // [추가] 셀 클릭 핸들러
}) {
    // [추가] 컬럼 하이라이트를 위한 hover state
    const [hoveredDay, setHoveredDay] = React.useState(null);

    // [추가] Portal Tooltip State
    const [tooltipState, setTooltipState] = useState({
        visible: false,
        x: 0,
        y: 0,
        label: '',
        isDocMissing: false
    });

    // Grid Helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatusForCell = (studentId, day) => {
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        const today = new Date();

        // Reset time for accurate comparison
        const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const checkDateZero = new Date(year, month, day);

        const record = statsData.find(d => d.student_id === studentId && d.date === dateStr);

        if (record) return record.status || 'unchecked';

        // If no record,check if date is valid for "unchecked" (past or today)
        if (checkDateZero <= todayZero) {
            return 'unchecked';
        }

        return null; // Future dates show nothing
    };

    // [추가] Tooltip Handlers
    const handleMouseEnter = (e, label, isDocMissing) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipState({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top, // Cell top
            label,
            isDocMissing
        });
    };

    const handleMouseLeave = () => {
        setTooltipState(prev => ({ ...prev, visible: false }));
    };

    // [추가] 날짜별 속성 계산 Helper
    const getDateProps = (day) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)
        const dateStr = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        const isHoliday = FIXED_HOLIDAYS[dateStr]; // 공휴일인지 확인

        let colorClass = "text-gray-700";
        if (isSunday || isHoliday) colorClass = "text-red-500";
        else if (isSaturday) colorClass = "text-blue-500";

        // [수정] 배경색 제거 (User Request)
        const bgClass = "";

        return { dayOfWeek, isSunday, isSaturday, isHoliday, colorClass, bgClass };
    };

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <h2 className="text-lg font-bold text-gray-900">월별 출결 현황</h2>
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
                            <span className="text-lg">🏥</span> 질병 (서류 필요)
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
                            <span className="text-lg">📋</span> 출석인정 (서류 필요)
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

                </div>
            </div>

            {/* Month Navigation & Doc Legend */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-4 bg-white rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm">
                    <button onClick={onPrevMonth} className="p-1 hover:bg-gray-100 rounded-md transition text-gray-500 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <span className="font-bold text-gray-800 text-lg tabular-nums min-w-[100px] text-center">
                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </span>
                    <button onClick={onNextMonth} className="p-1 hover:bg-gray-100 rounded-md transition text-gray-500 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                {/* Document Missing Legend (Moved) */}
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 text-xs">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">!</span>
                    <span className="text-gray-600 font-medium">서류 미제출 (조치 필요)</span>
                    <div className="w-px h-3 bg-gray-300 mx-1"></div>
                    <span className="text-gray-400">💡 마우스를 올리면 상세 내용 확인 가능</span>
                </div>
            </div>
            {/* Grid Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 h-10">
                            <th className="px-2 text-center font-bold text-gray-700 min-w-[80px] sticky left-0 bg-gray-50 z-10 border-r border-gray-200 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">학생명</th>
                            {daysArray.map(day => {
                                const { dayOfWeek, colorClass, bgClass, isHoliday } = getDateProps(day);
                                const dayName = DAY_NAMES[dayOfWeek];
                                // [수정] 렌더링 최적화: key는 day
                                return (
                                    <th
                                        key={day}
                                        className={`w-[30px] min-w-[30px] text-center text-xs transition-colors cursor-default border-r border-transparent ${hoveredDay === day ? "bg-blue-100/50 text-blue-800 font-bold" : `hover:bg-gray-100 ${bgClass}`
                                            }`}
                                        onMouseEnter={() => setHoveredDay(day)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                    >
                                        <div className="flex flex-col items-center justify-center py-1">
                                            <span className={`font-medium ${colorClass}`}>{day}</span>
                                            <span className={`text-[10px] ${colorClass} opacity-70`}>({dayName})</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            <tr><td colSpan={daysInMonth + 1} className="py-20 text-center text-gray-400">데이터를 불러오는 중...</td></tr>
                        ) : (
                            students.map((student) => {
                                // Gender Styling Logic
                                const isBoy = student.gender === '남' || student.gender === 'male' || student.gender === 'M';
                                const isGirl = student.gender === '여' || student.gender === 'female' || student.gender === 'F';

                                let genderClass = "text-gray-400 font-normal";
                                if (isBoy) genderClass = "bg-blue-100 text-blue-600 font-bold rounded-md px-1.5 py-0.5";
                                if (isGirl) genderClass = "bg-rose-100 text-rose-600 font-bold rounded-md px-1.5 py-0.5";

                                return (
                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors h-10">
                                        {/* Name Column */}
                                        <td className="px-2 font-bold text-gray-900 bg-white border-r border-gray-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-center group-hover:bg-blue-50/30 whitespace-nowrap">
                                            <span className={`text-xs mr-2 inline-block ${genderClass}`}>{student.number}</span>
                                            {student.name}
                                        </td>
                                        {/* Days Columns */}
                                        {daysArray.map(day => {
                                            const status = getStatusForCell(student.id, day);
                                            const config = STATUS_CONFIG[status];
                                            const isHoveredCol = hoveredDay === day;
                                            const { bgClass } = getDateProps(day); // [추가] 휴일 배경색 적용

                                            // Check if document missing
                                            let isDocMissing = false;
                                            if (status && (status.startsWith('sick') || status.startsWith('authorized'))) {
                                                const record = statsData.find(d => d.student_id === student.id && d.date.endsWith(String(day).padStart(2, '0')));
                                                if (record && record.document_submitted === false) {
                                                    isDocMissing = true;
                                                }
                                            }

                                            return (
                                                <td
                                                    key={day}
                                                    className={`text-center border-r border-gray-50 last:border-0 relative p-0 align-middle transition-colors cursor-pointer hover:font-bold ${isHoveredCol ? "bg-blue-50/50" : bgClass
                                                        }`}
                                                    onClick={() => {
                                                        const monthStr = String(month + 1).padStart(2, '0');
                                                        const dayStr = String(day).padStart(2, '0');
                                                        const dateStr = `${year}-${monthStr}-${dayStr}`;
                                                        onCellClick && onCellClick(student, dateStr, status);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        setHoveredDay(day);
                                                        // [수정] 툴팁 표시 로직 (Portal 사용)
                                                        if (status) {
                                                            handleMouseEnter(e, config?.label, isDocMissing);
                                                        }
                                                    }}
                                                    onMouseLeave={() => {
                                                        setHoveredDay(null);
                                                        handleMouseLeave();
                                                    }}
                                                >
                                                    {status && (
                                                        <div className="w-full h-10 flex items-center justify-center group relative">
                                                            <span className={`text-base leading-none select-none ${config?.color}`}>{config?.icon}</span>

                                                            {/* Document Status Indicator Badge */}
                                                            {isDocMissing && (
                                                                <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3 h-3 bg-red-500 rounded-full text-white text-[8px] font-bold ring-1 ring-white shadow-sm z-10">
                                                                    !
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* [추가] 툴팁 렌더링 */}
            <PortalTooltip
                visible={tooltipState.visible}
                x={tooltipState.x}
                y={tooltipState.y}
                label={tooltipState.label}
                isDocMissing={tooltipState.isDocMissing}
            />
        </section>
    );
}
