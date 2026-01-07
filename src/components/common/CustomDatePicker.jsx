import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getHolidayName } from "../../utils/holidayUtils"; // [추가] 공휴일 유틸

export default function CustomDatePicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(value || new Date())); // Calendar view date
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Constants
    const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

    // Initialize logic
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value, isOpen]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target) && !event.target.closest('.datepicker-portal')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Update position on open
    const triggerRef = useRef(null);
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
            });
        }
    }, [isOpen]);


    // Calendar Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

    const handleDayClick = (day) => {
        // Enforce YYYY-MM-DD format manually to match input type="date"
        const selected = new Date(currentYear, currentMonth, day);
        // correction for timezone - use local YYYY-MM-DD
        const y = selected.getFullYear();
        const m = String(selected.getMonth() + 1).padStart(2, '0');
        const d = String(selected.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const handleTodayClick = () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setViewDate(today);
        setIsOpen(false);
    }

    // Grid Generation
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div ref={containerRef} className="relative inline-block">
            {/* Trigger (Input-like) */}
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors group"
            >
                <span className={`text-sm font-bold font-mono ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {value || "날짜 선택"}
                </span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>

            {/* Portal for Calendar Popover */}
            {isOpen && createPortal(
                <div
                    className="datepicker-portal absolute z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: position.top, left: position.left }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <div className="font-bold text-gray-900">
                            {currentYear}년 {currentMonth + 1}월
                        </div>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {DAYS.map(day => (
                            <div key={day} className={`text-xs font-bold ${day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : 'text-gray-400'}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {blanks.map(b => <div key={`blank-${b}`} />)}
                        {days.map(d => {
                            const dateObj = new Date(currentYear, currentMonth, d);
                            const dayOfWeek = dateObj.getDay(); // 0 is Sunday
                            const holidayName = getHolidayName(dateObj);

                            const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const isToday = new Date().toDateString() === dateObj.toDateString();

                            const isRedDay = dayOfWeek === 0 || !!holidayName; // Sunday or Holiday

                            return (
                                <button
                                    key={d}
                                    onClick={(e) => { e.stopPropagation(); handleDayClick(d); }}
                                    title={holidayName || ''}
                                    className={`
                                        h-8 w-8 text-sm rounded-full flex items-center justify-center transition-all relative group
                                        ${isSelected ? 'bg-blue-600 text-white font-bold shadow-md' : 'hover:bg-gray-100'}
                                        ${!isSelected && isRedDay ? 'text-red-500 font-medium' : ''}
                                        ${!isSelected && !isRedDay && dayOfWeek === 6 ? 'text-blue-500' : ''}
                                        ${!isSelected && !isRedDay && dayOfWeek !== 6 ? 'text-gray-700' : ''}
                                        ${!isSelected && isToday ? 'ring-1 ring-blue-500 !text-blue-600 font-bold' : ''}
                                    `}
                                >
                                    {d}
                                    {/* Holiday Indicator Dot (Optional) */}
                                    {holidayName && !isSelected && (
                                        <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full mx-auto"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleTodayClick(); }}
                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition"
                        >
                            오늘
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
