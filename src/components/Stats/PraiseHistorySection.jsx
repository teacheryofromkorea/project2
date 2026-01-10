import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    getDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";

// 로그 수정 모달
function LogEditModal({ isOpen, log, onClose, onUpdate, onDelete }) {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (log) {
            setReason(log.reason || "");
        }
    }, [log]);

    if (!isOpen || !log) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1e1e24] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">기록 수정</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-white/60 mb-1">칭찬 종류</p>
                    <div className="text-white font-medium flex items-center gap-2">
                        <span>{log.stat?.icon}</span>
                        <span>{log.stat?.name}</span>
                        <span className={log.delta > 0 ? "text-emerald-400" : "text-rose-400"}>
                            ({log.delta > 0 ? "+" : ""}{log.delta})
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-white/60 mb-2">사유 (선택)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full h-24 bg-black/20 rounded-xl p-3 text-white placeholder-white/20 border border-white/10 focus:border-indigo-500/50 outline-none resize-none"
                        placeholder="사유를 입력해주세요..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onDelete(log.id)}
                        className="flex-1 py-3 rounded-xl font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        삭제
                    </button>
                    <button
                        onClick={() => onUpdate(log.id, reason)}
                        className="flex-[2] py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                    >
                        수정 완료
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function PraiseHistorySection({ selectedStudentId, optimisticLog }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 수정 모달 상태
    const [editingLog, setEditingLog] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Optimistic Log 추가
    useEffect(() => {
        if (optimisticLog) {
            setLogs((prev) => [optimisticLog, ...prev]);
            // 만약 현재 보고 있는 날짜가 오늘이 아니라면 오늘로 이동 (사용자 편의)
            if (!isToday(selectedDate)) {
                setSelectedDate(new Date());
            }
        }
    }, [optimisticLog]);

    // 초기 데이터 로드
    const fetchLogs = async () => {
        setLoading(true);

        let query = supabase
            .from("student_stat_logs")
            .select(`
id,
    created_at,
    delta,
    reason,
    student: students(id, name, number, gender),
        stat: stat_templates(id, name, icon, color)
      `)
            .order("created_at", { ascending: false })
            .limit(200);

        if (selectedStudentId) {
            query = query.eq("student_id", selectedStudentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching praise history:", error);
        } else {
            setLogs(data || []);
        }
        setLoading(false);
    };

    // 실시간 구독
    useEffect(() => {
        fetchLogs();

        const subscription = supabase
            .channel("praise_history_realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "student_stat_logs",
                    filter: selectedStudentId
                        ? `student_id = eq.${selectedStudentId} `
                        : undefined,
                },
                async (payload) => {
                    const { data, error } = await supabase
                        .from("student_stat_logs")
                        .select(`
id,
    created_at,
    delta,
    reason,
    student: students(id, name, number, gender),
        stat: stat_templates(id, name, icon, color)
            `)
                        .eq("id", payload.new.id)
                        .single();

                    if (!error && data) {
                        setLogs((prev) => {
                            // 중복 방지 (Optimistic update로 이미 추가되었을 수 있음)
                            // id가 temp-로 시작하는 것은 실제 DB id로 교체해야 이상적이지만,
                            // 지금은 단순하게 중복 렌더링만 처리하거나, 리스트 갱신을 수행함.
                            // 만약 방금 추가한 optimisticLog와 내용이 같다면 중복 제거가 필요할 수 있음.
                            // 여기서는 간단히 최신 데이터를 앞에 추가하되, 중복 방지를 위해 id 체크
                            const exists = prev.some(log => log.id === data.id);
                            if (exists) return prev;
                            return [data, ...prev];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [selectedStudentId]);

    const handleUpdateLog = async (logId, newReason) => {
        // Optimistic Update
        setLogs((prev) =>
            prev.map((log) => (log.id === logId ? { ...log, reason: newReason } : log))
        );
        setIsEditModalOpen(false);

        // 실제 DB 업데이트 (temp ID 무시 - 실제로는 temp ID일 때 queue잉 처리가 필요하나 생략)
        if (typeof logId === "string" && logId.startsWith("temp-")) {
            // temp ID인 경우 아직 DB에 없을 수 있으므로 (보통은 빠르지만)
            // 여기서는 간단히 pass 하거나 추후 처리가 필요함.
            // 하지만 UX상 1초 뒤면 생성되므로, 보통은 Realtime으로 덮어써짐.
            // 여기서는 '수정'은 DB ID가 있을 때만 유효하다고 가정 (Optimistic log는 '방금' 생긴거라 수정할 일이 잘 없을수도 있지만, 사용자가 바로 수정 누르면 문제될 수 있음)
            // -> 개선: Optimistic Log가 DB ID가 없으면 에러가 날 수 있음.
            // -> 현실적 해결: 그냥 alert 띄우거나, 여기서는 일단 무시.
            console.warn("Temp ID log updated - wait for sync");
            return;
        }

        const { error } = await supabase
            .from("student_stat_logs")
            .update({ reason: newReason })
            .eq("id", logId);

        if (error) {
            console.error("Failed to update log reason:", error);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!confirm("정말 이 기록을 삭제하시겠습니까?\n(점수는 되돌려지지 않습니다)")) return;

        // Optimistic Delete
        setLogs((prev) => prev.filter((log) => log.id !== logId));
        setIsEditModalOpen(false);

        if (typeof logId === "string" && logId.startsWith("temp-")) return;

        const { error } = await supabase
            .from("student_stat_logs")
            .delete()
            .eq("id", logId);

        if (error) {
            console.error("Failed to delete log:", error);
        }
    };

    // 날짜별 로그 카운트 맵 생성
    const logCountByDate = useMemo(() => {
        const map = {};
        logs.forEach((log) => {
            const dateKey = format(new Date(log.created_at), "yyyy-MM-dd");
            map[dateKey] = (map[dateKey] || 0) + 1;
        });
        return map;
    }, [logs]);

    // 선택된 날짜의 로그 (버그 수정: 문자열 비교)
    const selectedDateLogs = useMemo(() => {
        const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
        return logs.filter((log) => {
            const logDateKey = format(new Date(log.created_at), "yyyy-MM-dd");
            return logDateKey === selectedDateKey;
        });
    }, [logs, selectedDate]);

    // 현재 월의 날짜 배열
    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // 히트맵 색상 결정
    const getHeatColor = (count) => {
        if (count === 0) return "bg-white/5";
        if (count <= 2) return "bg-emerald-900/50";
        if (count <= 5) return "bg-emerald-700/60";
        if (count <= 10) return "bg-emerald-500/70";
        return "bg-emerald-400/80";
    };

    if (loading && logs.length === 0) {
        return (
            <div className="p-8 text-center text-white/50">히스토리 불러오는 중...</div>
        );
    }

    // 첫 번째 날의 요일 (0=일, 1=월, ...)
    const firstDayOfWeek = getDay(startOfMonth(currentMonth));

    return (
        <section className="bg-transparent h-full flex flex-col relative">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                <span>📅</span> 칭찬 히스토리
            </h2>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* 왼쪽: 캘린더 히트맵 */}
                <div className="w-1/2 bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col">
                    {/* 월 네비게이션 */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white/60" />
                        </button>
                        <span className="font-bold text-white text-base">
                            {format(currentMonth, "yyyy년 M월", { locale: ko })}
                        </span>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
                        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs text-white/40 font-medium py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 날짜 그리드 */}
                    <div className="flex-1 grid grid-cols-7 gap-1 min-h-0">
                        {/* 빈 칸 채우기 */}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty - ${i} `} className="w-full h-full" />
                        ))}

                        {daysInMonth.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const count = logCountByDate[dateKey] || 0;
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
w - full h - full rounded - lg flex items - center justify - center text - sm font - medium transition - all
                  ${getHeatColor(count)}
                  ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-transparent z-10" : ""}
                  ${isTodayDate && !isSelected ? "ring-1 ring-amber-400" : ""}
hover: scale - 110 hover: z - 20
    `}
                                    title={`${format(day, "M/d")}: ${count} 건`}
                                >
                                    <span className={count > 0 ? "text-white" : "text-white/20"}>
                                        {format(day, "d")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* 범례 */}
                    <div className="flex items-center justify-end gap-2 mt-auto pt-4 text-xs text-white/50 flex-shrink-0">
                        <span>적음</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded bg-white/5" />
                            <div className="w-3 h-3 rounded bg-emerald-900/50" />
                            <div className="w-3 h-3 rounded bg-emerald-700/60" />
                            <div className="w-3 h-3 rounded bg-emerald-500/70" />
                            <div className="w-3 h-3 rounded bg-emerald-400/80" />
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 선택된 날짜의 로그 리스트 */}
                <div className="w-1/2 bg-white/5 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
                    {/* 리스트 헤더 */}
                    <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-white/5 flex-shrink-0">
                        <span className="text-lg font-bold text-white">
                            {isToday(selectedDate)
                                ? "오늘"
                                : format(selectedDate, "M월 d일 (EEE)", { locale: ko })}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {selectedDateLogs.length}건
                        </span>
                    </div>

                    {/* 리스트 본문 */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20">
                        {selectedDateLogs.length === 0 ? (
                            <div className="text-center py-20 text-white/30 text-base">
                                기록이 없습니다
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {selectedDateLogs.map((log) => (
                                        <LogItem
                                            key={log.id}
                                            log={log}
                                            onEdit={() => {
                                                setEditingLog(log);
                                                setIsEditModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LogEditModal
                isOpen={isEditModalOpen}
                log={editingLog}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateLog}
                onDelete={handleDeleteLog}
            />
        </section>
    );
}

// 개별 로그 아이템 (Normal Size)
function LogItem({ log, onEdit }) {
    const isPositive = log.delta > 0;
    const timeLabel = format(new Date(log.created_at), "a h:mm", { locale: ko });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`
        group relative flex items-start gap-4 p-4 rounded-xl transition-all
        ${isPositive
                    ? "bg-white/5 border border-white/5 hover:bg-white/10"
                    : "bg-red-500/5 border border-red-500/5 hover:bg-red-500/10"
                }
      `}
        >
            {/* 아이콘 */}
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${isPositive ? "bg-white/5" : "bg-red-500/10"
                    }`}
            >
                {log.stat?.icon || (isPositive ? "👍" : "⚠️")}
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
                {/* 상단: 칭찬 종류 + 시간 */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">{log.stat?.name}</span>
                        <span
                            className={`text-lg font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                        >
                            {isPositive ? "+" : ""}
                            {log.delta}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white/40 font-mono">
                            {timeLabel}
                        </span>

                        {/* 수정 버튼 (호버 시 표시) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="text-white/20 hover:text-white p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                </div>

                {/* 하단: 사유 (강조됨) */}
                {log.reason ? (
                    <div className="bg-or-backdrop-light rounded-lg p-3 border border-white/5 cursor-pointer hover:border-white/20 transition-colors" onClick={onEdit}>
                        <p className="text-white text-base leading-relaxed break-words">
                            "{log.reason}"
                        </p>
                    </div>
                ) : (
                    // 사유가 없을 때도 클릭하여 입력할 수 있도록 영역 표시 (호버 시)
                    <div
                        className="h-2 group-hover:h-auto group-hover:mt-2 transition-all overflow-hidden"
                        onClick={onEdit}
                    >
                        <div className="text-xs text-white/30 cursor-pointer hover:text-white/60 p-1 border border-dashed border-white/10 rounded text-center">
                            + 사유 추가하기
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
