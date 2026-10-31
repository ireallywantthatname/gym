"use client";

import { useMutation } from "convex/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { DAY_MAP, type DayOfWeek, type UserProfile } from "./constants";

interface DayWorkoutScreenProps {
  user: UserProfile;
  day: DayOfWeek;
  workouts: Doc<"workouts">[] | undefined;
  onBack: () => void;
}

interface WorkoutAccordionItemProps {
  workout: Doc<"workouts">;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function WorkoutAccordionItem({
  workout,
  index,
  isExpanded,
  onToggle,
}: WorkoutAccordionItemProps) {
  const updateNotes = useMutation(api.workouts.updateNotes);
  const [notes, setNotes] = useState(workout.notes);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedNotesRef = useRef(workout.notes);

  useEffect(() => {
    if (workout.notes !== lastSyncedNotesRef.current) {
      setNotes(workout.notes);
      lastSyncedNotesRef.current = workout.notes;
    }
  }, [workout.notes]);

  const persistNotes = async (id: Id<"workouts">, nextNotes: string) => {
    if (nextNotes === lastSyncedNotesRef.current) {
      return;
    }
    try {
      await updateNotes({ id, notes: nextNotes });
      lastSyncedNotesRef.current = nextNotes;
    } catch {
      // Ignore transient errors; next keystroke or blur will retry
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void persistNotes(workout._id, value);
    }, 300);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    void persistNotes(workout._id, notes);
  };

  return (
    <article
      style={{ "--metro-i": index + 1 } as CSSProperties}
      className="metro-item border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] transition-colors duration-150"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="metro-tile flex w-full items-center justify-between gap-3 px-3.5 pt-3.5 pb-4 text-left hover:bg-[var(--metro-surface-elevated)]"
      >
        <span className="text-base sm:text-lg font-medium tracking-[-0.01em] leading-snug text-[var(--metro-fg)] break-words text-balance tabular-nums">
          {workout.name}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className={`h-4 w-4 shrink-0 text-[var(--metro-fg-muted)] transition-transform duration-200 ${
            isExpanded ? "rotate-180 text-[var(--metro-fg)]" : ""
          }`}
        >
          <path
            d="M3.5 6L8 10.5L12.5 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </button>

      <div className="metro-accordion-grid" data-open={isExpanded}>
        <div className="metro-accordion-inner">
          <div className="px-3 pb-3 pt-0.5">
            <div className="border-2 border-[var(--metro-border)] bg-[var(--metro-bg)] p-2.5 transition-colors duration-150 focus-within:bg-[var(--metro-surface-elevated)]">
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                onBlur={handleBlur}
                rows={3}
                placeholder="eg: 10Kg each last time, make sure to keep the back straight."
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--metro-fg)] placeholder:text-[var(--metro-fg-muted)] tabular-nums text-pretty focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DayWorkoutScreen({
  user,
  day,
  workouts,
  onBack,
}: DayWorkoutScreenProps) {
  const dayConfig = DAY_MAP[day];
  const isLoading = workouts === undefined;
  const dayWorkouts = (workouts ?? []).filter((w) => w.day === day);

  const [expandedId, setExpandedId] = useState<Id<"workouts"> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && dayWorkouts.length > 0) {
      setExpandedId(dayWorkouts[0]._id);
      initializedRef.current = true;
    }
  }, [dayWorkouts]);

  return (
    <section
      aria-label={`${dayConfig.label} workouts`}
      className="flex h-dvh w-full max-w-md mx-auto flex-col px-3.5 pt-3.5 pb-4"
    >
      {/* Top Header: Back button + Day block */}
      <header
        style={{ "--metro-i": 0 } as CSSProperties}
        className="metro-item flex items-stretch gap-2.5 pb-3.5"
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="metro-tile flex h-13 w-13 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-[var(--metro-fg)] hover:bg-[var(--metro-surface-elevated)]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 -translate-x-[1px]"
          >
            <path
              d="M19 12H5M11 6L5 12L11 18"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="square"
            />
          </svg>
        </button>
        <div
          style={{ backgroundColor: dayConfig.colors[user] }}
          className="metro-tile flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] px-4 text-center"
        >
          <h1 className="text-2xl font-medium tracking-[-0.025em] lowercase text-white leading-none">
            {dayConfig.label}
          </h1>
        </div>
      </header>

      {/* Workout Accordion List */}
      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto">
        {isLoading
          ? [0, 1, 2, 3].map((slot) => (
              <div
                key={slot}
                style={{ "--metro-i": slot + 1 } as CSSProperties}
                className="metro-item h-[3.5rem] animate-pulse border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)]"
              />
            ))
          : dayWorkouts.map((workout, idx) => (
              <WorkoutAccordionItem
                key={workout._id}
                workout={workout}
                index={idx}
                isExpanded={expandedId === workout._id}
                onToggle={() =>
                  setExpandedId((prev) =>
                    prev === workout._id ? null : workout._id,
                  )
                }
              />
            ))}
      </div>
    </section>
  );
}
