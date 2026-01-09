import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TicketGrantModal({
    isOpen,
    onClose,
    studentNames = [],
    ticketCount = 1,
}) {
    const displayName =
        studentNames.length === 0
            ? "학생"
            : studentNames.length === 1
                ? studentNames[0]
                : `${studentNames[0]} 외 ${studentNames.length - 1}명`;

    // ReactDOM.createPortal로 body에 직접 렌더링하여 z-index 문제 해결
    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* 배경 오버레이 */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* 모달 카드 */}
                    <motion.div
                        className="relative z-10 w-full max-w-sm mx-4"
                        initial={{ scale: 0.8, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-1 shadow-2xl shadow-amber-500/30">
                            <div className="rounded-[22px] bg-gradient-to-br from-amber-50 to-yellow-50 p-8 text-center">
                                {/* 티켓 아이콘 */}
                                <motion.div
                                    className="text-6xl mb-4"
                                    initial={{ rotate: -10, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                    🎟️
                                </motion.div>

                                {/* 메인 메시지 */}
                                <motion.h2
                                    className="text-xl font-bold text-amber-900 mb-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    가챠 티켓 지급!
                                </motion.h2>

                                <motion.p
                                    className="text-amber-800 mb-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <span className="font-bold text-amber-900">{displayName}</span>님에게
                                    <br />
                                    <span className="text-2xl font-black text-amber-600">
                                        티켓 {ticketCount}장
                                    </span>
                                    이 지급되었습니다!
                                </motion.p>

                                {/* 확인 버튼 */}
                                <motion.button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transition-all active:scale-95"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    확인
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
