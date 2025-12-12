import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, Pencil, Trash2 } from "lucide-react";

/**
 * 수업시간 관리 섹션
 * - block_type = "class"
 * - 교시별 시작/종료 시간 관리
 */

function toHHMM(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : "";
}

export default function ClassTimeSection() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or null
  const [form, setForm] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("block_type", "class")
      .order("order_index", { ascending: true });

    if (!error) setClasses(data || []);
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
        classes.length === 0
          ? 100
          : Math.max(...classes.map((c) => c.order_index)) + 10;

      await supabase.from("time_blocks").insert({
        name: form.name,
        block_type: "class",
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
    loadClasses();
  }

  async function remove(id) {
    if (!confirm("이 수업시간을 삭제할까요?")) return;
    await supabase.from("time_blocks").delete().eq("id", id);
    loadClasses();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">📘 수업시간 관리</h3>
          <p className="text-xs text-gray-600 mt-1">
            교시별 수업 시작/종료 시간을 설정합니다.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> 수업시간 추가
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-2">
          {classes.map((c, idx) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border bg-blue-50/60 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-600">
                    {toHHMM(c.start_time)} ~ {toHHMM(c.end_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(c)}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(c.id)}
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
            {editing === "new" ? "수업시간 추가" : "수업시간 수정"}
          </div>

          <input
            type="text"
            placeholder="예: 1교시"
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
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
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
