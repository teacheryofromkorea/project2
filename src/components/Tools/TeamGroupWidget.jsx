import { useState } from "react";

export default function TeamGroupWidget({ students = [] }) { // students: { id, name, present }
    const [groupCount, setGroupCount] = useState(4);
    const [groups, setGroups] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // 출석한 학생만 대상
    const candidates = students.filter(s => s.present);

    const createGroups = () => {
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        const newGroups = Array.from({ length: groupCount }, () => []);

        shuffled.forEach((s, i) => {
            newGroups[i % groupCount].push(s);
        });

        setGroups(newGroups);
        setIsOpen(true);
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 min-h-[350px]">
            {/* Control Bar */}
            <div className="flex items-center justify-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-lg font-bold text-gray-700">총 {candidates.length}명 대기중</span>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={2}
                        max={10}
                        value={groupCount}
                        onChange={(e) => setGroupCount(Number(e.target.value))}
                        className="w-20 px-3 py-2 rounded-xl border border-gray-300 text-center text-lg font-bold"
                    />
                    <span className="text-lg text-gray-600 font-medium">모둠으로</span>
                </div>
                <button
                    onClick={createGroups}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-lg font-bold transition shadow-md active:scale-95"
                >
                    ⚡️ 바로 편성
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 overflow-y-auto shadow-inner">
                {groups.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {groups.map((group, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                    <span className="bg-gray-200 text-gray-700 w-6 h-6 flex items-center justify-center rounded-md text-xs">{idx + 1}</span>
                                    {idx + 1}조 ({group.length}명)
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {group.map(s => (
                                        <span key={s.id} className="bg-white px-2 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 shadow-sm">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                        <span className="text-4xl">👥</span>
                        <div className="text-lg">'바로 편성' 버튼을 눌러보세요</div>
                    </div>
                )}
            </div>
        </div>
    );
}
