export const STATUS_CONFIG = {
    // 1. 질병 관련 (Sick)
    "sick-absent": { label: "질병결석", icon: "♡", color: "text-black", group: "sick" },
    "sick-early-leave": { label: "질병조퇴", icon: "@", color: "text-black", group: "sick" },
    "sick-late": { label: "질병지각", icon: "#", color: "text-black", group: "sick" },

    // 2. 출석인정 관련 (Authorized)
    "authorized-absent": { label: "출석인정결석", icon: "△", color: "text-black", group: "authorized" },
    "authorized-early-leave": { label: "출석인정조퇴", icon: "▷", color: "text-black", group: "authorized" },
    "authorized-late": { label: "출석인정지각", icon: "◁", color: "text-black", group: "authorized" },

    // 3. 미인정 관련 (Unauthorized)
    "unauthorized-absent": { label: "미인정결석", icon: "♥", color: "text-black", group: "unauthorized" }, // Using filled heart
    "unauthorized-early-leave": { label: "미인정조퇴", icon: "◎", color: "text-black", group: "unauthorized" },
    "unauthorized-late": { label: "미인정지각", icon: "X", color: "text-black", group: "unauthorized" },

    // 4. 기타 (Etc)
    "present": { label: "출석", icon: "✅", color: "text-green-600", group: "etc" },
    "unchecked": { label: "미체크", icon: "⚪", color: "text-gray-400", group: "etc" }, // Darker gray for visibility
};

export const getStatusIcon = (status) => STATUS_CONFIG[status]?.icon || "";
