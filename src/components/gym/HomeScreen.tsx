"use client";

import type { Doc } from "../../../convex/_generated/dataModel";
import { DAYS, type DayOfWeek, type UserProfile } from "./constants";

interface HomeScreenProps {
  user: UserProfile;
  workouts: Doc<"workouts">[] | undefined;
  onSelectDay: (day: DayOfWeek) => void;
  onOpenEditHub: () => void;
}

export function HomeScreen({
  user,
  workouts,
  onSelectDay,
  onOpenEditHub,
}: HomeScreenProps) {
  const countByDay = (day: DayOfWeek): number => {
    if (!workouts) return 0;
    return workouts.filter((w) => w.day === day).length;
  };

  return (
    <div className="metro-screen-enter flex h-dvh w-full max-w-md mx-auto flex-col justify-between p-3.5 select-none">
      {/* Subtle Metro status strip */}
      <header className="flex items-center justify-between pb-2.5">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--metro-fg-muted)]">
          the gymnasium
        </span>
        <div className="flex items-center gap-1.5 border border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] px-2.5 py-0.5">
          <span
            className="h-2 w-2"
            style={{
              backgroundColor: user === "akash" ? "#00ABA9" : "#D80073",
            }}
          />
          <span className="text-xs font-medium tracking-wider lowercase text-[var(--metro-fg)]">
            {user}
          </span>
        </div>
      </header>

      {/* 2x3 Metro Live Tile Grid for Monday - Saturday */}
      <div className="grid flex-1 grid-cols-2 grid-rows-3 gap-3 my-1">
        {DAYS.map((day) => {
          const count = countByDay(day.id);
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              style={{ backgroundColor: day.metroColor }}
              className="metro-tile group relative flex flex-col items-center justify-center border-2 border-[var(--metro-border)] p-4 text-white shadow-none focus:outline-none"
            >
              {/* Top-right workout count badge */}
              {workouts !== undefined && (
                <span className="absolute top-2.5 right-3 text-xs font-semibold tracking-wider text-white/85">
                  {count > 0 ? count : ""}
                </span>
              )}

              {/* Center day label matching sketch */}
              <span className="text-2xl sm:text-[1.7rem] font-normal tracking-tight lowercase text-white leading-tight text-center">
                {day.label}
              </span>

              {/* Bottom-left subtle Metro live-tile caption */}
              <span className="absolute bottom-2.5 left-3 text-[11px] font-light tracking-wide text-white/80 lowercase">
                {workouts === undefined
                  ? "..."
                  : count === 1
                    ? "1 workout"
                    : count > 1
                      ? `${count} workouts`
                      : "rest / empty"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom full-width 'edit' bar */}
      <div className="pt-2.5">
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
