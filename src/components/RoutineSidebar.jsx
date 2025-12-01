import { useState } from "react";

function RoutineSidebar() {
  const [routineItems, setRoutineItems] = useState([
    "책가방 정리",
    "필기구 준비",
    "알림장 확인",
    "하루 계획 세우기",
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [newRoutine, setNewRoutine] = useState("");

  const addRoutine = () => {
    if (newRoutine.trim() === "") return;
    setRoutineItems([...routineItems, newRoutine]);
    setNewRoutine("");
  };

  const deleteRoutine = (index) => {
    setRoutineItems(routineItems.filter((_, i) => i !== index));
  };

  return (
    <>
      <aside className="bg-white/50 backdrop-blur rounded-3xl p-4 shadow-sm flex flex-col">
        <h2 className="text-2xl font-bold mb-4">✏️ 등교시 루틴</h2>

        <ul className="space-y-2 flex-1">
          {routineItems.map((text, idx) => (
            <li key={idx}>
              <button className="w-full bg-white rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:bg-pink-50 transition">
                {idx + 1}. {text}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="mt-4 w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded-full"
          onClick={() => setIsEditing(true)}
        >
          ✏️ 루틴 편집
        </button>
      </aside>

      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4">루틴 편집</h3>

            <ul className="space-y-2 mb-4">
              {routineItems.map((text, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <span>{text}</span>
                  <button
                    className="text-red-500 font-semibold"
                    onClick={() => deleteRoutine(index)}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>

            <input
              className="w-full border rounded-lg px-3 py-2 mb-3"
              placeholder="새 루틴 입력"
              value={newRoutine}
              onChange={(e) => setNewRoutine(e.target.value)}
            />

            <button
              className="w-full bg-green-500 text-white py-2 rounded-full mb-2 font-semibold"
              onClick={addRoutine}
            >
              추가
            </button>

            <button
              className="w-full bg-gray-300 py-2 rounded-full font-semibold"
              onClick={() => setIsEditing(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RoutineSidebar;