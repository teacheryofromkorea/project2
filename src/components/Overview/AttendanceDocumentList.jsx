import React from "react";
import { STATUS_CONFIG } from "./AttendanceConstants";

export default function AttendanceDocumentList({
    docRequiredLogs,
    students,
    loading,
    onToggleDocumentStatus
}) {
    return (
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
                                    onClick={() => onToggleDocumentStatus(log.id, log.document_submitted)}>

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
    );
}
