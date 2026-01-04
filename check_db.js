import { supabase } from "./src/lib/supabaseClient.js";

async function checkTables() {
    console.log("Checking student_mission_status columns...");
    const { data: missionData, error: missionError } = await supabase
        .from("student_mission_status")
        .select("*")
        .limit(1);

    if (missionError) {
        console.error("Error fetching mission status:", missionError);
    } else {
        console.log("Mission Status Sample Keys:", missionData && missionData.length > 0 ? Object.keys(missionData[0]) : "No data found");
    }

    console.log("\nChecking student_break_routine_status columns...");
    const { data: routineData, error: routineError } = await supabase
        .from("student_break_routine_status")
        .select("*")
        .limit(1);

    if (routineError) {
        console.error("Error fetching routine status:", routineError);
    } else {
        console.log("Routine Status Sample Keys:", routineData && routineData.length > 0 ? Object.keys(routineData[0]) : "No data found");
    }
}

checkTables();
