import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

const THEMES = {
    attendance: {
        orb1: "bg-blue-600/40",
        orb2: "bg-sky-400/35",
        orb3: "bg-indigo-400/30",
        orb4: "bg-cyan-400/35",
        orb5: "bg-blue-500/25",
    },
    break: {
        orb1: "bg-emerald-500/40",
        orb2: "bg-lime-400/35",
        orb3: "bg-teal-400/30",
        orb4: "bg-green-400/35",
        orb5: "bg-emerald-600/25",
    },
    lunch: {
        orb1: "bg-orange-500/40",
        orb2: "bg-amber-400/35",
        orb3: "bg-red-400/30",
        orb4: "bg-yellow-500/35",
        orb5: "bg-orange-600/25",
    },
    end: {
        orb1: "bg-violet-600/40",
        orb2: "bg-fuchsia-400/35",
        orb3: "bg-purple-500/30",
        orb4: "bg-indigo-400/35",
        orb5: "bg-violet-500/25",
    },
    class: {
        orb1: "bg-slate-500/30",
        orb2: "bg-gray-400/30",
        orb3: "bg-zinc-400/30",
        orb4: "bg-slate-400/30",
        orb5: "bg-gray-500/20",
    },
    default: { // MMCA Original Mix
        orb1: "bg-blue-600/40",
        orb2: "bg-rose-600/35",
        orb3: "bg-amber-500/30",
        orb4: "bg-cyan-500/35",
        orb5: "bg-indigo-600/25",
    }
};

function DynamicBackground() {
    const location = useLocation();

    // 단순 경로 체크로 테마 결정 (메모이제이션 불필요할 정도로 가벼움)
    const getPageTheme = (path) => {
        if (path.startsWith("/attendance")) return "attendance";
        if (path.startsWith("/break")) return "break";
        if (path.startsWith("/lunch")) return "lunch";
        if (path.startsWith("/end")) return "end";
        if (path.startsWith("/class")) return "class";
        return "default";
    };

    const themeKey = getPageTheme(location.pathname);
    const theme = THEMES[themeKey] || THEMES.default;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 transition-colors duration-700">
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Vibrant Color Orbs (Higher Intensity) - Dynamic Colors */}
            {/* will-change-transform 및 GPU 가속 유도 (transform-gpu) 추가 */}
            <div className={`absolute top-[15%] left-[20%] w-[65vw] h-[65vw] rounded-full blur-[130px] animate-pulse-slow transition-colors duration-1000 transform-gpu will-change-[background-color,transform] ${theme.orb1}`} />
            <div className={`absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full blur-[110px] animate-pulse-slow transition-colors duration-1000 transform-gpu will-change-[background-color,transform] ${theme.orb2}`} style={{ animationDelay: '1s' }} />
            <div className={`absolute bottom-[-5%] right-[5%] w-[50vw] h-[50vw] rounded-full blur-[120px] animate-pulse-slow transition-colors duration-1000 transform-gpu will-change-[background-color,transform] ${theme.orb3}`} style={{ animationDelay: '3s' }} />
            <div className={`absolute bottom-[15%] left-[-5%] w-[40vw] h-[40vw] rounded-full blur-[100px] animate-pulse-slow transition-colors duration-1000 transform-gpu will-change-[background-color,transform] ${theme.orb4}`} style={{ animationDelay: '2s' }} />

            {/* Central Mixing Point */}
            <div className={`absolute top-[35%] right-[15%] w-[40vw] h-[40vw] rounded-full blur-[140px] animate-pulse-slow transition-colors duration-1000 transform-gpu will-change-[background-color,transform] ${theme.orb5}`} style={{ animationDelay: '4s' }} />
        </div>
    );
}

// React.memo를 사용하여 불필요한 리렌더링 방지 (Prop이 없긴 하지만 부모 리렌더링 방어)
export default React.memo(DynamicBackground);
