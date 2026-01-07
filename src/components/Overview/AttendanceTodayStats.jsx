import React from "react";
import CustomDatePicker from "../common/CustomDatePicker";
// import { getTodayString } from "../../utils/dateUtils"; // [삭제] props로 전달받음

// [변경됨] 날짜 네비게이션 props 추가 (selectedDateStr, onPrevDate, onNextDate, onDateSelect)
export default function AttendanceTodayStats({ todayStats, onCardClick, selectedDateStr, onPrevDate, onNextDate, onDateSelect }) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <h2 className="text-lg font-bold text-gray-900">오늘 출결</h2>

                {/* [추가] 날짜 이동 및 선택 (달력 사용 가능) */}
                <div className="flex items-center gap-1 ml-2 bg-gray-50 rounded-lg p-0.5 border border-transparent hover:border-blue-100 transition-colors">
                    <button onClick={onPrevDate} className="p-1 hover:bg-white rounded-md transition text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>

                    {/* Custom Date Picker */}
                    <CustomDatePicker
                        value={selectedDateStr}
                        onChange={onDateSelect}
                    />

                    <button onClick={onNextDate} className="p-1 hover:bg-white rounded-md transition text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {/* 1. 출석 카드 */}
                <div
                    onClick={() => onCardClick('present')}
                    className="bg-emerald-50 rounded-xl py-2 px-3 border border-emerald-100 flex flex-col items-center justify-center hover:bg-emerald-100 transition-colors cursor-pointer group"
                >
                    <span className="text-2xl font-bold text-emerald-600 mb-0.5 group-hover:scale-110 transition-transform">{todayStats.present}</span>
                    <span className="text-[11px] font-bold text-emerald-500/80">출석</span>
                </div>

                {/* 2. 질병 카드 */}
                <div
                    onClick={() => onCardClick('sick')}
                    className="bg-blue-50 rounded-xl py-2 px-3 border border-blue-100 flex flex-col items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer group"
                >
                    <span className="text-2xl font-bold text-blue-600 mb-0.5 group-hover:scale-110 transition-transform">{todayStats.sick}</span>
                    <span className="text-[11px] font-bold text-blue-500/80">질병</span>
                </div>

                {/* 3. 출석인정 카드 */}
                <div
                    onClick={() => onCardClick('authorized')}
                    className="bg-purple-50 rounded-xl py-2 px-3 border border-purple-100 flex flex-col items-center justify-center hover:bg-purple-100 transition-colors cursor-pointer group"
                >
                    <span className="text-2xl font-bold text-purple-600 mb-0.5 group-hover:scale-110 transition-transform">{todayStats.authorized}</span>
                    <span className="text-[11px] font-bold text-purple-500/80">출석인정</span>
                </div>

                {/* 4. 미인정 카드 */}
                <div
                    onClick={() => onCardClick('unauthorized')}
                    className="bg-red-50 rounded-xl py-2 px-3 border border-red-100 flex flex-col items-center justify-center hover:bg-red-100 transition-colors cursor-pointer group"
                >
                    <span className="text-2xl font-bold text-red-600 mb-0.5 group-hover:scale-110 transition-transform">{todayStats.unauthorized}</span>
                    <span className="text-[11px] font-bold text-red-500/80">미인정</span>
                </div>

                {/* 5. 미체크 카드 */}
                <div
                    onClick={() => onCardClick('unchecked')}
                    className="bg-gray-100 rounded-xl py-2 px-3 border border-gray-200 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer group"
                >
                    <span className="text-2xl font-bold text-gray-600 mb-0.5 group-hover:scale-110 transition-transform">{todayStats.unchecked}</span>
                    <span className="text-[11px] font-bold text-gray-500/80">미체크</span>
                </div>
            </div>
        </section>
    );
}
