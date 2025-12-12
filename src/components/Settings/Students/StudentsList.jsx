import StudentCard from "./StudentCard";
import AddStudentPanel from "./AddStudentPanel";

export default function StudentsList({ data, edit, add, remove }) {
  const { femaleStudents, maleStudents } = data;
  const {
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
  } = edit;
  const {
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
  } = add;
  const { handleDeleteStudent, deletingId } = remove;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">

      {/* 남학생 */}
      <div className="relative overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] p-6 flex flex-col min-h-0">
        {/* ... (디자인 요소 생략) ... */}
        <h3 className="text-lg font-semibold mb-3 text-blue-600">남학생</h3>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
          {maleStudents.map((stu) => (
            <StudentCard
              key={stu.id}
              stu={stu}
              variant="male"
              edit={{
                isEditing: editingId === stu.id,
                tempNumber,
                tempName,
                tempDuty,
                onChangeNumber: (id, value) => setTempNumber(value),
                onChangeName: (id, value) => setTempName(value),
                onChangeDuty: (id, value) => setTempDuty(value),
                onStartEdit: startEditStudent,
                onSave: saveEditingStudent,
                onCancel: cancelEditStudent,
              }}
              remove={{
                onDelete: () => handleDeleteStudent(stu.id),
                deleting: deletingId === stu.id,
              }}
            />
          ))}

          {maleStudents.length === 0 && (
            <p className="text-gray-400 text-sm">남학생이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 학생 추가 패널 */}
      <AddStudentPanel
        newName={newName}
        setNewName={setNewName}
        newGender={newGender}
        setNewGender={setNewGender}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
        newDuty={newDuty}
        setNewDuty={setNewDuty}
        formError={formError}
        saving={saving}
        handleAddStudent={handleAddStudent}
      />

      {/* 여학생 */}
      <div className="relative overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] p-6 flex flex-col min-h-0">
        {/* ... (디자인 요소 생략) ... */}
        <h3 className="text-lg font-semibold mb-3 text-pink-600">여학생</h3>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
          {femaleStudents.map((stu) => (
            <StudentCard
              key={stu.id}
              stu={stu}
              variant="female"
              edit={{
                isEditing: editingId === stu.id,
                tempNumber,
                tempName,
                tempDuty,
                onChangeNumber: (id, value) => setTempNumber(value),
                onChangeName: (id, value) => setTempName(value),
                onChangeDuty: (id, value) => setTempDuty(value),
                onStartEdit: startEditStudent,
                onSave: saveEditingStudent,
                onCancel: cancelEditStudent,
              }}
              remove={{
                onDelete: () => handleDeleteStudent(stu.id),
                deleting: deletingId === stu.id,
              }}
            />
          ))}

          {femaleStudents.length === 0 && (
            <p className="text-gray-400 text-sm">여학생이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
