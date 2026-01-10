import { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
import { useLock } from "../../context/LockContext";

function MissionSidebar({
  themeColor = "pink" // Default theme
}) {
  const [missions, setMissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newMission, setNewMission] = useState("");
  const [editMission, setEditMission] = useState(null);
  const [editText, setEditText] = useState("");
  const [missionTitle, setMissionTitle] = useState("오늘의 미션");

  const { locked } = useLock();

  // Theme Styles Mapping
  const THEME_STYLES = {
    pink: {
      accent: "bg-pink-600",
      text: "text-pink-600",
      textDark: "text-pink-900",
      border: "border-pink-200",
      hoverBorder: "hover:border-pink-300",
      bg: "bg-pink-50",
      hoverBg: "hover:bg-pink-100",
      hoverText: "hover:text-pink-700",
      blob1: "from-pink-400/35 via-rose-400/25 to-pink-300/15",
      blob2: "from-rose-500/30 via-pink-400/20 to-transparent",
      blob3: "from-pink-500/25 to-transparent",
    },
    indigo: {
      accent: "bg-indigo-600",
      text: "text-indigo-600",
      textDark: "text-indigo-900",
      border: "border-indigo-200",
      hoverBorder: "hover:border-indigo-300",
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100",
      hoverText: "hover:text-indigo-700",
      blob1: "from-indigo-400/35 via-violet-400/25 to-indigo-300/15",
      blob2: "from-violet-500/30 via-indigo-400/20 to-transparent",
      blob3: "from-indigo-500/25 to-transparent",
    },
    emerald: {
      accent: "bg-emerald-600",
      text: "text-emerald-600",
      textDark: "text-emerald-900",
      border: "border-emerald-200",
      hoverBorder: "hover:border-emerald-300",
      bg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-100",
      hoverText: "hover:text-emerald-700",
      blob1: "from-emerald-400/35 via-teal-400/25 to-emerald-300/15",
      blob2: "from-teal-500/30 via-emerald-400/20 to-transparent",
      blob3: "from-emerald-500/25 to-transparent",
    },
    orange: {
      accent: "bg-orange-600",
      text: "text-orange-600",
      textDark: "text-orange-900",
      border: "border-orange-200",
      hoverBorder: "hover:border-orange-300",
      bg: "bg-orange-50",
      hoverBg: "hover:bg-orange-100",
      hoverText: "hover:text-orange-700",
      blob1: "from-orange-400/35 via-amber-400/25 to-orange-300/15",
      blob2: "from-amber-500/30 via-orange-400/20 to-transparent",
      blob3: "from-orange-500/25 to-transparent",
    },
    violet: {
      accent: "bg-violet-600",
      text: "text-violet-600",
      textDark: "text-violet-900",
      border: "border-violet-200",
      hoverBorder: "hover:border-violet-300",
      bg: "bg-violet-50",
      hoverBg: "hover:bg-violet-100",
      hoverText: "hover:text-violet-700",
      blob1: "from-violet-400/35 via-fuchsia-400/25 to-violet-300/15",
      blob2: "from-fuchsia-500/30 via-violet-400/20 to-transparent",
      blob3: "from-violet-500/25 to-transparent",
    },
  };

  const styles = THEME_STYLES[themeColor] || THEME_STYLES.pink;

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

  // ESC closing logic is removed as BaseModal handles it.
  // However, we still need to handle specific nested modal logic if needed.
  // Actually BaseModal handles ESC for closing itself.
  // But here we have NESTED modals logic (editMission inside isEditing).
  // If editMission is open, we want ESC to close THAT, not the parent.
  // BaseModal's ESC closes the modal that receives the event.
  // Since they are portals, they are separate.
  // Let's rely on BaseModal's onUpdate/onClose.

  // We can remove the custom ESC handler if we trust BaseModal.
  // But wait, the original code had prioritization: close small, then big.
  // If we map them to separate BaseModals:
  // 1. MissionEditModal (big)
  // 2. MissionItemEditModal (small)
  // If small is open, it captures focus?
  // BaseModal adds event listener to window.
  // If both are open, both listeners fire. Both close.
  // This is a known issue with stacked BaseModals if they just use window listener.
  // BaseModal logic: `if (isOpen) window.addEventListener...`
  // Stacked modals should ideally block propagation or use a stack manager.
  // For now, let's keep it simple.

  // Actually, let's modify BaseModal to stopPropagation of the key event?
  // Keydown on window... we can't stop propagation easily in reverse order.

  // Quick fix: In MissionSidebar, if `editMission` is open, disable `onClose` of `isEditing` modal?
  // Or ensures `editMission` modal stops propagation of ESC?
  // BaseModal uses window event.

  // Let's just use BaseModal for the `isEditing` modal, and `editMission` modal.
  // To prevent both closing, we might need to conditionally pass onClose or handle it.

  // Remove the useEffect for ESC as BaseModal handles it for single layer.
  // For nested:
  useEffect(() => {
    // Sync locked state
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
    window.dispatchEvent(new Event("missions:updated"));
  };

  // -------------------------
  // 3) SUPABASE: 미션 삭제
  // -------------------------
  const deleteMission = async (id) => {
    if (locked) return;

    // 1) First, delete related student statuses (Referencing Table)
    const { error: statusError } = await supabase
      .from("student_mission_status")
      .delete()
      .eq("mission_id", id);

    if (statusError) {
      handleSupabaseError(statusError, "학생 미션 상태 삭제 중 오류가 발생했어요.");
      return; // Stop if we can't delete the children
    }

    // 2) Then, delete the mission itself (Referenced Table)
    const { error } = await supabase
      .from("missions")
      .delete()
      .eq("id", id);

    if (error) {
      handleSupabaseError(error, "미션 삭제에 실패했어요.");
      return;
    }

    // 3) Refresh UI
    fetchMissions();
    window.dispatchEvent(new Event("missions:updated"));
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
    window.dispatchEvent(new Event("missions:updated"));
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
    window.dispatchEvent(new Event("missions:updated"));
  };

  return (
    <>
      <aside
        className="
    relative h-full
    bg-white border border-gray-200 shadow-2xl
    rounded-2xl
    p-6
    flex flex-col
    overflow-hidden
  "
      >
        {/* Decorative brush stroke blob */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Single large artistic brush blob */}
          <div className="absolute -top-4 -right-8 w-48 h-64">
            <div className={`absolute inset-0 bg-gradient-to-bl ${styles.blob1} rounded-[60%_40%_50%_50%/30%_70%_60%_40%] blur-lg`} />
            <div className={`absolute top-8 right-12 w-32 h-40 bg-gradient-to-br ${styles.blob2} rounded-[40%_60%_70%_30%/50%_50%_40%_60%] blur-md`} />
            <div className={`absolute top-16 right-8 w-24 h-32 bg-gradient-to-tl ${styles.blob3} rounded-[50%_50%_60%_40%/40%_60%_50%_50%] blur-sm`} />
          </div>
        </div>

        <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
          <span className={`w-1.5 h-6 ${styles.accent} rounded-full`}></span>
          {missionTitle}
        </h2>

        <ul className="space-y-2 flex-1 flex flex-col justify-center min-h-0 overflow-y-auto px-1">
          {missions.map((item, idx) => (
            <li key={item.id}>
              <div
                className={`
                  relative w-full
                  bg-slate-50 hover:bg-white
                  border border-slate-200 ${styles.hoverBorder}
                  rounded-xl
                  px-4 py-3
                  text-center
                  transition-all duration-200
                  group
                  shadow-sm hover:shadow-md
                `}
              >

                {/* 메모 내용 */}
                <div className={`text-slate-700 text-lg font-bold group-hover:${styles.textDark} transition-colors leading-relaxed block`}>
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
              : `${styles.bg} ${styles.text} ${styles.border} ${styles.hoverBg} ${styles.hoverText} ${styles.hoverBorder} hover:shadow-sm`
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


      {/* Modal 1: Mission List Edit */}
      <BaseModal
        isOpen={isEditing}
        onClose={() => {
          if (editMission) return;
          setIsEditing(false);
        }}
      >
        <div className="bg-white p-6 rounded-3xl w-80 shadow-xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4">미션 편집</h3>
          {/* 제목 수정 입력 */}
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4 font-semibold"
            value={missionTitle}
            onChange={(e) => setMissionTitle(e.target.value)}
            placeholder="미션 제목 수정"
          />

          <ul className="space-y-2 mb-4 overflow-y-auto flex-1">
            {missions.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg"
              >
                <span className="flex-1 text-medium truncate mr-2">{item.text}</span>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    className="text-gray-500 font-bold p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      if (locked) return;
                      moveMission(missions.findIndex(m => m.id === item.id), "up");
                    }}
                  >
                    ▲
                  </button>

                  <button
                    className="text-gray-500 font-bold p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      if (locked) return;
                      moveMission(missions.findIndex(m => m.id === item.id), "down");
                    }}
                  >
                    ▼
                  </button>

                  <button
                    className="text-blue-500 font-semibold text-xs p-1 hover:bg-blue-100 rounded"
                    onClick={() => {
                      if (locked) return;
                      setEditMission(item);
                      setEditText(item.text);
                    }}
                  >
                    수정
                  </button>

                  <button
                    className="text-red-500 font-semibold text-xs p-1 hover:bg-red-100 rounded"
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

          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="새 미션"
              value={newMission}
              autoComplete="off"
              onChange={(e) => setNewMission(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
              onClick={() => {
                if (locked) return;
                addMission();
              }}
            >
              추가
            </button>
          </div>

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
      </BaseModal>

      {/* Modal 2: Edit Single Mission */}
      <BaseModal isOpen={!!editMission} onClose={() => { setEditMission(null); setEditText(""); }}>
        <div className="bg-white p-6 rounded-3xl w-80 shadow-xl" onClick={e => e.stopPropagation()}>
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
      </BaseModal>
    </>
  );
}

export default MissionSidebar;