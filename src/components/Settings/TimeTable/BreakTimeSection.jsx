import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, Pencil, Trash2 } from "lucide-react";

/**
 * 쉬는시간 관리 섹션
 * - block_type = "break"
 * - 각 쉬는시간은 독립된 block_id를 가짐
 * - 착석체크 / 쉬는시간 루틴 분리의 기준
 */

function toHHMM(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : "";
}

export default function BreakTimeSection() {
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id | "new" | null
  const [form, setForm] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    loadBreaks();
  }, []);

  async function loadBreaks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("block_type", "break")
      .order("order_index", { ascending: true });

    if (!error) setBreaks(data || []);
    setLoading(false);
  }

  function startAdd() {
    setEditing("new");
    setForm({ name: "", start_time: "", end_time: "" });
  }

  function startEdit(row) {
    setEditing(row.id);
    setForm({
      name: row.name,
      start_time: toHHMM(row.start_time),
      end_time: toHHMM(row.end_time),
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ name: "", start_time: "", end_time: "" });
  }

  async function save() {
    if (!form.name || !form.start_time || !form.end_time) return;

    if (editing === "new") {
      const nextOrder =
        breaks.length === 0
          ? 200
          : Math.max(...breaks.map((b) => b.order_index)) + 10;

      await supabase.from("time_blocks").insert({
        name: form.name,
        block_type: "break",
        start_time: form.start_time,
        end_time: form.end_time,
        order_index: nextOrder,
      });
    } else {
      await supabase
        .from("time_blocks")
        .update({
          name: form.name,
          start_time: form.start_time,
          end_time: form.end_time,
        })
        .eq("id", editing);
    }

    cancelEdit();
    loadBreaks();
  }

  async function remove(id) {
    if (!confirm("이 쉬는시간을 삭제할까요?")) return;
    await supabase.from("time_blocks").delete().eq("id", id);
    loadBreaks();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">☕ 쉬는시간 관리</h3>
          <p className="text-xs text-gray-600 mt-1">
            쉬는시간은 착석체크·쉬는시간 루틴을 구분하는 기준이 됩니다.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700"
        >
          <Plus className="w-4 h-4" /> 쉬는시간 추가
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-2">
          {breaks.map((b, idx) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border bg-yellow-50/70 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-600 text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-gray-600">
                    {toHHMM(b.start_time)} ~ {toHHMM(b.end_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(b)}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(b.id)}
                  className="p-2 rounded-lg border bg-white hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="rounded-2xl border bg-white/70 p-4 space-y-3">
          <div className="font-bold text-sm">
            {editing === "new" ? "쉬는시간 추가" : "쉬는시간 수정"}
          </div>

          <input
            type="text"
            placeholder="예: 1교시 후 쉬는시간"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border"
          />

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="px-3 py-2 rounded-xl border"
            />
            <span>~</span>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="px-3 py-2 rounded-xl border"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={save}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white text-sm font-semibold"
            >
              저장
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 rounded-xl border text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
