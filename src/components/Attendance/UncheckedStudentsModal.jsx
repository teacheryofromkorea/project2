import React, { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import { getTodayString } from "../../utils/dateUtils";

const ATTENDANCE_OPTIONS = [
    { value: "unchecked", label: "미체크", color: "bg-gray-100 text-gray-700" },
    { value: "sick-absent", label: "질병결석", color: "bg-blue-100 text-blue-700" },
    { value: "sick-late", label: "질병지각", color: "bg-blue-100 text-blue-700" },
    { value: "sick-early-leave", label: "질병조퇴", color: "bg-blue-100 text-blue-700" },
    { value: "authorized-absent", label: "출석인정결석", color: "bg-purple-100 text-purple-700" },
    { value: "authorized-late", label: "출석인정지각", color: "bg-purple-100 text-purple-700" },
    { value: "authorized-early-leave", label: "출석인정조퇴", color: "bg-purple-100 text-purple-700" },
    { value: "unauthorized-absent", label: "미인정결석", color: "bg-red-100 text-red-700" },
    { value: "unauthorized-late", label: "미인정지각", color: "bg-red-100 text-red-700" },
    { value: "unauthorized-early-leave", label: "미인정조퇴", color: "bg-red-100 text-red-700" },
];

export default function UncheckedStudentsModal({
    isOpen,
    onClose,
    uncheckedStudents, // Array of student objects
    onSaved, // Callback to refresh parent data
}) {
    const [loading, setLoading] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState({});

    useEffect(() => {
        if (isOpen) {
            // Initialize statuses to 'unchecked' for all students
            const initialStatuses = {};
            uncheckedStudents.forEach(s => {
                initialStatuses[s.id] = "unchecked";
            });
            setSelectedStatuses(initialStatuses);
        }
    }, [isOpen, uncheckedStudents]);

    const handleStatusChange = (studentId, status) => {
        setSelectedStatuses(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        const today = getTodayString();

        // Prepare updates only for students with status other than 'unchecked' (optional, or save all)
        // To be safe and explicit, let's save all changes where status is NOT 'unchecked'.
        // If status is 'unchecked', we leave it as is (or explicit unchecked).

        // Actually, we want to save WHATEVER is selected.

        const updates = Object.entries(selectedStatuses)
            .filter(([_, status]) => status !== "unchecked") // Only save meaningful changes? Or everything? The table defaults to unchecked.
            .map(([studentId, status]) => ({
                student_id: studentId,
                date: today,
                present: false, // All these are non-present statuses
                status: status,
                updated_at: new Date().toISOString() // Assuming there is updated_at or similar, but table schema didn't have it in migration. That's fine.
            }));

        if (updates.length === 0) {
            // No changes to save
            onClose();
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from("student_attendance_status")
            .upsert(updates, { onConflict: "student_id,date" });

        if (error) {
            handleSupabaseError(error, "출석 상태 저장 중 오류가 발생했습니다.");
        } else {
            if (onSaved) onSaved();
            onClose();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                            ⚠️ 미체크 학생 관리
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            총 <span className="text-red-600 font-bold">{uncheckedStudents.length}명</span>의 학생이 아직 출석 체크되지 않았습니다.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uncheckedStudents.map(student => (
                            <div key={student.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
                                {/* Avatar Placeholder */}
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                                    {student.name.slice(0, 1)}
                                </div>

                                <div className="text-center">
                                    <div className="font-bold text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.number}번</div>
                                </div>

                                {/* Dropdown */}
                                <select
                                    className={`w-full text-sm rounded-lg border-gray-200 py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-center font-medium ${ATTENDANCE_OPTIONS.find(o => o.value === (selectedStatuses[student.id] || "unchecked"))?.color
                                        }`}
                                    value={selectedStatuses[student.id] || "unchecked"}
                                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                >
                                    {ATTENDANCE_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "저장 중..." : "변경 내용 저장"}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}
