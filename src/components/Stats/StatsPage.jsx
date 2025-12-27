import { useState, useEffect } from "react";
import StudentSelectPanel from "./StudentSelectPanel";
import StatsDashboard from "./StatsDashboard";
import { supabase } from "../../lib/supabaseClient";

function StatsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);

    // 1️⃣ 학생 기본 정보 fetch
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("id, name, number, gacha_tickets")
      .order("number", { ascending: true });

    if (studentsError || !studentsData) {
      console.error("학생 fetch 오류:", studentsError);
      setStudents([]);
      setLoading(false);
      return;
    }

    // 2️⃣ student_pets 전체 fetch
    const { data: petsData, error: petsError } = await supabase
      .from("student_pets")
      .select("student_id, pet_id");

    if (petsError) {
      console.error("student_pets fetch 오류:", petsError);
    }

    // 3️⃣ student_id 기준으로 pets 묶기
    const petsByStudent = {};
    (petsData || []).forEach((row) => {
      if (!petsByStudent[row.student_id]) {
        petsByStudent[row.student_id] = [];
      }
      petsByStudent[row.student_id].push(row.pet_id);
    });

    // 4️⃣ students + pets 병합
    const mergedStudents = studentsData.map((student) => ({
      ...student,
      pets: petsByStudent[student.id] ?? [],
    }));

    setStudents(mergedStudents);

    // 5️⃣ 단일 선택 기본값 유지
    if (
      mergedStudents.length > 0 &&
      !selectedStudentId &&
      !isMultiSelectMode
    ) {
      setSelectedStudentId(mergedStudents[0].id);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    setSelectedStudentIds([]);
    if (isMultiSelectMode) {
      setSelectedStudentId(students.length > 0 ? students[0].id : null);
    } else {
      setSelectedStudentId(null);
    }
  };

  return (
    <div className="h-full flex">
      <StudentSelectPanel
        students={students}
        selectedStudentId={selectedStudentId}
        selectedStudentIds={selectedStudentIds}
        isMultiSelectMode={isMultiSelectMode}
        onSelectStudent={setSelectedStudentId}
        onToggleStudent={toggleStudentSelection}
        onToggleMultiSelectMode={toggleMultiSelectMode}
        loading={loading}
      />

      <StatsDashboard
        students={students}
        selectedStudentId={selectedStudentId}
        selectedStudentIds={selectedStudentIds}
        isMultiSelectMode={isMultiSelectMode}
        loading={loading}
        onStudentsUpdated={fetchStudents}
      />
    </div>
  );
}

export default StatsPage;