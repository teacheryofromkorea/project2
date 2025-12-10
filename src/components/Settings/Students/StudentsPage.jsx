import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ➕ 추가 모달
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("female");
  const [newNumber, setNewNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const nameInputRef = useRef(null);

  // ✏️ 수정 모달
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState("female");
  const [editNumber, setEditNumber] = useState("");

  // 삭제 중 상태
  const [deletingId, setDeletingId] = useState(null);

    

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

  // ➕ 학생 추가 모달 열기
  function openAddModal() {
    setNewName("");
    setNewGender("female");
    setNewNumber("");
    setFormError("");
    setIsAddOpen(true);
  }

  // ➕ 학생 추가 모달 닫기
  function closeAddModal() {
    setIsAddOpen(false);
    setSaving(false);
    setFormError("");
  }

  // ✏️ 수정 모달 열기
  function openEditModal(stu) {
    setEditId(stu.id);
    setEditName(stu.name);
    setEditGender(stu.gender);
    setEditNumber(stu.number ?? "");
    setIsEditOpen(true);
  }

  // ✏️ 수정 모달 닫기
  function closeEditModal() {
    setIsEditOpen(false);
  }

  // 📝 학생 추가 처리
  async function handleAddStudent(e) {
    e.preventDefault();
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
    });

    if (error) {
      console.error("학생 추가 오류:", error);
      setSaving(false);
      return;
    }

    await fetchStudents();
    closeAddModal();
  }

  // ✏️ 학생 수정 처리
  async function handleEditStudent(e) {
    e.preventDefault();

    const trimmedName = editName.trim();
    if (!trimmedName) {
      alert("이름을 입력해주세요.");
      return;
    }

    const numberValue = editNumber.trim();
    const parsedNumber =
      numberValue === "" ? null : Number.isNaN(Number(numberValue)) ? null : Number(numberValue);

    const { error } = await supabase
      .from("students")
      .update({
        name: trimmedName,
        gender: editGender,
        number: parsedNumber,
      })
      .eq("id", editId);

    if (error) {
      console.error("학생 수정 오류:", error);
      alert("수정 중 오류가 발생했습니다.");
      return;
    }

    await fetchStudents();
    closeEditModal();
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
    setDeletingId(null);
  }

  const femaleStudents = students.filter((stu) => stu.gender === "female");
const maleStudents = students.filter((stu) => stu.gender === "male");

  return (

    <div>
      {/* 제목 + 추가 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">학생 명단 관리</h2>
        <button
          type="button"
          onClick={openAddModal}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
        >
          ＋ 학생 추가
        </button>
      </div>

      {/* 로딩 */}
      {loading && <p className="text-gray-600">불러오는 중...</p>}

      {/* 학생 리스트 */}
      
{/* 학생 리스트 2열 분리 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

    

  {/* 왼쪽: 여학생 */}
  <div>
    <h3 className="text-lg font-semibold mb-3 text-pink-600">여학생</h3>
    <div className="flex flex-col gap-3">
      {femaleStudents.map((stu) => (
        <div
          key={stu.id}
          onClick={() => openEditModal(stu)}
          className="relative p-4 bg-pink-50 rounded-xl shadow hover:shadow-md transition cursor-pointer"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStudent(stu.id);
            }}
            disabled={deletingId === stu.id}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
          >
            {deletingId === stu.id ? "..." : "🗑️"}
          </button>

          <p className="font-semibold">{stu.name}</p>
          {stu.number && (
            <p className="text-sm text-gray-600">번호: {stu.number}</p>
          )}
        </div>
      ))}

      {femaleStudents.length === 0 && (
        <p className="text-gray-400 text-sm">여학생이 없습니다.</p>
      )}
    </div>
  </div>

  {/* 오른쪽: 남학생 */}
  <div>
    <h3 className="text-lg font-semibold mb-3 text-blue-600">남학생</h3>
    <div className="flex flex-col gap-3">
      {maleStudents.map((stu) => (
        <div
          key={stu.id}
          onClick={() => openEditModal(stu)}
          className="relative p-4 bg-blue-50 rounded-xl shadow hover:shadow-md transition cursor-pointer"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStudent(stu.id);
            }}
            disabled={deletingId === stu.id}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
          >
            {deletingId === stu.id ? "..." : "🗑️"}
          </button>

          <p className="font-semibold">{stu.name}</p>
          {stu.number && (
            <p className="text-sm text-gray-600">번호: {stu.number}</p>
          )}
        </div>
      ))}

      {maleStudents.length === 0 && (
        <p className="text-gray-400 text-sm">남학생이 없습니다.</p>
      )}
    </div>
  </div>

</div>

      {/* 학생 없음 */}
      {!loading && students.length === 0 && (
        <p className="text-gray-500 mt-4">등록된 학생이 없습니다.</p>
      )}

      {/* ✏️ 수정 모달 */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">학생 정보 수정</h3>

            <form onSubmit={handleEditStudent} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium mb-1">성별</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      checked={editGender === "female"}
                      onChange={() => setEditGender("female")}
                    />
                    여학생
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      checked={editGender === "male"}
                      onChange={() => setEditGender("male")}
                    />
                    남학생
                  </label>
                </div>
              </div>

              {/* 번호 */}
              <div>
                <label className="block text-sm font-medium mb-1">번호 (선택)</label>
                <input
                  type="number"
                  min="1"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3 py-2 rounded-lg border text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold"
                >
                  수정하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ 추가 모달 */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeAddModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">학생 추가</h3>
              <button
                type="button"
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium mb-1">성별</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={newGender === "female"}
                      onChange={() => setNewGender("female")}
                    />
                    여학생
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={newGender === "male"}
                      onChange={() => setNewGender("male")}
                    />
                    남학생
                  </label>
                </div>
              </div>

              {/* 번호 */}
              <div>
                <label className="block text-sm font-medium mb-1">번호 (선택)</label>
                <input
                  type="number"
                  min="1"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  {saving ? "추가 중..." : "추가하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}