import React from "react";
// import { getTodayString } from "../../utils/dateUtils"; // [삭제] props로 전달받음

// [변경됨] 날짜 네비게이션 props 추가 (selectedDateStr, onPrevDate, onNextDate, onDateSelect)
export default function AttendanceTodayStats({ todayStats, onCardClick, selectedDateStr, onPrevDate, onNextDate, onDateSelect }) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <h2 className="text-lg font-bold text-gray-900">오늘 출결</h2>

                {/* [추가] 날짜 이동 및 선택 (달력 사용 가능) */}
                <div className="flex items-center gap-1 ml-2 bg-gray-100 rounded-lg p-1 border border-transparent hover:border-blue-200 transition-colors">
                    <button onClick={onPrevDate} className="p-1 hover:bg-white rounded-md transition text-gray-500 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>

                    {/* Native Date Picker Input */}
                    <input
                        type="date"
                        value={selectedDateStr}
                        onChange={(e) => onDateSelect(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 text-center font-mono focus:outline-none cursor-pointer hover:bg-white/50 rounded px-1 min-w-[110px]"
                    />

                    <button onClick={onNextDate} className="p-1 hover:bg-white rounded-md transition text-gray-500 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
                {/* 1. 출석 카드 */}
                <div
                    onClick={() => onCardClick('present')}
                    className="bg-emerald-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-200 hover:scale-105 transition-transform cursor-pointer"
                >
                    <span className="text-3xl font-extrabold mb-1">{todayStats.present}</span>
                    <span className="text-xs font-bold opacity-80">출석</span>
                </div>

                {/* 2. 질병 카드 */}
                <div
                    onClick={() => onCardClick('sick')}
                    className="bg-blue-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 transition-transform cursor-pointer"
                >
                    <span className="text-3xl font-extrabold mb-1">{todayStats.sick}</span>
                    <span className="text-xs font-bold opacity-80">질병</span>
                </div>

                {/* 3. 출석인정 카드 */}
                <div
                    onClick={() => onCardClick('authorized')}
                    className="bg-purple-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-purple-200 hover:scale-105 transition-transform cursor-pointer"
                >
                    <span className="text-3xl font-extrabold mb-1">{todayStats.authorized}</span>
                    <span className="text-xs font-bold opacity-80">출석인정</span>
                </div>

                {/* 4. 미인정 카드 */}
                <div
                    onClick={() => onCardClick('unauthorized')}
                    className="bg-red-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-red-200 hover:scale-105 transition-transform cursor-pointer"
                >
                    <span className="text-3xl font-extrabold mb-1">{todayStats.unauthorized}</span>
                    <span className="text-xs font-bold opacity-80">미인정</span>
                </div>

                {/* 5. 미체크 카드 */}
                <div
                    onClick={() => onCardClick('unchecked')}
                    className="bg-gray-500 rounded-xl p-4 text-white flex flex-col items-center justify-center shadow-lg shadow-gray-200 hover:scale-105 transition-transform cursor-pointer"
                >
                    <span className="text-3xl font-extrabold mb-1">{todayStats.unchecked}</span>
                    <span className="text-xs font-bold opacity-80">미체크</span>
                </div>
            </div>
        </section>
    );
}
