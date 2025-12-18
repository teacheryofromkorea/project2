import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useLock } from "../../context/LockContext";

function MissionSidebar() {
  const [missions, setMissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newMission, setNewMission] = useState("");
  const [editMission, setEditMission] = useState(null);
  const [editText, setEditText] = useState("");
  const [missionTitle, setMissionTitle] = useState("오늘의 미션");
  
  const { locked } = useLock();
  
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
if (data && data.length > 0) {
  const titleRow = data.find((m) => m.mission_title !== null);
  setMissionTitle(titleRow?.mission_title ?? "오늘의 미션");
}
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // ESC 닫기
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {

        // 작은 모달 우선 닫기
        if (editMission) {
          setEditMission(null);
          setEditText("");
          return;
        }

        // 작은 모달 없을 때만 큰 모달 닫기
        if (isEditing) {
          setIsEditing(false);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isEditing, editMission]);

  useEffect(() => {
    if (locked) {
      setIsEditing(false);
      setEditMission(null);
      setEditText("");
      setNewMission("");
    }
  }, [locked]);

  // -------------------------
  // 2) SUPABASE: 미션 추가
  // -------------------------
  const addMission = async () => {
    if (locked) return;
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
    if (locked) return;
    // 1) 미션 삭제
    const { error } = await supabase
      .from("missions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("삭제 오류:", error);
      return;
    }

    // 2) 이 미션에 대한 학생별 상태도 같이 삭제
    const { error: statusError } = await supabase
      .from("student_mission_status")
      .delete()
      .eq("mission_id", id);

    if (statusError) {
      console.error("상태 삭제 오류:", statusError);
      // 여기서 바로 return 할 필요는 없음 (화면 갱신은 계속)
    }

    // 3) 화면 갱신
    fetchMissions();
  };

  const moveMission = async (index, direction) => {
    if (locked) return;
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
    if (locked) return;
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
        <h2 className="text-2xl font-bold mb-4">
          {missionTitle}
        </h2>

        <ul className="space-y-2 flex-1">
          {missions.map((item, idx) => (
            <li key={item.id}>
              <div
                className="
                  relative w-full
                  bg-yellow-50
                  bg-[linear-gradient(transparent_95%,rgba(0,0,0,0.05)_95%)]
                  bg-[length:100%_28px]
                  rounded-xl
                  px-4 py-3
                  text-lg font-semibold
                  shadow-sm
                  border border-yellow-200
                  hover:shadow-md transition
                "
              >
                {/* 메모 상단 바(테이프 느낌) */}
                <div className="absolute -top-2 left-6 w-16 h-3 bg-yellow-200/80 rounded-sm"></div>

                {/* 메모 번호 */}
                <div className="text-xs text-yellow-700 font-bold mb-1">
                  MEMO {idx + 1}
                </div>

                {/* 메모 내용 */}
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {item.text}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          disabled={locked}
          className={`mt-4 w-full text-sm font-semibold py-2 rounded-full transition
    ${
      locked
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-purple-500 text-white hover:bg-purple-600"
    }
  `}
          onClick={() => {
            if (locked) return;
            setIsEditing(true);
          }}
        >
          ✏️ 미션 편집
        </button>

      </aside>

      {isEditing && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditing(false);
            }
          }}
        >
          <div className="bg-white p-6 rounded-3xl w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4">미션 편집</h3>
            {/* 제목 수정 입력 */}
            <input
              className="w-full border rounded-lg px-3 py-2 mb-4 font-semibold"
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              placeholder="미션 제목 수정"
            />


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
                      onClick={() => {
                        if (locked) return;
                        moveMission(missions.findIndex(m => m.id === item.id), "up");
                      }}
                    >
                      ▲
                    </button>

                    <button
                      className="text-gray-500 font-bold"
                      onClick={() => {
                        if (locked) return;
                        moveMission(missions.findIndex(m => m.id === item.id), "down");
                      }}
                    >
                      ▼
                    </button>

                    <button
                      className="text-blue-500 font-semibold"
                      onClick={() => {
                        if (locked) return;
                        setEditMission(item);
                        setEditText(item.text);
                      }}
                    >
                      수정
                    </button>

                    <button
                      className="text-red-500 font-semibold"
                      onClick={() => {
                        if (locked) return;
                        deleteMission(item.id);
                      }}
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
              onClick={() => {
                if (locked) return;
                addMission();
              }}
            >
              추가
            </button>

<button
  className="w-full bg-gray-300 py-2 rounded-full font-semibold"
  onClick={async () => {
    if (locked) return;
    if (missions.length > 0) {
      const ids = missions.map((item) => item.id);

      const { error } = await supabase
        .from("missions")
        .update({ mission_title: missionTitle })
        .in("id", ids);

      if (error) {
        console.error("미션 제목 저장 오류:", error);
        return;
      }
    }

    setIsEditing(false);
    fetchMissions(); // 제목/목록 다시 불러오기
  }}
>
  닫기
</button>
          </div>

          {editMission && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditMission(null);
                  setEditText("");
                }
                if (e.key === "Enter") {
                  updateMission();
                }
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setEditMission(null);
                  setEditText("");
                }
              }}
            >
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
                  onClick={() => {
                    if (locked) return;
                    updateMission();
                  }}
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