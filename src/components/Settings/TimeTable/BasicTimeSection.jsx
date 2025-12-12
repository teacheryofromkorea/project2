import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Clock } from "lucide-react";

/**
 * DB(time_blocks.time) <-> UI(오전/오후 + 시 + 분) 변환
 */
function parseTimeToParts(timeStr) {
  // timeStr: "08:30:00" or "08:30"
  const hhmm = (timeStr || "00:00").slice(0, 5);
  const [hhRaw, mmRaw] = hhmm.split(":");
  const hh24 = Number(hhRaw || 0);
  const mm = Number(mmRaw || 0);

  const isPM = hh24 >= 12;
  const ampm = isPM ? "오후" : "오전";

  let hour12 = hh24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { ampm, hour: hour12, minute: mm };
}

function partsToTime24({ ampm, hour, minute }) {
  // 결과: "HH:MM:00"
  let hh = Number(hour);
  const mm = Number(minute);

  if (ampm === "오전") {
    if (hh === 12) hh = 0; // 오전 12시 = 00
  } else {
    // 오후
    if (hh !== 12) hh += 12; // 오후 1~11 => 13~23
  }

  const HH = String(hh).padStart(2, "0");
  const MM = String(mm).padStart(2, "0");
  return `${HH}:${MM}:00`;
}

function TimePartsPicker({ value, onChange }) {
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => [0, 10, 20, 30, 40, 50], []);

  return (
    <div className="flex items-center gap-2">
      {/* 오전/오후 */}
      <button
        type="button"
        onClick={() => onChange({ ...value, ampm: value.ampm === "오전" ? "오후" : "오전" })}
        className={`px-3 py-2 rounded-xl text-sm font-semibold border transition active:scale-[0.99]
          ${value.ampm === "오전"
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-orange-50 border-orange-200 text-orange-700"
          }`}
      >
        {value.ampm}
      </button>

      {/* 시 */}
      <select
        className="px-3 py-2 rounded-xl border border-white/40 bg-white/70 shadow-sm text-sm"
        value={value.hour}
        onChange={(e) => onChange({ ...value, hour: Number(e.target.value) })}
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="text-gray-500 font-semibold">:</span>

      {/* 분 */}
      <select
        className="px-3 py-2 rounded-xl border border-white/40 bg-white/70 shadow-sm text-sm"
        value={value.minute}
        onChange={(e) => onChange({ ...value, minute: Number(e.target.value) })}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
}

function BasicTimeCard({
  title,
  toneClass,
  startParts,
  endParts,
  onChangeStart,
  onChangeEnd,
  onSave,
  saving,
}) {
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-base">{title}</div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition
            ${saving ? "opacity-60 cursor-not-allowed" : "hover:shadow-sm cursor-pointer"}
            bg-white/70 border-white/50`}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">시작 시간</span>
      </div>
      <TimePartsPicker value={startParts} onChange={onChangeStart} />

      <div className="h-4" />

      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">종료 시간</span>
      </div>
      <TimePartsPicker value={endParts} onChange={onChangeEnd} />
    </div>
  );
}

export default function BasicTimeSection() {
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState(null); // "arrival" | "lunch" | "end" | null
  const [error, setError] = useState("");

  // DB row 보관 (id 포함)
  const [rows, setRows] = useState({
    arrival: null,
    lunch: null,
    end: null,
  });

  // UI time parts state
  const [arrivalStart, setArrivalStart] = useState({ ampm: "오전", hour: 8, minute: 30 });
  const [arrivalEnd, setArrivalEnd] = useState({ ampm: "오전", hour: 8, minute: 50 });

  const [lunchStart, setLunchStart] = useState({ ampm: "오후", hour: 12, minute: 10 });
  const [lunchEnd, setLunchEnd] = useState({ ampm: "오후", hour: 1, minute: 0 });

  const [endStart, setEndStart] = useState({ ampm: "오후", hour: 2, minute: 30 });
  const [endEnd, setEndEnd] = useState({ ampm: "오후", hour: 3, minute: 0 });

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      const { data, error: e } = await supabase
        .from("time_blocks")
        .select("id, name, block_type, order_index, start_time, end_time")
        .in("block_type", ["arrival", "lunch", "end"]);

      if (!alive) return;

      if (e) {
        setError(e.message || "불러오기 실패");
        setLoading(false);
        return;
      }

      const map = { arrival: null, lunch: null, end: null };
      (data || []).forEach((r) => {
        if (r.block_type === "arrival") map.arrival = r;
        if (r.block_type === "lunch") map.lunch = r;
        if (r.block_type === "end") map.end = r;
      });

      setRows(map);

      // DB 값이 있으면 UI 초기값 덮어쓰기
      if (map.arrival?.start_time) setArrivalStart(parseTimeToParts(map.arrival.start_time));
      if (map.arrival?.end_time) setArrivalEnd(parseTimeToParts(map.arrival.end_time));

      if (map.lunch?.start_time) setLunchStart(parseTimeToParts(map.lunch.start_time));
      if (map.lunch?.end_time) setLunchEnd(parseTimeToParts(map.lunch.end_time));

      if (map.end?.start_time) setEndStart(parseTimeToParts(map.end.start_time));
      if (map.end?.end_time) setEndEnd(parseTimeToParts(map.end.end_time));

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  async function saveBasic(type) {
    setSavingType(type);
    setError("");

    const presets = {
      arrival: { name: "등교시간", order_index: 10, start: arrivalStart, end: arrivalEnd },
      lunch: { name: "점심시간", order_index: 50, start: lunchStart, end: lunchEnd },
      end: { name: "하교시간", order_index: 90, start: endStart, end: endEnd },
    };

    const preset = presets[type];

    const payload = {
      name: preset.name,
      block_type: type,
      order_index: preset.order_index,
      start_time: partsToTime24(preset.start),
      end_time: partsToTime24(preset.end),
    };

    const existing = rows[type];

    if (existing?.id) {
      // UPDATE
      const { error: e } = await supabase
        .from("time_blocks")
        .update(payload)
        .eq("id", existing.id);

      if (e) {
        setError(e.message || "저장 실패");
        setSavingType(null);
        return;
      }

      setRows((prev) => ({ ...prev, [type]: { ...existing, ...payload } }));
    } else {
      // INSERT
      const { data, error: e } = await supabase
        .from("time_blocks")
        .insert(payload)
        .select("id, name, block_type, order_index, start_time, end_time")
        .single();

      if (e) {
        setError(e.message || "저장 실패");
        setSavingType(null);
        return;
      }

      setRows((prev) => ({ ...prev, [type]: data }));
    }

    setSavingType(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-extrabold text-gray-900">🕒 기본 시간 설정</div>
          <div className="text-xs text-gray-600 mt-1">
            등교/점심/하교 시간을 설정하면, 자동 전환 및 블록 기준 데이터 분리에 사용돼요.
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/40 bg-white/40 p-6 text-gray-700">
          불러오는 중...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BasicTimeCard
            title="등교시간"
            toneClass="bg-orange-50/60 border-orange-200/70"
            startParts={arrivalStart}
            endParts={arrivalEnd}
            onChangeStart={setArrivalStart}
            onChangeEnd={setArrivalEnd}
            onSave={() => saveBasic("arrival")}
            saving={savingType === "arrival"}
          />
          <BasicTimeCard
            title="점심시간"
            toneClass="bg-green-50/60 border-green-200/70"
            startParts={lunchStart}
            endParts={lunchEnd}
            onChangeStart={setLunchStart}
            onChangeEnd={setLunchEnd}
            onSave={() => saveBasic("lunch")}
            saving={savingType === "lunch"}
          />
          <BasicTimeCard
            title="하교시간"
            toneClass="bg-purple-50/60 border-purple-200/70"
            startParts={endStart}
            endParts={endEnd}
            onChangeStart={setEndStart}
            onChangeEnd={setEndEnd}
            onSave={() => saveBasic("end")}
            saving={savingType === "end"}
          />
          
        </div>
        
      )}

      
    </div>
  );
}