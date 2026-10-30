"use client";

import type { CSSProperties } from "react";
import { DAYS, type DayOfWeek } from "./constants";

interface HomeScreenProps {
  onSelectDay: (day: DayOfWeek) => void;
  onOpenEditHub: () => void;
}

export function HomeScreen({ onSelectDay, onOpenEditHub }: HomeScreenProps) {
  return (
    <div className="flex min-h-dvh w-full max-w-md mx-auto flex-col justify-center p-3.5 select-none">
      <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-6.25rem)*2/3))]">
        {/* 2x3 Square Metro Live Tile Grid for Monday - Saturday */}
        <div className="grid grid-cols-2 gap-3">
          {DAYS.map((day, idx) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              style={
                {
                  backgroundColor: day.metroColor,
                  "--metro-i": idx,
                } as CSSProperties
              }
              className="metro-item metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-white focus:outline-none"
            >
              <span className="text-2xl sm:text-[1.7rem] font-normal tracking-tight lowercase text-white leading-tight text-center">
                {day.label}
              </span>
            </button>
          ))}
        </div>

        {/* Bottom full-width 'edit' bar */}
        <div
          style={{ "--metro-i": 6 } as CSSProperties}
          className="metro-item mt-3"
        >
          <button
            type="button"
            onClick={onOpenEditHub}
            className="metro-tile w-full border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] py-3.5 text-center text-xl font-normal tracking-wide lowercase text-[var(--metro-fg)] active:bg-[var(--metro-surface-elevated)]"
          >
            edit
          </button>
        </div>
      </div>
    </div>
  );
}
