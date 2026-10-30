"use client";

import type { CSSProperties } from "react";
import { DAYS, type DayOfWeek } from "./constants";

interface HomeScreenProps {
  onSelectDay: (day: DayOfWeek) => void;
  onOpenEditHub: () => void;
}

export function HomeScreen({ onSelectDay, onOpenEditHub }: HomeScreenProps) {
  return (
    <section
      aria-label="weekly workout schedule"
      className="flex min-h-dvh w-full max-w-md mx-auto flex-col justify-center px-3.5 pt-3.5 pb-4 select-none"
    >
      <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-6.25rem)*2/3))]">
        {/* 2x3 Square Metro Live Tile Grid for Monday - Saturday */}
        <nav aria-label="days of the week" className="grid grid-cols-2 gap-3">
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
              className="metro-item metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-white"
            >
              <span className="text-[1.65rem] sm:text-[1.85rem] font-medium tracking-[-0.025em] lowercase text-white leading-[1.05] text-center text-balance">
                {day.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom full-width 'edit' bar */}
        <div
          style={{ "--metro-i": 6 } as CSSProperties}
          className="metro-item mt-3"
        >
          <button
            type="button"
            onClick={onOpenEditHub}
            className="metro-tile w-full border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] pt-3.5 pb-4 text-center text-xl font-medium tracking-[-0.015em] lowercase text-[var(--metro-fg)] hover:bg-[var(--metro-surface-elevated)] active:bg-[var(--metro-surface-elevated)]"
          >
            edit
          </button>
        </div>
      </div>
    </section>
  );
}
