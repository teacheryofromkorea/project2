export const SOLAR_HOLIDAYS = {
    "01-01": "신정",
    "03-01": "삼일절",
    "05-05": "어린이날",
    "06-06": "현충일",
    "08-15": "광복절",
    "10-03": "개천절",
    "10-09": "한글날",
    "12-25": "성탄절",
};

// Year-Specific Lunar & Substitute Holidays (Hardcoded for 2024-2030)
// Format: "YYYY-MM-DD": "Holiday Name"
export const LUNAR_HOLIDAYS = {
    // 2024
    "2024-02-09": "설날 연휴", "2024-02-10": "설날", "2024-02-11": "설날 연휴", "2024-02-12": "대체공휴일",
    "2024-05-15": "부처님오신날",
    "2024-09-16": "추석 연휴", "2024-09-17": "추석", "2024-09-18": "추석 연휴",

    // 2025
    "2025-01-28": "설날 연휴", "2025-01-29": "설날", "2025-01-30": "설날 연휴",
    "2025-03-03": "삼일절 대체공휴일",
    "2025-05-06": "부처님오신날 대체공휴일", // 5.5 overlaps w/ Children's Day
    "2025-10-05": "추석 연휴", "2025-10-06": "추석", "2025-10-07": "추석 연휴", "2025-10-08": "대체공휴일",

    // 2026
    "2026-02-16": "설날 연휴", "2026-02-17": "설날", "2026-02-18": "설날 연휴",
    "2026-03-02": "삼일절 대체공휴일",
    "2026-05-24": "부처님오신날", "2026-05-25": "대체공휴일",
    "2026-08-17": "광복절 대체공휴일",
    "2026-09-24": "추석 연휴", "2026-09-25": "추석", "2026-09-26": "추석 연휴", "2026-10-05": "개천절 대체공휴일",

    // 2027
    "2027-02-06": "설날 연휴", "2027-02-07": "설날", "2027-02-08": "설날 연휴", "2027-02-09": "대체공휴일",
    "2027-05-13": "부처님오신날",
    "2027-08-16": "광복절 대체공휴일",
    "2027-09-14": "추석 연휴", "2027-09-15": "추석", "2027-09-16": "추석 연휴",
    "2027-10-04": "개천절 대체공휴일", "2027-10-11": "한글날 대체공휴일", "2027-12-27": "성탄절 대체공휴일",

    // 2028
    "2028-01-26": "설날 연휴", "2028-01-27": "설날", "2028-01-28": "설날 연휴", // Approx
    "2028-05-02": "부처님오신날",
    "2028-10-02": "추석 연휴", "2028-10-03": "추석", "2028-10-04": "추석 연휴",
};

export function getHolidayName(dateObj) {
    if (!dateObj) return null;

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const mdStr = `${month}-${day}`;

    // 1. Check Year-Specific Map (Lunar/Substitute)
    if (LUNAR_HOLIDAYS[dateStr]) {
        return LUNAR_HOLIDAYS[dateStr];
    }

    // 2. Check Fixed Solar Holidays
    if (SOLAR_HOLIDAYS[mdStr]) {
        return SOLAR_HOLIDAYS[mdStr];
    }

    return null;
}

export function isHoliday(dateObj) {
    return !!getHolidayName(dateObj);
}
