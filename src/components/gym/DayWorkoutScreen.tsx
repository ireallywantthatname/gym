"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { DAY_MAP, type DayOfWeek } from "./constants";

interface DayWorkoutScreenProps {
  day: DayOfWeek;
  workouts: Doc<"workouts">[] | undefined;
  onBack: () => void;
  onEditDaySchedule: (day: DayOfWeek) => void;
}

interface WorkoutAccordionItemProps {
  workout: Doc<"workouts">;
  isExpanded: boolean;
  accentColor: string;
  onToggle: () => void;
}

function WorkoutAccordionItem({
  workout,
  isExpanded,
  accentColor,
  onToggle,
}: WorkoutAccordionItemProps) {
  const updateNotes = useMutation(api.workouts.updateNotes);
  const [notes, setNotes] = useState(workout.notes);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
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
      setSaveState("idle");
      return;
    }
    setSaveState("saving");
    try {
      await updateNotes({ id, notes: nextNotes });
      lastSyncedNotesRef.current = nextNotes;
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setSaveState("saving");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void persistNotes(workout._id, value);
    }, 350);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    void persistNotes(workout._id, notes);
  };

  const hasNotes = notes.trim().length > 0;

  return (
    <div
      className="border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] transition-colors"
      style={{
        borderLeftWidth: "6px",
        borderLeftColor: isExpanded ? accentColor : "var(--metro-border)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="metro-tile flex w-full items-center justify-between px-3.5 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1 pr-2">
          <div className="text-base sm:text-lg font-medium leading-snug text-[var(--metro-fg)] break-words">
            {workout.name}
          </div>
          {!isExpanded && hasNotes && (
            <p className="mt-0.5 truncate text-xs text-[var(--metro-fg-muted)]">
              {notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasNotes && !isExpanded && (
            <span
              className="h-2 w-2"
              style={{ backgroundColor: accentColor }}
              title="Has notes"
            />
          )}
          <span
            className="flex h-6 w-6 items-center justify-center border border-[var(--metro-border-subtle)] text-xs font-bold text-[var(--metro-fg)] transition-transform duration-150"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0.5">
          <div className="border-2 border-[var(--metro-border)] bg-[var(--metro-bg)] p-2.5">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              onBlur={handleBlur}
              rows={3}
              placeholder="eg: 10Kg each last time, make sure to keep the back straight."
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--metro-fg)] placeholder:text-[var(--metro-fg-muted)] focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between border-t border-[var(--metro-border-subtle)] pt-1.5 text-[11px] lowercase text-[var(--metro-fg-muted)]">
              <span>workout notes</span>
              <span>
                {saveState === "saving"
                  ? "saving..."
                  : saveState === "saved"
                    ? "saved"
                    : "auto-saves"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DayWorkoutScreen({
  day,
  workouts,
  onBack,
  onEditDaySchedule,
}: DayWorkoutScreenProps) {
  const dayConfig = DAY_MAP[day];
  const dayWorkouts = (workouts ?? []).filter((w) => w.day === day);

  // Default expand the first workout if present, matching the user's sketch
  const [expandedId, setExpandedId] = useState<Id<"workouts"> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && dayWorkouts.length > 0) {
      setExpandedId(dayWorkouts[0]._id);
      initializedRef.current = true;
    }
  }, [dayWorkouts]);

  return (
    <div className="metro-screen-enter flex h-dvh w-full max-w-md mx-auto flex-col p-3.5">
      {/* Top Header: Back button + Day block */}
      <header className="flex items-stretch gap-2.5 pb-3.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="metro-tile flex h-13 w-13 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-2xl font-light text-[var(--metro-fg)]"
        >
          ←
        </button>
        <div
          style={{ backgroundColor: dayConfig.metroColor }}
          className="flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] px-4 text-center"
        >
          <h1 className="text-2xl font-normal tracking-wide lowercase text-white">
            {dayConfig.label}
          </h1>
        </div>
      </header>

      {/* Workout Accordion List */}
      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto pb-4">
        {workouts === undefined ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-14 animate-pulse border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)]"
              />
            ))}
          </div>
        ) : dayWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] px-5 py-12 text-center">
            <p className="text-lg lowercase text-[var(--metro-fg)]">
              no workouts scheduled for {dayConfig.label}
            </p>
            <p className="mt-1 text-xs lowercase text-[var(--metro-fg-muted)]">
              tap below to add workouts to this day
            </p>
            <button
              type="button"
              onClick={() => onEditDaySchedule(day)}
              style={{ backgroundColor: dayConfig.metroColor }}
              className="metro-tile mt-5 border-2 border-[var(--metro-border)] px-5 py-2.5 text-sm font-medium lowercase text-white"
            >
              edit [{dayConfig.label}]
            </button>
          </div>
        ) : (
          dayWorkouts.map((workout) => (
            <WorkoutAccordionItem
              key={workout._id}
              workout={workout}
              isExpanded={expandedId === workout._id}
              accentColor={dayConfig.metroColor}
              onToggle={() =>
                setExpandedId((prev) =>
                  prev === workout._id ? null : workout._id,
                )
              }
            />
          ))
        )}
      </div>

      {/* Quick shortcut footer to edit this day's schedule */}
      {dayWorkouts.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onEditDaySchedule(day)}
            className="metro-tile w-full border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] py-2.5 text-center text-xs font-medium tracking-wider lowercase text-[var(--metro-fg-muted)]"
          >
            edit [{dayConfig.label}] schedule
          </button>
        </div>
      )}
    </div>
  );
}
