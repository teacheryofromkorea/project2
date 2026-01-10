import { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";
// ✅ useAttendanceRoutine 훅 import
import useAttendanceRoutine from "../../hooks/Attendance/useAttendanceRoutine";
import { useLock } from "../../context/LockContext";

function RoutineSidebar({
  // Optional props - if not provided, use internal state (for Attendance tab)
  routineTitle: externalTitle,
  routineItems: externalItems,
  tempTitle,
  setTempTitle,
  newContent,
  setNewContent,
  editRoutine,
  setEditRoutine,
  editText,
  setEditText,
  addRoutineItem,
  deleteRoutineItem,
  moveRoutine,
  updateRoutine,
  saveRoutineTitle,
  // Additional props for Break tab
  blockId,
  breakBlocks,
  selectedBlockId,
  setSelectedBlockId,
  themeColor = "indigo", // Default theme
}) {
  const { locked } = useLock();

  // Theme Styles Mapping
  const THEME_STYLES = {
    indigo: {
      accent: "bg-indigo-600",
      text: "text-indigo-600",
      textDark: "text-indigo-900", // For hover states
      border: "border-indigo-200",
      hoverBorder: "hover:border-indigo-300",
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100",
      hoverText: "hover:text-indigo-700",
      ring: "focus:ring-indigo-500",
      blob1: "from-indigo-400/35 via-purple-400/25 to-indigo-300/15",
      blob2: "from-purple-500/30 via-indigo-400/20 to-transparent",
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
      ring: "focus:ring-emerald-500",
      blob1: "from-emerald-400/35 via-lime-400/25 to-emerald-300/15",
      blob2: "from-lime-500/30 via-emerald-400/20 to-transparent",
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
      ring: "focus:ring-orange-500",
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
      ring: "focus:ring-violet-500",
      blob1: "from-violet-400/35 via-fuchsia-400/25 to-violet-300/15",
      blob2: "from-fuchsia-500/30 via-violet-400/20 to-transparent",
      blob3: "from-violet-500/25 to-transparent",
    },
  };

  const styles = THEME_STYLES[themeColor] || THEME_STYLES.indigo;

  // 🗂 Internal state for Attendance tab (via Hook)
  const {
    routineItems: internalItems,
    routineTitle: internalTitle,
    fetchRoutineTitle: internalFetch,
    setTempTitle: setInternalTempTitle,
    tempTitle: internalTempTitleVal,
    newContent: internalNewRoutine,
    setNewContent: setInternalNewRoutine,
    editRoutine: internalEditItem,
    setEditRoutine: setInternalEditItem,
    editText: internalEditText,
    setEditText: setInternalEditText,
    addRoutineItem: internalAddRoutine,
    deleteRoutineItem: internalDeleteRoutine,
    moveRoutine: internalMoveRoutine,
    updateRoutine: internalUpdateRoutine,
    saveRoutineTitle: internalSaveRoutineTitle,
  } = useAttendanceRoutine();

  const usingExternalData = externalItems !== undefined;

  useEffect(() => {
    if (!usingExternalData) {
      internalFetch();
    }
  }, [usingExternalData, internalFetch]);

  const routineItems = usingExternalData ? externalItems : internalItems;
  const routineTitle = usingExternalData ? externalTitle : internalTitle;

  const [isEditing, setIsEditing] = useState(false);

  const handleAddRoutine = usingExternalData ? addRoutineItem : internalAddRoutine;
  const handleDeleteRoutine = usingExternalData ? deleteRoutineItem : (index) => internalDeleteRoutine(internalItems[index].id);
  const handleMoveRoutine = usingExternalData ? moveRoutine : internalMoveRoutine;
  const handleUpdateRoutine = usingExternalData ? updateRoutine : internalUpdateRoutine;

  const currentNewContent = usingExternalData ? newContent : internalNewRoutine;
  const setCurrentNewContent = usingExternalData ? setNewContent : setInternalNewRoutine;

  const currentEditText = usingExternalData ? editText : internalEditText;
  const setCurrentEditText = usingExternalData ? setEditText : setInternalEditText;

  const currentEditRoutine = usingExternalData ? editRoutine : internalEditItem;

  const currentTempTitle = usingExternalData ? tempTitle : internalTempTitleVal;
  const setCurrentTempTitle = usingExternalData ? setTempTitle : setInternalTempTitle;

  useEffect(() => {
    if (locked) {
      setIsEditing(false);
      if (usingExternalData) {
        setEditRoutine?.(null);
        setEditText?.("");
      } else {
        setInternalEditItem(null);
        setInternalEditText("");
      }
    }
  }, [locked, usingExternalData, setEditRoutine, setEditText, setInternalEditItem, setInternalEditText]);

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
          <div className="absolute -top-4 -left-8 w-48 h-64">
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.blob1} rounded-[40%_60%_70%_30%/60%_30%_70%_40%] blur-lg`} />
            <div className={`absolute top-8 left-12 w-32 h-40 bg-gradient-to-bl ${styles.blob2} rounded-[60%_40%_30%_70%/40%_60%_40%_60%] blur-md`} />
            <div className={`absolute top-16 left-8 w-24 h-32 bg-gradient-to-tr ${styles.blob3} rounded-[50%_50%_60%_40%/30%_70%_60%_40%] blur-sm`} />
          </div>
        </div>
        <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight flex items-center gap-2 relative z-10">
          <span className={`w-1.5 h-6 ${styles.accent} rounded-full`}></span>
          {routineTitle}
        </h2>

        {/* Break time block selector */}
        {breakBlocks && selectedBlockId !== undefined && setSelectedBlockId && (
          <div className="mb-4 relative z-10">
            <select
              value={selectedBlockId || ""}
              onChange={(e) => setSelectedBlockId?.(e.target.value || null)}
              className={`w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 ${styles.ring}`}
            >
              {breakBlocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name} ({block.start_time?.slice(0, 5)} ~ {block.end_time?.slice(0, 5)})
                </option>
              ))}
            </select>
          </div>
        )}

        <ul className="space-y-2 flex-1 flex flex-col justify-center min-h-0 overflow-y-auto px-1 relative z-10">
          {routineItems.map((item, idx) => (
            <li key={item.id || idx}>
              <button
                className={`
                  relative w-full
                  bg-slate-50 hover:bg-white
                  border border-slate-200 ${styles.hoverBorder}
                  rounded-xl
                  px-4 py-3
                  text-left
                  transition-all duration-200
                  group
                  shadow-sm hover:shadow-md
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className={`text-slate-700 text-lg font-bold group-hover:${styles.textDark} transition-colors leading-relaxed block`}>
                      {item.text || item.content}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <button
          disabled={locked}
          className={`mt-6 w-full text-sm font-semibold py-3 rounded-xl transition-all border relative z-10
            ${locked
              ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
              : `${styles.bg} ${styles.text} ${styles.border} ${styles.hoverBg} ${styles.hoverText} ${styles.hoverBorder} hover:shadow-sm`
            }
          `}
          onClick={() => {
            if (locked) return;
            if (usingExternalData) {
              setTempTitle?.(routineTitle);
              setNewContent?.("");
            }
            setIsEditing(true);
          }}
        >
          Edit Routines
        </button>
      </aside>

      <BaseModal
        isOpen={isEditing}
        onClose={() => {
          // Check if child modal is open
          if (currentEditRoutine) return;
          setIsEditing(false);
        }}
      >
        <div className="bg-white p-6 rounded-3xl w-80 shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4 flex-shrink-0">루틴 편집</h3>

          <input
            className="w-full border rounded-lg px-3 py-2 mb-3 font-semibold flex-shrink-0"
            value={currentTempTitle || ""}
            onChange={(e) => setCurrentTempTitle?.(e.target.value)}
          />

          <ul className="space-y-2 mb-4 overflow-y-auto flex-1 min-h-0">
            {routineItems.map((item, index) => (
              <li key={item.id || index} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg">
                <span className="flex-1 truncate mr-2">{item.text || item.content}</span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    className="text-gray-500 font-bold p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      if (locked) return;
                      handleMoveRoutine(index, "up");
                    }}
                  >
                    ▲
                  </button>
                  <button
                    className="text-gray-500 font-bold p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      if (locked) return;
                      handleMoveRoutine(index, "down");
                    }}
                  >
                    ▼
                  </button>
                  <button
                    className="text-blue-500 font-semibold p-1 hover:bg-blue-100 rounded text-sm"
                    onClick={() => {
                      if (locked) return;
                      if (usingExternalData) {
                        setEditRoutine?.(item);
                      } else {
                        setInternalEditItem(item);
                      }
                      setCurrentEditText(item.text || item.content);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="text-red-500 font-semibold p-1 hover:bg-red-100 rounded text-sm"
                    onClick={() => {
                      if (locked) return;
                      handleDeleteRoutine(index);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex-shrink-0">
            <input
              className="w-full border rounded-lg px-3 py-2 mb-3"
              placeholder="새 루틴 입력"
              value={currentNewContent}
              onChange={(e) => setCurrentNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (locked) return;
                  handleAddRoutine();
                }
              }}
            />

            <button
              className="w-full bg-green-500 text-white py-2 rounded-full mb-2 font-semibold hover:bg-green-600 transition-colors"
              onClick={() => {
                if (locked) return;
                handleAddRoutine();
              }}
            >
              추가
            </button>

            <button
              className="w-full bg-gray-300 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors"
              onClick={async () => {
                if (locked) return;
                // 🔥 제목 저장
                if (usingExternalData) {
                  saveRoutineTitle?.();
                } else {
                  await internalSaveRoutineTitle();
                }
                setIsEditing(false);
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Inner Edit Modal (Existing Item) */}
      <BaseModal
        isOpen={!!currentEditRoutine}
        onClose={() => {
          setCurrentEditText("");
          if (usingExternalData) setEditRoutine?.(null);
          else setInternalEditItem(null);
        }}
      >
        <div className="bg-white p-6 rounded-3xl w-80 shadow-xl" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4">루틴 수정</h3>

          <input
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={currentEditText}
            onChange={(e) => setCurrentEditText(e.target.value)}
            autoFocus
          />

          <button
            className="w-full bg-blue-500 text-white py-2 rounded-full mb-2 font-semibold hover:bg-blue-600 transition-colors"
            onClick={async () => {
              if (locked) return;
              await handleUpdateRoutine();
            }}
          >
            저장
          </button>

          <button
            className="w-full bg-gray-300 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors"
            onClick={() => {
              setCurrentEditText("");
              if (usingExternalData) setEditRoutine?.(null);
              else setInternalEditItem(null);
            }}
          >
            취소
          </button>
        </div>
      </BaseModal>
    </>
  );
}

export default RoutineSidebar;