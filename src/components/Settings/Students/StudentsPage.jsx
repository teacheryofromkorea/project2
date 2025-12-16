import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import StudentsList from "./StudentsList"

const STUDENTS_UPDATED_EVENT = "students:updated";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ➕ 추가 모달
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("male");
  const [newNumber, setNewNumber] = useState("");
  const [newDuty, setNewDuty] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // ✏️ 인라인 수정 상태
  const [editingId, setEditingId] = useState(null);
  const [tempNumber, setTempNumber] = useState("");
  const [tempName, setTempName] = useState("");
  const [tempDuty, setTempDuty] = useState("");

  // 삭제 중 상태
  const [deletingId, setDeletingId] = useState(null);

    // ✏️ 인라인 수정 편의 함수들
  function startEditStudent(stu) {
    setTempNumber(stu.number ?? "");
    setTempName(stu.name || "");
    setTempDuty(stu.duty || "");
    setEditingId(stu.id);
  }

  async function saveEditingStudent(stu) {
    await supabase
      .from("students")
      .update({
        number: tempNumber === "" ? null : tempNumber,
        name: tempName,
        duty: tempDuty || null,
      })
      .eq("id", stu.id);

    await fetchStudents();
    window.dispatchEvent(new Event(STUDENTS_UPDATED_EVENT));

    setEditingId(null);
  }

  function cancelEditStudent() {
    setEditingId(null);
  }


  // 📌 학생 목록 불러오기
const fetchStudents = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from("students")
    .select("*");

  console.log("▶ FETCH 결과:", { data, error });

  if (error) {
    console.error("학생 불러오기 오류:", error);
    setLoading(false);
    return;
  }

  // 🔧 gender 정규화 (F/M/M\n → female/male)
  const normalized = (data || []).map(stu => {
    const g = (stu.gender || "").trim().toLowerCase();
    return {
      ...stu,
      gender: g === "f" ? "female"
            : g === "m" ? "male"
            : g,
    };
  });

  // 🔥 여기에서 정렬!
  const sorted = normalized.sort((a, b) => {
    const gA = a.gender || "";
    const gB = b.gender || "";

    if (gA !== gB) return gA.localeCompare(gB);

    const nA = a.number ?? Infinity;
    const nB = b.number ?? Infinity;
    return nA - nB;
  });

  setStudents(sorted);
  setLoading(false);
};

  useEffect(() => {
    console.log("▶ useEffect 실행됨");
    fetchStudents();
  }, []);


  // 📝 학생 추가 처리
  async function handleAddStudent() {
 
    if (saving) return;

    const trimmedName = newName.trim();
    if (!trimmedName) {
      setFormError("이름을 입력해주세요.");
      return;
    }

    const numberValue = newNumber.trim();
    const parsedNumber =
      numberValue === "" ? null : Number.isNaN(Number(numberValue)) ? null : Number(numberValue);

    setSaving(true);

const { error } = await supabase.from("students").insert({
  name: trimmedName,
  gender: newGender,
  number: parsedNumber,
  duty: newDuty || null,
});

    if (error) {
      console.error("학생 추가 오류:", error);
      setSaving(false);
      return;
    }

    await fetchStudents();
    window.dispatchEvent(new Event(STUDENTS_UPDATED_EVENT));

// 🔥 입력값 초기화
setNewName("");
setNewGender("male");
setNewNumber("");
setNewDuty("");
setFormError("");
setSaving(false);

  }


  // 🗑️ 학생 삭제
  async function handleDeleteStudent(id) {
    if (!confirm("정말 삭제할까요?")) return;

    setDeletingId(id);

    const { error } = await supabase.from("students").delete().eq("id", id);

    if (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
      setDeletingId(null);
      return;
    }

    await fetchStudents();
    window.dispatchEvent(new Event(STUDENTS_UPDATED_EVENT));
    setDeletingId(null);
  }

  //* 검색창 */
  const filteredStudents = students.filter((stu) =>
    stu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const femaleStudents = filteredStudents.filter((stu) => stu.gender === "female");
  const maleStudents = filteredStudents.filter((stu) => stu.gender === "male");

  return (

    <div className="h-full flex flex-col">
      {/* 제목 + 추가 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">학생 명단 관리</h2>

      </div>

      {/* 검색창 */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="학생 이름 검색..."
          className="w-full px-4 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 shadow-sm focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* 로딩 */}
      {loading && <p className="text-gray-600">불러오는 중...</p>}

      {/* 학생 리스트 */}
      
{/* 학생 리스트 3열 분리 */}
<StudentsList
  data={{
    femaleStudents,
    maleStudents,
  }}
  edit={{
    editingId,
    tempNumber,
    tempName,
    tempDuty,
    startEditStudent,
    saveEditingStudent,
    cancelEditStudent,
    setTempNumber,
    setTempName,
    setTempDuty,
  }}
  add={{
    newName,
    setNewName,
    newGender,
    setNewGender,
    newNumber,
    setNewNumber,
    newDuty,
    setNewDuty,
    formError,
    saving,
    handleAddStudent,
  }}
  remove={{
    handleDeleteStudent,
    deletingId,
  }}
/>

    </div>
  );
}