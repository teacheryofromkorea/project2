import { useState } from "react";

export default function ClassQuestWidget({
    quests = [],
    activeQuestId,
    onAddQuest,
    onDeleteQuest,
    onSetActiveQuest,
    onClose,
    students = []
}) {
    const [inputName, setInputName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputName.trim()) return;
        onAddQuest(inputName);
        setInputName(""); // Reset input
    };

    return (
        <div className="w-full h-full flex flex-col p-8">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                    <span className="text-4xl">🔥</span> 퀘스트 관리
                </h2>
                <div className="text-sm text-gray-500 font-bold">
                    총 {quests.length}개의 퀘스트
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* 왼쪽: 퀘스트 목록 */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {quests.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p>등록된 퀘스트가 없습니다.</p>
                            <p className="text-sm">오른쪽에서 새 퀘스트를 추가해보세요!</p>
                        </div>
                    ) : (
                        quests.map((quest) => {
                            const isActive = quest.id === activeQuestId;
                            const progress = Math.round((quest.completed.size / Math.max(students.length, 1)) * 100);

                            return (
                                <div
                                    key={quest.id}
                                    onClick={() => onSetActiveQuest(quest.id)}
                                    className={`
                    relative p-5 rounded-2xl border-2 transition-all cursor-pointer group
                    ${isActive
                                            ? "bg-orange-50 border-orange-500 shadow-md ring-1 ring-orange-200"
                                            : "bg-white border-gray-100 hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-sm"
                                        }
                  `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold text-lg ${isActive ? "text-orange-900" : "text-gray-700"}`}>
                                            {quest.title}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("정말 이 퀘스트를 삭제하시겠습니까?")) {
                                                    onDeleteQuest(quest.id);
                                                }
                                            }}
                                            className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* 진행률 바 */}
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-orange-500" : "bg-gray-400"}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                                        <span>{quest.completed.size}명 완료</span>
                                        <span>{progress}%</span>
                                    </div>

                                    {isActive && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-bl-xl rounded-tr-lg">
                                            진행 중
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* 오른쪽: 만들기 폼 */}
                <div className="w-80 shrink-0 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">새 퀘스트 만들기</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">
                                퀘스트 이름
                            </label>
                            <input
                                type="text"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                placeholder="예: 과제 검사"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputName.trim()}
                            className={`w-full py-3 rounded-xl font-bold transition-all shadow-md transform active:scale-95
                ${inputName.trim()
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-orange-200"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}
              `}
                        >
                            + 추가하기
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-xs rounded-xl leading-relaxed">
                        💡 <strong>팁:</strong><br />
                        왼쪽 목록에서 퀘스트를 클릭하면 <br />
                        해당 퀘스트가 <strong>활성화</strong>됩니다.<br />
                        (체크리스트가 바뀝니다)
                    </div>
                </div>
            </div>
        </div>
    );
}
