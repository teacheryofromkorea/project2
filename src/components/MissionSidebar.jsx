import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function MissionSidebar() {
  const [missions, setMissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newMission, setNewMission] = useState("");
  const [editMission, setEditMission] = useState(null);
  const [editText, setEditText] = useState("");
  

  // -------------------------
  // 1) SUPABASE: 미션 불러오기
  // -------------------------
  const fetchMissions = async () => {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .order("order_index", { nullsFirst : true, ascending: true });

    if (error) {
      console.error("미션 불러오기 오류:", error);
      return;
    }
    setMissions(data);
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // -------------------------
  // 2) SUPABASE: 미션 추가
  // -------------------------
  const addMission = async () => {
    if (newMission.trim() === "") return;

  // 현재 미션 중 가장 큰 order_index 찾기
  const maxIndex =
    missions.length > 0
      ? Math.max(...missions.map((m) => m.order_index ?? 0)) + 1
      : 0;

  // order_index 포함해서 insert
  const { error } = await supabase
    .from("missions")
    .insert([{ text: newMission, order_index: maxIndex }]);

    if (error) {
      console.error("추가 오류:", error);
      return;
    }

    setNewMission("");
    fetchMissions(); // 화면 갱신
  };

  // -------------------------
  // 3) SUPABASE: 미션 삭제
  // -------------------------
  const deleteMission = async (id) => {
    const { error } = await supabase.from("missions").delete().eq("id", id);

    if (error) {
      console.error("삭제 오류:", error);
      return;
    }

    fetchMissions(); // 화면 갱신
  };

  const moveMission = async (index, direction) => {
    const newList = [...missions];

    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === newList.length - 1) return;

    const target = newList[index];
    const swapWith =
      direction === "up" ? newList[index - 1] : newList[index + 1];

    const tempOrder = target.order_index;
    target.order_index = swapWith.order_index;
    swapWith.order_index = tempOrder;

    await supabase
      .from("missions")
      .update({ order_index: target.order_index })
      .eq("id", target.id);

    await supabase
      .from("missions")
      .update({ order_index: swapWith.order_index })
      .eq("id", swapWith.id);

    fetchMissions();
  };

  const updateMission = async () => {
    if (editText.trim() === "") return;

    const { error } = await supabase
      .from("missions")
      .update({ text: editText })
      .eq("id", editMission.id);

    if (error) {
      console.error("업데이트 오류:", error);
      return;
    }

    setEditMission(null);
    setEditText("");
    fetchMissions();
  };

  return (
    <>
      <aside className="bg-white/50 backdrop-blur rounded-3xl p-4 shadow-sm flex flex-col">
        <h2 className="text-2xl font-bold mb-4">🎯 오늘의 미션</h2>

        <ul className="space-y-2 flex-1">
          {missions.map((item, idx) => (
            <li key={item.id}>
              <button className="w-full bg-white rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:bg-purple-50 transition">
                {idx + 1}. {item.text}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="mt-4 w-full bg-purple-500 text-white text-sm font-semibold py-2 rounded-full"
          onClick={() => setIsEditing(true)}
        >
          ✏️ 미션 편집
        </button>
      </aside>

      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4">미션 편집</h3>

            <ul className="space-y-2 mb-4">
              {missions.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg"
                >
                  <span className="flex-1">{item.text}</span>

                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-500 font-bold"
                      onClick={() => moveMission(missions.findIndex(m => m.id === item.id), "up")}
                    >
                      ▲
                    </button>

                    <button
                      className="text-gray-500 font-bold"
                      onClick={() => moveMission(missions.findIndex(m => m.id === item.id), "down")}
                    >
                      ▼
                    </button>

                    <button
                      className="text-blue-500 font-semibold"
                      onClick={() => {
                        setEditMission(item);
                        setEditText(item.text);
                      }}
                    >
                      수정
                    </button>

                    <button
                      className="text-red-500 font-semibold"
                      onClick={() => deleteMission(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <input
              className="w-full border rounded-lg px-3 py-2 mb-3"
              placeholder="새 미션 입력"
              value={newMission}
                autoComplete="off"
  autoCorrect="off"
  spellCheck="false"
              onChange={(e) => setNewMission(e.target.value)}
            />

            <button
              className="w-full bg-green-500 text-white py-2 rounded-full mb-2 font-semibold"
              onClick={addMission}
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

          {editMission && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">
                <h3 className="text-lg font-bold mb-4">미션 수정</h3>

                <input
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  value={editText}
                  autoComplete="off"
                  spellCheck="false"
                  onChange={(e) => setEditText(e.target.value)}
                />

                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-full mb-2 font-semibold"
                  onClick={updateMission}
                >
                  저장
                </button>

                <button
                  className="w-full bg-gray-300 py-2 rounded-full font-semibold"
                  onClick={() => {
                    setEditMission(null);
                    setEditText("");
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default MissionSidebar;