import StudentCard from "./StudentCard";
import AddStudentPanel from "./AddStudentPanel";

export default function StudentsList({
  femaleStudents,
  maleStudents,
  editingId,
  tempNumber,
  tempName,
  tempDuty,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  deletingId,
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
}) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">

      {/* 남학생 */}
      <div className="relative overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/30 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] p-6 flex flex-col min-h-0">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none"></div>
        <h3 className="text-lg font-semibold mb-3 text-blue-600">남학생</h3>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
          {maleStudents.map((stu) => (
            <StudentCard
              key={stu.id}
              stu={stu}
              variant="male"
              isEditing={editingId === stu.id}
              tempNumber={tempNumber}
              tempName={tempName}
              tempDuty={tempDuty}
              onStartEdit={onStartEdit}
              onSave={onSave}
              onCancel={onCancel}
              onChangeNumber={v => tempNumber(v)}
              onChangeName={v => tempName(v)}
              onChangeDuty={v => tempDuty(v)}
              onDelete={() => onDelete(stu.id)}
              deleting={deletingId === stu.id}
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
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none"></div>
        <h3 className="text-lg font-semibold mb-3 text-pink-600">여학생</h3>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
          {femaleStudents.map((stu) => (
            <StudentCard
              key={stu.id}
              stu={stu}
              variant="female"
              isEditing={editingId === stu.id}
              tempNumber={tempNumber}
              tempName={tempName}
              tempDuty={tempDuty}
              onStartEdit={onStartEdit}
              onSave={onSave}
              onCancel={onCancel}
              onChangeNumber={v => tempNumber(v)}
              onChangeName={v => tempName(v)}
              onChangeDuty={v => tempDuty(v)}
              onDelete={() => onDelete(stu.id)}
              deleting={deletingId === stu.id}
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