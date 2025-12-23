import SettingsLayout from "./SettingsLayout";
import StudentsPage from "./Students/StudentsPage";
import TimeTablePage from "./TimeTable/TimeTablePage";
import GeneralPage from "./General/GeneralPage";
import SeatingPlanPage from "./Seating/SeatingPlanPage";

export const settingsRoutes = [
  {
    path: "/settings",
    element: <SettingsLayout />,
    children: [
      { path: "students", element: <StudentsPage /> },
      { path: "timetable", element: <TimeTablePage /> },
      { path: "seating", element: <SeatingPlanPage /> },
      { path: "general", element: <GeneralPage /> },
    ],
  },
];