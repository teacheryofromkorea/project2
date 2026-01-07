import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom"; // [삭제] URL 쿼리 파라미터 미사용
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import { getTodayString } from "../../utils/dateUtils";

// Child Components
import AttendanceTodayStats from "./AttendanceTodayStats";
import AttendanceMonthlyTable from "./AttendanceMonthlyTable";
import AttendanceDocumentList from "./AttendanceDocumentList";
import UncheckedStudentsModal from "../Attendance/UncheckedStudentsModal";

export default function AttendanceStatsSection() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [statsData, setStatsData] = useState([]); // All attendance data for the month
    const [students, setStudents] = useState([]);

    // [URL 파라미터 연동 해제]
    // const [searchParams, setSearchParams] = useSearchParams();

    // [날짜 선택 상태] 항상 오늘 날짜로 초기화 (새로고침 시 Today로 리셋)
    const [selectedDateStr, setSelectedDateStr] = useState(getTodayString());

    // [상태 데이터 관리]
    const [todayAttendanceData, setTodayAttendanceData] = useState([]); // 선택된 날짜의 출결 데이터 원본 저장
    const [todayStats, setTodayStats] = useState({ present: 0, sick: 0, authorized: 0, unauthorized: 0, unchecked: 0 });
    const [loading, setLoading] = useState(true);

    // [모달 관련 상태]
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTargetStudents, setModalTargetStudents] = useState([]);
    const [modalConfig, setModalConfig] = useState({ title: "", description: "" });

    // Month navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Year navigation
    const handlePrevYear = () => {
        setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    };
    const handleNextYear = () => {
        setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    };

    // [일자 네비게이션 핸들러]
    const updateSelectedDate = (newDateStr) => {
        setSelectedDateStr(newDateStr);
        // setSearchParams({ date: newDateStr }); // [삭제] URL 업데이트 안 함
    };

    const handleDateChange = (days) => {
        const [year, month, day] = selectedDateStr.split('-').map(Number);
        const newDate = new Date(year, month - 1, day + days);
        const newDateStr = newDate.toLocaleDateString('en-CA');

        updateSelectedDate(newDateStr);
    };

    // [직접 날짜 선택 핸들러]
    const handleDateSelect = (newDateStr) => {
        if (!newDateStr) return;
        updateSelectedDate(newDateStr);
    };

    const handlePrevDate = () => handleDateChange(-1);
    const handleNextDate = () => handleDateChange(1);

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
        // const todayStr = getTodayString(); // [삭제] 기존 오늘 날짜 고정

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
            .eq("date", selectedDateStr); // [수정] 선택된 날짜로 조회

        setTodayAttendanceData(todayData || []); // [추가] 오늘 데이터 저장 (필터링용)

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
        if (students.length > 0) {
            const checkedCount = todayData?.length || 0;
            tStats.unchecked += Math.max(0, students.length - checkedCount);
        }

        setTodayStats(tStats);
        setLoading(false);
    };

    // [오늘 현황 카드 클릭 핸들러]
    const handleCardClick = (category) => {
        let title = "";
        let description = "";
        let targetStudents = [];

        // 1. 카테고리별로 학생 필터링
        if (category === 'unchecked') {
            title = "미체크 학생 목록";
            description = "아직 출결 상태가 확인되지 않은 학생들입니다.";

            // 데이터가 없거나 status가 unchecked인 학생들
            targetStudents = students.filter(student => {
                const record = todayAttendanceData.find(d => d.student_id === student.id);
                return !record || !record.status || record.status === 'unchecked';
            }).map(s => ({ ...s, status: 'unchecked' }));

        } else if (category === 'present') {
            title = "출석 학생 목록";
            description = "정상 출석한 학생들입니다.";

            targetStudents = students.filter(student => {
                const record = todayAttendanceData.find(d => d.student_id === student.id);
                return record && (record.status === 'present' || record.present === true);
            }).map(s => ({ ...s, status: 'present' }));

        } else {
            // 질병, 인정, 미인정 (prefix 매칭)
            const labelMap = {
                'sick': '질병 관련',
                'authorized': '출석 인정 관련',
                'unauthorized': '미인정 관련'
            };
            title = `${labelMap[category] || category} 학생 목록`;
            description = "해당 출결 상태에 해당하는 학생들입니다.";

            targetStudents = students.filter(student => {
                const record = todayAttendanceData.find(d => d.student_id === student.id);
                return record && record.status && record.status.startsWith(category);
            }).map(s => {
                const record = todayAttendanceData.find(d => d.student_id === s.id);
                return { ...s, status: record.status };
            });
        }

        setModalTargetStudents(targetStudents);
        setModalConfig({ title, description });
        setIsModalOpen(true);
    };

    const handleModalUpdate = async () => {
        await fetchAttendanceData(); // 데이터 새로고침
        await fetchYearlyDocStats(); // [추가] 서류 미제출 건수도 즉시 갱신
        // setIsModalOpen(false); // 모달 내부에서 닫힘 처리됨
    };

    // [연간 통계 상태]
    const [yearlyDocCounts, setYearlyDocCounts] = useState({});

    // [연간 통계 조회 함수]
    const fetchYearlyDocStats = async () => {
        const year = currentDate.getFullYear();
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;

        const { data, error } = await supabase
            .from("student_attendance_status")
            .select("date")
            .gte("date", startOfYear)
            .lte("date", endOfYear)
            .eq("document_submitted", false)
            .or("status.ilike.sick%,status.ilike.authorized%"); // 질병 or 인정

        if (!error && data) {
            const counts = {};
            data.forEach(record => {
                const month = new Date(record.date).getMonth() + 1;
                counts[month] = (counts[month] || 0) + 1;
            });
            setYearlyDocCounts(counts);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            fetchAttendanceData();
            fetchYearlyDocStats(); // 연간 통계 조회
        }
    }, [currentDate, students, selectedDateStr]);


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
            fetchYearlyDocStats(); // [추가] 상태 변경 시 통계 갱신
        }
    };

    // [추가] 월별 테이블 셀 클릭 처리
    const handleCellClick = (student, dateStr, currentStatus) => {
        // 1. 해당 날짜로 선택 변경 (데이터 조회 트리거됨)
        updateSelectedDate(dateStr);

        // 2. 모달 열기 준비
        setModalTargetStudents([{
            ...student,
            status: currentStatus || 'unchecked' // 현재 상태가 있으면 가져오고, 없으면 unchecked
        }]);
        setModalConfig({
            title: `${student.name} 학생 출결 수정`,
            description: `${dateStr} 출결 상태를 수정합니다.`
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Today's Status Cards */}
            <AttendanceTodayStats
                todayStats={todayStats}
                onCardClick={handleCardClick}
                selectedDateStr={selectedDateStr}
                onPrevDate={handlePrevDate}
                onNextDate={handleNextDate}
                onDateSelect={handleDateSelect}
            />

            {/* 2. Monthly Grid */}
            <AttendanceMonthlyTable
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                statsData={statsData}
                students={students}
                loading={loading}
                onCellClick={handleCellClick} // [추가] 셀 클릭 핸들러 전달
            />

            {/* 3. Document Management */}
            <AttendanceDocumentList
                docRequiredLogs={docRequiredLogs}
                students={students}
                loading={loading}
                onToggleDocumentStatus={toggleDocumentStatus}
                onMonthSelect={updateSelectedDate}
                monthlyCounts={yearlyDocCounts}
                currentDate={currentDate} // [추가] 년도 표시용
                onPrevYear={handlePrevYear} // [추가] 이전 해
                onNextYear={handleNextYear} // [추가] 다음 해
            />

            {/* [추가] 상세 확인/수정 모달 */}
            <UncheckedStudentsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                uncheckedStudents={modalTargetStudents}
                title={modalConfig.title}
                description={modalConfig.description}
                onSaved={handleModalUpdate}
                targetDate={selectedDateStr} // [수정] 선택된 날짜 전달 (없으면 오늘 날짜는 Modal 내부에서 처리)
            />
        </div>
    );
}
