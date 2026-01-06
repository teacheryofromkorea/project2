import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BaseModal (Logic & Animation Wrapper)
 * -------------------------------------
 * 스타일(색상, 테두리 등)은 전혀 포함하지 않고,
 * 오직 "포탈 렌더링", "등장/퇴장 애니메이션", "배경 클릭/ESC 닫기" 로직만 제공합니다.
 *
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 함수
 * @param {ReactNode} children - 모달 내부 컨텐츠 (여기에 스타일링된 div를 넣으세요)
 */
export default function BaseModal({
    isOpen,
    onClose,
    children,
    // Animation Overrides (Defaults)
    initial = { scale: 0.95, opacity: 0, y: 10 },
    animate = { scale: 1, opacity: 1, y: 0 },
    exit = { scale: 0.95, opacity: 0, y: 10 },
    transition = { type: "spring", damping: 25, stiffness: 300, mass: 0.8 }
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden"; // Lock scroll
        }
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "unset"; // Unlock scroll
        };
    }, [isOpen, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop (Dim Layer) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content Wrapper (Animation only, no layout styles) */}
                    <motion.div
                        initial={initial}
                        animate={animate}
                        exit={exit}
                        transition={transition}
                        className="relative z-10 w-full flex justify-center"
                        onClick={(e) => {
                            // If the user clicks on the empty space of this wrapper, close the modal
                            if (e.target === e.currentTarget) onClose();
                        }}
                    >
                        {/* 
                We restore w-full here so children with 'w-full' can expand.
                And we add onClick to this inner wrapper too, just in case the click lands here.
             */}
                        <div
                            className="w-full flex justify-center"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) onClose();
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
