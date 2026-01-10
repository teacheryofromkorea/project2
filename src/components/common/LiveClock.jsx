import { useState, useEffect } from "react";

// 🕒 Live Clock Component (Shared)
const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Sync with system time immediately
        setTime(new Date());

        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const dateString = time.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
    });

    return (
        <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none tabular-nums translate-y-1">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            <span className="text-xl font-bold text-slate-600 tracking-tight pb-1">
                {dateString}
            </span>
        </div>
    );
};

export default LiveClock;
