import { motion, AnimatePresence } from "framer-motion";

export default function ClassSeatDeck({
    students = [],
    periodPoints = {}, // { studentId: point }
    onStudentClick,    // (student) => void
    selectedStudentIds = new Set(),

    // 퀘스트 모드 props
    isQuestMode = false,
    questCompletedStudentIds = new Set(),
    onToggleQuestCompletion,
}) {
    return (
        <div className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-700 mb-3 px-2 flex items-center justify-between">
                <span>👥 학생 ({students.length})</span>
                <span className="text-xs font-normal text-gray-500">클릭하여 관리</span>
            </h3>

            <div className="flex-1 overflow-y-auto px-1 pb-4">
                {/* 리스트 뷰: 깔끔한 행 형태 */}
                <div className="flex flex-col gap-1">
                    {students.map((student) => {
                        const points = periodPoints[student.id] || 0;
                        const isSelected = selectedStudentIds.has(student.id);

                        // 퀘스트 완료 여부
                        const isQuestCompleted = isQuestMode && questCompletedStudentIds.has(student.id);

                        return (
                            <motion.button
                                layout
                                key={student.id}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    if (isQuestMode) {
                                        onToggleQuestCompletion && onToggleQuestCompletion(student.id);
                                    } else {
                                        onStudentClick && onStudentClick(student);
                                    }
                                }}
                                className={`
                  relative flex items-center justify-between
                  px-3 py-2.5 rounded-lg border transition-all duration-300 select-none
                  text-left overflow-hidden
                  ${isQuestMode
                                        ? (isQuestCompleted
                                            ? "bg-green-50 border-green-400 shadow-sm"
                                            : "bg-white border-slate-200 hover:bg-orange-50 hover:border-orange-200")
                                        : (isSelected
                                            ? "bg-indigo-50 border-indigo-500 shadow-sm"
                                            : "bg-white border-transparent hover:bg-gray-50 hover:border-indigo-200")
                                    }
                `}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    {/* 학생 번호 배지 */}
                                    <span className={`
                    flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white transition-all duration-300
                    ${student.gender === "male"
                                            ? "bg-blue-500"
                                            : student.gender === "female"
                                                ? "bg-pink-500"
                                                : "bg-emerald-500"
                                        }
                    ${isQuestMode && isQuestCompleted ? "ring-2 ring-green-400 ring-offset-1 scale-110" : ""}
                  `}>
                                        {student.number}
                                    </span>

                                    {/* 학생 이름 */}
                                    <span className={`text-sm font-bold transition-all duration-300
                                      ${isQuestMode
                                            ? (isQuestCompleted ? "text-green-800 line-through decoration-green-500/50 opacity-60" : "text-gray-700")
                                            : (isSelected ? "text-indigo-900" : "text-gray-700")
                                        }
                                    `}>
                                        {student.name}
                                    </span>
                                </div>

                                {/* 우측 상태 표시: 퀘스트 모드이면 체크박스, 아니면 상점 배지 */}
                                {isQuestMode ? (
                                    <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                                    ${isQuestCompleted
                                            ? "bg-green-500 border-green-500 text-white"
                                            : "bg-white border-gray-300 text-transparent"}
                                  `}>
                                        <AnimatePresence>
                                            {isQuestCompleted && (
                                                <motion.svg
                                                    initial={{ scale: 0, rotate: -45 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                </motion.svg>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    points !== 0 && (
                                        <div
                                            className={`
                      px-2 py-0.5 rounded-full text-xs font-bold shadow-sm
                      ${points > 0
                                                    ? "bg-indigo-100 text-indigo-600"
                                                    : "bg-red-100 text-red-600"
                                                }
                    `}
                                        >
                                            {points > 0 ? `+${points}` : points}
                                        </div>
                                    )
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
