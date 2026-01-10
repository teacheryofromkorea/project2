import { useState, useRef, useEffect } from "react";

export default function StudentGrid({
    students,
    onEdit,
    onDelete,
    onQuickAdd,
    editingId,
    editState
}) {
    // Quick Add State
    const [quickName, setQuickName] = useState("");
    const [quickGender, setQuickGender] = useState("male");
    const quickInputRef = useRef(null);

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (!quickName.trim()) return;

        onQuickAdd({
            name: quickName.trim(),
            gender: quickGender,
            // number is auto-assigned by logic in parent or user can edit later
        });
        setQuickName("");
        // Keep focus
        quickInputRef.current?.focus();
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 🚀 Quick Add Bar */}
            <form
                onSubmit={handleQuickAdd}
                className="flex gap-3 items-center bg-white/60 p-2 pr-3 rounded-2xl border border-white/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-200 transition-all"
            >
                <div className="pl-3 text-gray-400 font-bold text-lg select-none">
                    +
                </div>
                <input
                    ref={quickInputRef}
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="이름 입력 후 Enter (빠른 추가)"
                    className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
                />

                {/* Gender Toggle */}
                <div className="flex bg-gray-100/50 rounded-lg p-1 gap-1">
                    <button
                        type="button"
                        onClick={() => setQuickGender("male")}
                        className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${quickGender === "male"
                                ? "bg-blue-100 text-blue-600 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        남
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickGender("female")}
                        className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${quickGender === "female"
                                ? "bg-pink-100 text-pink-600 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        여
                    </button>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                    추가
                </button>
            </form>

            {/* 📦 Dense Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {students.map((student) => {
                    const isEditing = editingId === student.id;

                    if (isEditing) {
                        return (
                            <div key={student.id} className="col-span-1 bg-white ring-2 ring-blue-400 shadow-lg rounded-xl p-3 flex flex-col gap-2 relative z-10 scale-105 transition-all">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={editState.tempNumber}
                                        onChange={(e) => editState.setTempNumber(e.target.value)}
                                        className="w-10 text-center text-sm font-bold bg-gray-50 border border-gray-200 rounded focus:ring-1 focus:ring-blue-200 outline-none"
                                        placeholder="#"
                                    />
                                    <input
                                        type="text"
                                        value={editState.tempName}
                                        onChange={(e) => editState.setTempName(e.target.value)}
                                        className="flex-1 text-sm font-bold bg-gray-50 border border-gray-200 rounded px-2 focus:ring-1 focus:ring-blue-200 outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={editState.tempDuty || ""}
                                        onChange={(e) => editState.setTempDuty(e.target.value)}
                                        className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-blue-200 outline-none"
                                    >
                                        <option value="">(역할 없음)</option>
                                        <option value="반장">반장</option>
                                        <option value="부반장">부반장</option>
                                        <option value="우유도우미">우유도우미</option>
                                        {/* Add more common duties or make it text input if preferred, but condensed space suggests select or short text */}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-1 mt-1">
                                    <button
                                        onClick={() => onDelete(student.id)}
                                        className="bg-red-50 text-red-500 p-1.5 rounded-lg hover:bg-red-100 mr-auto"
                                        title="삭제"
                                    >
                                        🗑️
                                    </button>

                                    <button
                                        onClick={onEdit.cancel}
                                        className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-200"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={() => onEdit.save(student)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                                    >
                                        저장
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={student.id}
                            onClick={() => onEdit.start(student)}
                            className={`
                group relative cursor-pointer select-none
                bg-white/60 hover:bg-white border border-white/60 hover:border-blue-200 
                shadow-sm hover:shadow-md hover:-translate-y-0.5
                rounded-xl p-3 flex items-center justify-between gap-3 transition-all duration-200
                ${student.gender === 'male' ? 'hover:shadow-blue-100' : 'hover:shadow-pink-100'}
              `}
                        >
                            <div className={`
                flex-none w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black
                ${student.number
                                    ? (student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600')
                                    : 'bg-gray-100 text-gray-400'}
              `}>
                                {student.number || "-"}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 text-base truncate">{student.name}</div>
                                {student.duty && <div className="text-[10px] text-gray-500 font-medium truncate">{student.duty}</div>}
                            </div>

                            {/* Hover Edit Action Hint */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10px] bg-gray-900/10 px-1.5 py-0.5 rounded text-gray-600 font-bold">
                                    Edit
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State placeholder if needed */}
                {students.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <p className="text-lg font-medium">등록된 학생이 없습니다.</p>
                        <p className="text-sm">위 입력창에서 이름을 입력해 추가해주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
