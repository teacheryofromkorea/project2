import { useState, useEffect } from "react";
import StudentSelectPanel from "./StudentSelectPanel";
import StatsDashboard from "./StatsDashboard";
import { supabase } from "../../lib/supabaseClient";

const LAST_SELECTED_STUDENT_KEY = "stats:lastSelectedStudentId";

function StatsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [loading, setLoading] = useState(true);

  /* 
     isBackground = true이면 로딩 스피너 안 띄움 (데이터만 갱신)
     기본값 false -> 로딩 스피너 띄움 (초기 로딩 등)
  */
  const fetchStudents = async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    // 1️⃣ 학생 기본 정보 fetch
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("id, name, number, gacha_tickets, duplicate_count, gacha_progress, fragments")
      .order("number", { ascending: true });

    if (studentsError || !studentsData) {
      console.error("학생 fetch 오류:", studentsError);
      setStudents([]);
      if (!isBackground) setLoading(false);
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
    // → student.pets 는 항상 string[] (pet_id 배열)
    const mergedStudents = studentsData.map((student) => ({
      ...student,
      pets: Array.isArray(petsByStudent[student.id])
        ? petsByStudent[student.id]
        : [],
    }));

    setStudents(mergedStudents);

    // 5️⃣ 단일 선택 기본값 유지
    if (mergedStudents.length > 0 && !isMultiSelectMode) {
      const savedStudentId = localStorage.getItem(LAST_SELECTED_STUDENT_KEY);

      const exists = savedStudentId
        ? mergedStudents.some((s) => s.id === savedStudentId)
        : false;

      if (exists) {
        setSelectedStudentId(savedStudentId);
      } else {
        setSelectedStudentId(mergedStudents[0].id);
      }
    }

    if (!isBackground) setLoading(false);

    // 개발 중 디버그용
    // console.log(
    //   "[StatsPage] mergedStudents pets:",
    //   mergedStudents.map((s) => ({ id: s.id, pets: s.pets }))
    // );
  };

  const handlePetAcquired = (studentId, petId) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
            ...student,
            pets: student.pets.includes(petId)
              ? student.pets
              : [...student.pets, petId],
          }
          : student
      )
    );
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId && !isMultiSelectMode) {
      localStorage.setItem(LAST_SELECTED_STUDENT_KEY, selectedStudentId);
    }
  }, [selectedStudentId, isMultiSelectMode]);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleMultiSelectMode = () => {
    const nextIsMulti = !isMultiSelectMode;

    setIsMultiSelectMode(nextIsMulti);
    setSelectedStudentIds([]);

    // ✅ multi-select로 들어가면 단일 선택 해제
    if (nextIsMulti) {
      setSelectedStudentId(null);
      return;
    }

    // ✅ multi-select에서 나올 때는 첫 학생을 기본 선택(있으면)
    setSelectedStudentId(students.length > 0 ? students[0].id : null);
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
        onPetAcquired={handlePetAcquired}
      />
    </div>
  );
}

export default StatsPage;