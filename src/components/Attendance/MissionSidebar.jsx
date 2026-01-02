import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
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
      .order("order_index", { nullsFirst: true, ascending: true });

    if (error) {
      handleSupabaseError(error, "미션 목록을 불러오지 못했어요.");
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
      handleSupabaseError(error, "미션 추가에 실패했어요.");
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
      handleSupabaseError(error, "미션 삭제에 실패했어요.");
      return;
    }

    // 2) 이 미션에 대한 학생별 상태도 같이 삭제
    const { error: statusError } = await supabase
      .from("student_mission_status")
      .delete()
      .eq("mission_id", id);

    if (statusError) {
      handleSupabaseError(statusError, "학생 미션 상태 삭제 중 오류가 발생했어요.");
      // 화면 갱신은 계속
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

    const { error: error1 } = await supabase
      .from("missions")
      .update({ order_index: target.order_index })
      .eq("id", target.id);
    handleSupabaseError(error1, "미션 순서 변경에 실패했어요.");

    const { error: error2 } = await supabase
      .from("missions")
      .update({ order_index: swapWith.order_index })
      .eq("id", swapWith.id);
    handleSupabaseError(error2, "미션 순서 변경에 실패했어요.");

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
      handleSupabaseError(error, "미션 수정에 실패했어요.");
      return;
    }

    setEditMission(null);
    setEditText("");
    fetchMissions();
  };

  return (
    <>
      <aside
        className="
    relative
    bg-white border border-gray-200 shadow-2xl
    rounded-2xl
    p-6
    flex flex-col
  "
      >

        <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 bg-pink-600 rounded-full"></span>
          {missionTitle}
        </h2>

        <ul className="space-y-2 flex-1">
          {missions.map((item, idx) => (
            <li key={item.id}>
              <div
                className="
                  relative w-full
                  bg-slate-50 hover:bg-white
                  border border-slate-200 hover:border-pink-300
                  rounded-xl
                  px-4 py-3
                  text-center
                  transition-all duration-200
                  group
                  shadow-sm hover:shadow-md
                "
              >

                {/* 메모 내용 */}
                <div className="text-slate-700 text-lg font-bold group-hover:text-pink-900 transition-colors leading-relaxed block">
                  {item.text}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          disabled={locked}
          className={`mt-6 w-full text-sm font-semibold py-3 rounded-xl transition-all border
    ${locked
              ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
              : "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100 hover:text-pink-700 hover:border-pink-300 hover:shadow-sm"
            }
  `}
          onClick={() => {
            if (locked) return;
            setIsEditing(true);
          }}
        >
          Edit Missions
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
                    handleSupabaseError(error, "미션 제목 저장에 실패했어요.");
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