"use client";

import { DAYS, type DayOfWeek } from "./constants";

interface HomeScreenProps {
  onSelectDay: (day: DayOfWeek) => void;
  onOpenEditHub: () => void;
}

export function HomeScreen({ onSelectDay, onOpenEditHub }: HomeScreenProps) {
  return (
    <div className="metro-screen-enter flex h-dvh w-full max-w-md mx-auto flex-col justify-between p-3.5 select-none">
      {/* 2x3 Metro Live Tile Grid for Monday - Saturday */}
      <div className="grid flex-1 grid-cols-2 grid-rows-3 gap-3">
        {DAYS.map((day) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(day.id)}
            style={{ backgroundColor: day.metroColor }}
            className="metro-tile flex items-center justify-center border-2 border-[var(--metro-border)] p-4 text-white focus:outline-none"
          >
            <span className="text-2xl sm:text-[1.7rem] font-normal tracking-tight lowercase text-white leading-tight text-center">
              {day.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom full-width 'edit' bar */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onOpenEditHub}
          className="metro-tile w-full border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] py-3.5 text-center text-xl font-normal tracking-wide lowercase text-[var(--metro-fg)] active:bg-[var(--metro-surface-elevated)]"
        >
          edit
        </button>
      </div>
    </div>
  );
}
