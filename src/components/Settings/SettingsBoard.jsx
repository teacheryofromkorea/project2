import { useState } from "react";
import StudentsManage from "./StudentsManage";
import TimeTable from "./TimeTable";
import GeneralSettings from "./GeneralSettings";

export default function SettingsBoard() {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="p-6 w-full h-full flex flex-col gap-6">
      {/* Tab Buttons */}
      <div className="flex gap-3 border-b pb-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "students"
              ? "bg-white shadow border"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          학생 명단
        </button>

        <button
          onClick={() => setActiveTab("timetable")}
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "timetable"
              ? "bg-white shadow border"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          시간표 설정
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "general"
              ? "bg-white shadow border"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          일반 설정
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 bg-white rounded-xl shadow p-6 overflow-auto">
        {activeTab === "students" && <StudentsManage />}
        {activeTab === "timetable" && <TimeTable />}
        {activeTab === "general" && <GeneralSettings />}
      </div>
    </div>
  );
}
