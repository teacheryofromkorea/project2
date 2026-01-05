import { useRef, useEffect } from "react";
import CoreStatsSection from "../Stats/CoreStatsSection";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ClassStatModal
 * --------------
 * 수업 탭에서 학생 클릭 시 뜨는 "미니 능력치 창"
 * Stats 탭의 로직(CoreStatsSection)을 그대로 재사용합니다.
 */
export default function ClassStatModal({
    isOpen,
    student,
    onClose,
    onStudentsUpdated, // 데이터 갱신 시 호출될 콜백
}) {
    // ESC 키로 닫기
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // 배경 클릭 시 닫기
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && student && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className="
              relative w-full max-w-4xl bg-[#1a1625] 
              rounded-3xl shadow-2xl border border-white/10 
              overflow-hidden flex flex-col max-h-[90vh]
            "
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                {student.name}의 능력치 관리
                                <span className="text-sm font-normal text-purple-300 ml-2">
                                    (No.{student.number})
                                </span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 컨텐츠: CoreStatsSection 재사용 */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-[#1a1625] to-[#2a2438]">
                            <CoreStatsSection
                                students={[student]} // 현재 학생만 배열로 전달
                                selectedStudentId={student.id}
                                isMultiSelectMode={false}
                                onStudentsUpdated={onStudentsUpdated}
                            />
                        </div>

                        {/* 하단 닫기 버튼 (모바일 등 편의성) */}
                        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
