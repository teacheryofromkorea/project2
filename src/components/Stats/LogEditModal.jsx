import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import BaseModal from "../common/BaseModal";
import { motion, AnimatePresence } from "framer-motion";

export default function LogEditModal({ isOpen, log, onClose, onUpdate, onDelete }) {
    const [reason, setReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false); // 삭제 확인 모달 상태

    useEffect(() => {
        if (log && isOpen) {
            setReason(log.reason || "");
            setIsDeleting(false); // 리셋
        }
    }, [log, isOpen]);

    // log가 없으면 BaseModal이 닫힌 상태여도 내부 컨텐츠를 렌더링하지 않도록 함
    // 하지만 BaseModal은 isOpen이 false면 안그리므로 상관없음.
    // isOpen이 true인데 log가 null인 경우만 방어.
    if (isOpen && !log) return null;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <div
                className="bg-[#1e1e24] w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl p-6 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span>📝</span>
                    {isDeleting ? "칭찬 기록 삭제" : "칭찬 기록 수정"}
                </h3>

                <div className="min-h-[200px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {!isDeleting ? (
                            /* 수정 모드 */
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                <div className="mb-6 space-y-2">
                                    <label className="text-sm text-gray-400">사유 입력</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="사유를 입력해주세요..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsDeleting(true)}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        title="삭제하기"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => onUpdate(log.id, reason)}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-[0.98]"
                                    >
                                        저장하기
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* 삭제 확인 모드 */
                            <motion.div
                                key="delete"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 w-full"
                            >
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm leading-relaxed">
                                    정말 이 기록을 삭제하시겠습니까?<br />
                                    <span className="font-bold text-red-100 flex items-center gap-1 mt-1">
                                        ⚠️ 삭제 시 점수가 자동으로 되돌려집니다.
                                    </span>
                                    <div className="mt-2 text-xs opacity-70">
                                        {log.stat?.name} ({log.delta > 0 ? "+" : ""}{log.delta})
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsDeleting(false)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={() => onDelete(log.id)}
                                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-[0.98]"
                                    >
                                        삭제 확정
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </BaseModal>
    );
}
