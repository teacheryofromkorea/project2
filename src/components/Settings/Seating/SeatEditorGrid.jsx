import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const GROUP_COLOR_MAP = {
  A: "border-blue-500 bg-blue-50",
  B: "border-green-500 bg-green-50",
  C: "border-purple-500 bg-purple-50",
  D: "border-orange-500 bg-orange-50",
};

function SeatEditorGrid({ onSeatSelect }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    const { data, error } = await supabase
      .from("classroom_seats")
      .select("*")
      .order("row", { ascending: true })
      .order("col", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setSeats(data || []);
  };

  if (seats.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        좌석 데이터가 없습니다. 좌석을 먼저 생성해주세요.
      </div>
    );
  }

  const maxRow = Math.max(...seats.map((s) => s.row));
  const maxCol = Math.max(...seats.map((s) => s.col));

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`,
      }}
    >
      {seats.map((seat) => {
        const isSelected = selectedSeatIds.includes(seat.id);
        const groupStyle =
          seat.group_name && GROUP_COLOR_MAP[seat.group_name]
            ? GROUP_COLOR_MAP[seat.group_name]
            : "border-gray-300 bg-white";

        return (
          <button
            key={seat.id}
            onClick={() => {
              setSelectedSeatIds((prev) => {
                const next = prev.includes(seat.id)
                  ? prev.filter((id) => id !== seat.id)
                  : [...prev, seat.id];

                if (onSeatSelect) {
                  const selectedSeats = seats.filter((s) => next.includes(s.id));
                  onSeatSelect(selectedSeats);
                }

                return next;
              });
            }}
            className={`
              relative aspect-square rounded-xl border
              flex items-center justify-center
              text-sm font-medium
              transition
              ${groupStyle}
              ${isSelected ? "ring-2 ring-indigo-500" : "hover:brightness-95"}
            `}
          >
            <>
              {seat.group_name && (
                <span className="absolute top-1 left-1 text-[10px] font-bold text-gray-600">
                  {seat.group_name}
                </span>
              )}
              {seat.label || `${seat.row}-${seat.col}`}
            </>
          </button>
        );
      })}
    </div>
  );
}

export default SeatEditorGrid;