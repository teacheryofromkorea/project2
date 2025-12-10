import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, Settings, BookOpen } from "lucide-react";

export default function SettingsBoard() {
  const location = useLocation();

  const tabs = [
    { path: "/settings/students", label: "학생 명단", icon: <Users size={18} /> },
    { path: "/settings/timetable", label: "수업/쉬는/점심시간 설정", icon: <BookOpen size={18} /> },
    { path: "/settings/general", label: "일반 설정", icon: <Settings size={18} /> },
  ];

  return (
    <div className="p-8">

      {/* 상단 제목 */}
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-gray-800">
        <Settings size={30} />
        설정
      </h1>

      {/* 탭 네비게이션 박스 */}
      <div className="
        bg-white/50 backdrop-blur-lg 
        rounded-3xl shadow-lg p-4 
        border border-white/40
      ">

        <div className="flex justify-between gap-4 px-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 
                  rounded-2xl font-semibold text-sm transition-all
                  ${isActive
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-500 hover:text-gray-700"}
                `}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>

      </div>

      {/* 선택된 탭 화면 */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}