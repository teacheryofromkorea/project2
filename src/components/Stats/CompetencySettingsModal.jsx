import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CompetencySettingsModal({
    isOpen,
    onClose,
    currentMax,
    onUpdate,
}) {
    const [value, setValue] = useState(currentMax);

    useEffect(() => {
        if (isOpen) {
            setValue(currentMax);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, currentMax]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) {
            onUpdate(num);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl scale-100 animate-scaleIn">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    최대 수치 설정
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    모든 핵심 역량의 최대 점수를 변경합니다.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 점수 (Max Value)
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-lg font-bold text-center"
                        placeholder="예: 10"
                        min="1"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition"
                    >
                        적용하기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
