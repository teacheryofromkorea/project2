import { useState, useEffect } from "react";
import BaseModal from "../common/BaseModal";
import { supabase } from "../../lib/supabaseClient";
import { handleSupabaseError } from "../../utils/handleSupabaseError";
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
}) {
  const { locked } = useLock();

  // 🗂 Internal state for Attendance tab
  const [internalItems, setInternalItems] = useState([]);
  const [internalTitle, setInternalTitle] = useState("✏️ 등교시 루틴");

  // Determine which data source to use
  const usingExternalData = externalItems !== undefined;
  const routineItems = usingExternalData ? externalItems : internalItems;
  const routineTitle = usingExternalData ? externalTitle : internalTitle;

  // 모든 모달 상태 useState
  const [isEditing, setIsEditing] = useState(false);
  const [internalNewRoutine, setInternalNewRoutine] = useState("");
  const [internalEditIndex, setInternalEditIndex] = useState(null);
  const [internalEditText, setInternalEditText] = useState("");

  // 📌 Supabase에서 루틴 불러오기 (only if not using external data)
  useEffect(() => {
    if (usingExternalData) return;

    const fetchRoutines = async () => {
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        handleSupabaseError(error, "루틴 목록을 불러오지 못했어요.");
        return;
      }

      if (data) {
        setInternalItems(data);

        // 🔥 DB에서 제목 가져오기
        if (data.length > 0 && data[0].routine_title) {
          setInternalTitle(data[0].routine_title);
        }
      }
    };

    fetchRoutines();
  }, [usingExternalData]);

  // ESC handlers removed in favor of BaseModal (simple fallback)
  useEffect(() => {
    if (locked) {
      setIsEditing(false);
      if (usingExternalData) {
        setEditRoutine?.(null);
        setEditText?.("");
      } else {
        setInternalEditIndex(null);
        setInternalEditText("");
      }
    }
  }, [locked, usingExternalData, setEditRoutine, setEditText]);

  // Internal CRUD functions (only used for Attendance tab)
  const internalAddRoutine = async () => {
    if (locked) return;
    if (internalNewRoutine.trim() === "") return;

    const { data, error } = await supabase
      .from("routines")
      .insert({
        text: internalNewRoutine,
        order_index: internalItems.length,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, "루틴 추가에 실패했어요.");
      return;
    }

    setInternalItems([...internalItems, data]);
    setInternalNewRoutine("");
  };

  const internalDeleteRoutine = async (index) => {
    if (locked) return;
    const item = internalItems[index];
    const { error } = await supabase
      .from("routines")
      .delete()
      .eq("id", item.id);

    if (error) {
      handleSupabaseError(error, "루틴 삭제에 실패했어요.");
      return;
    }

    const updated = internalItems.filter((_, i) => i !== index);
    setInternalItems(updated);

    // order_index 다시 정렬
    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("routines")
        .update({ order_index: i })
        .eq("id", updated[i].id);
    }
  };

  const internalMoveRoutine = async (index, direction) => {
    if (locked) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= internalItems.length) return;

    const updated = [...internalItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    setInternalItems(updated);

    // DB 업데이트
    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("routines")
        .update({ order_index: i })
        .eq("id", updated[i].id);
    }
  };

  const internalUpdateRoutine = async () => {
    if (locked) return;
    if (internalEditText.trim() === "") return;

    const item = internalItems[internalEditIndex];
    const { error } = await supabase
      .from("routines")
      .update({ text: internalEditText })
      .eq("id", item.id);

    if (error) {
      handleSupabaseError(error, "루틴 수정에 실패했어요.");
      return;
    }

    const updated = [...internalItems];
    updated[internalEditIndex] = { ...item, text: internalEditText };
    setInternalItems(updated);
    setInternalEditIndex(null);
    setInternalEditText("");
  };

  // Use external or internal handlers
  const handleAddRoutine = usingExternalData ? addRoutineItem : internalAddRoutine;
  const handleDeleteRoutine = usingExternalData ? deleteRoutineItem : internalDeleteRoutine;
  const handleMoveRoutine = usingExternalData ? moveRoutine : internalMoveRoutine;
  const handleUpdateRoutine = usingExternalData ? updateRoutine : internalUpdateRoutine;

  const currentNewContent = usingExternalData ? newContent : internalNewRoutine;
  const setCurrentNewContent = usingExternalData ? setNewContent : setInternalNewRoutine;
  const currentEditText = usingExternalData ? editText : internalEditText;
  const setCurrentEditText = usingExternalData ? setEditText : setInternalEditText;
  const currentEditRoutine = usingExternalData ? editRoutine : (internalEditIndex !== null ? internalItems[internalEditIndex] : null);

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
          <div className="absolute -top-4 -left-8 w-48 h-64">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/35 via-purple-400/25 to-indigo-300/15 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] blur-lg" />
            <div className="absolute top-8 left-12 w-32 h-40 bg-gradient-to-bl from-purple-500/30 via-indigo-400/20 to-transparent rounded-[60%_40%_30%_70%/40%_60%_40%_60%] blur-md" />
            <div className="absolute top-16 left-8 w-24 h-32 bg-gradient-to-tr from-indigo-500/25 to-transparent rounded-[50%_50%_60%_40%/30%_70%_60%_40%] blur-sm" />
          </div>
        </div>
        <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight flex items-center gap-2 relative z-10">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
          {routineTitle}
        </h2>

        {/* Break time block selector */}
        {breakBlocks && selectedBlockId !== undefined && setSelectedBlockId && (
          <div className="mb-4 relative z-10">
            <select
              value={selectedBlockId || ""}
              onChange={(e) => setSelectedBlockId?.(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="
                  relative w-full
                  bg-slate-50 hover:bg-white
                  border border-slate-200 hover:border-indigo-300
                  rounded-xl
                  px-4 py-3
                  text-left
                  transition-all duration-200
                  group
                  shadow-sm hover:shadow-md
                "
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="text-slate-700 text-lg font-bold group-hover:text-indigo-900 transition-colors leading-relaxed block">
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
              : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 hover:shadow-sm"
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
          const isChildOpen = usingExternalData ? !!currentEditRoutine : internalEditIndex !== null;
          if (isChildOpen) return;
          setIsEditing(false);
        }}
      >
        <div className="bg-white p-6 rounded-3xl w-80 shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4 flex-shrink-0">루틴 편집</h3>

          <input
            className="w-full border rounded-lg px-3 py-2 mb-3 font-semibold flex-shrink-0"
            value={usingExternalData && tempTitle !== undefined ? tempTitle : internalTitle}
            onChange={(e) => usingExternalData ? setTempTitle?.(e.target.value) : setInternalTitle(e.target.value)}
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
                        setInternalEditIndex(index);
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
                  if (internalItems.length > 0) {
                    const ids = internalItems.map((item) => item.id);
                    const { error } = await supabase
                      .from("routines")
                      .update({ routine_title: internalTitle })
                      .in("id", ids);

                    if (error) {
                      handleSupabaseError(error, "루틴 제목 저장에 실패했어요.");
                      return;
                    }
                  }
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
        isOpen={usingExternalData ? !!currentEditRoutine : internalEditIndex !== null}
        onClose={() => {
          setCurrentEditText("");
          if (usingExternalData) setEditRoutine?.(null);
          else setInternalEditIndex(null);
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
              else setInternalEditIndex(null);
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