import { useState, useEffect } from "react";

export default function SimpleMemoWidget() {
    const [text, setText] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("class_memo_widget_v1");
        if (saved) setText(saved);
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setText(val);
        localStorage.setItem("class_memo_widget_v1", val);
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 min-h-[350px]">
            <div className="flex justify-end">
                <button
                    onClick={() => { setText(""); localStorage.removeItem("class_memo_widget_v1"); }}
                    className="text-sm text-gray-500 hover:text-red-600 underline underline-offset-2 flex items-center gap-1"
                >
                    🗑️ 모두 지우기
                </button>
            </div>

            <textarea
                className="flex-1 w-full bg-yellow-100/30 border border-yellow-200 rounded-2xl p-6 text-xl leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-gray-700 shadow-inner"
                placeholder="오늘의 알림장, 준비물, 중요 공지사항 등을 적어보세요..."
                value={text}
                onChange={handleChange}
                spellCheck={false}
            />
        </div>
    );
}
