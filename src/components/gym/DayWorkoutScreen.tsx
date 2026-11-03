"use client";

import { useMutation } from "convex/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  DAY_MAP,
  type DayOfWeek,
  getTodayDateKey,
  type ScheduleViewMode,
  type UserProfile,
} from "./constants";

interface DayWorkoutScreenProps {
  user: UserProfile;
  day: DayOfWeek;
  workouts: Doc<"workouts">[] | undefined;
  viewMode: ScheduleViewMode;
  onToggleViewMode: () => void;
  onEditDay: () => void;
  onBack: () => void;
}

function useWorkoutItemState(workout: Doc<"workouts">, todayKey: string) {
  const updateNotes = useMutation(api.workouts.updateNotes);
  const setCompletedMutation = useMutation(api.workouts.setCompleted);

  const [notes, setNotes] = useState(workout.notes);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedNotesRef = useRef(workout.notes);

  const serverCompleted = workout.lastCompletedDate === todayKey;
  const [isCompleted, setIsCompleted] = useState(serverCompleted);
  const lastSyncedCompletedRef = useRef(serverCompleted);

  useEffect(() => {
    if (workout.notes !== lastSyncedNotesRef.current) {
      setNotes(workout.notes);
      lastSyncedNotesRef.current = workout.notes;
    }
  }, [workout.notes]);

  useEffect(() => {
    if (serverCompleted !== lastSyncedCompletedRef.current) {
      setIsCompleted(serverCompleted);
      lastSyncedCompletedRef.current = serverCompleted;
    }
  }, [serverCompleted]);

  const persistNotes = async (id: Id<"workouts">, nextNotes: string) => {
    if (nextNotes === lastSyncedNotesRef.current) {
      return;
    }
    try {
      await updateNotes({ id, notes: nextNotes });
      lastSyncedNotesRef.current = nextNotes;
    } catch {}
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

  const handleToggleCompleted = async () => {
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);
    lastSyncedCompletedRef.current = nextCompleted;
    try {
      await setCompletedMutation({
        id: workout._id,
        completedDate: nextCompleted ? todayKey : undefined,
      });
    } catch {}
  };

  return {
    notes,
    isCompleted,
    handleNotesChange,
    handleBlur,
    handleToggleCompleted,
  };
}

interface MetroCheckboxProps {
  checked: boolean;
  accentColor: string;
  label: string;
  onToggle: () => void;
}

function MetroCheckbox({
  checked,
  accentColor,
  label,
  onToggle,
}: MetroCheckboxProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={`Mark ${label} as ${checked ? "incomplete" : "completed"}`}
      onClick={onToggle}
      style={checked ? { backgroundColor: accentColor } : undefined}
      className={`metro-tile flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] transition-colors duration-150 ${
        checked ? "text-white" : "bg-[var(--metro-bg)] text-transparent"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        className="h-3.5 w-3.5"
      >
        <path
          d="M3 8.5L6.5 12L13 4.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}

interface WorkoutAccordionItemProps {
  workout: Doc<"workouts">;
  index: number;
  accentColor: string;
  todayKey: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function WorkoutAccordionItem({
  workout,
  index,
  accentColor,
  todayKey,
  isExpanded,
  onToggle,
}: WorkoutAccordionItemProps) {
  const {
    notes,
    isCompleted,
    handleNotesChange,
    handleBlur,
    handleToggleCompleted,
  } = useWorkoutItemState(workout, todayKey);

  return (
    <article
      style={{ "--metro-i": index + 1 } as CSSProperties}
      className="metro-item border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] transition-colors duration-150"
    >
      <div className="flex w-full items-center gap-3 px-3.5 pt-3.5 pb-4 hover:bg-[var(--metro-surface-elevated)]">
        <MetroCheckbox
          checked={isCompleted}
          accentColor={accentColor}
          label={workout.name}
          onToggle={handleToggleCompleted}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex flex-1 items-center justify-between gap-3 text-left"
        >
          <span
            className={`text-base sm:text-lg font-medium tracking-[-0.01em] leading-snug break-words text-balance tabular-nums transition-opacity duration-150 ${
              isCompleted
                ? "line-through text-[var(--metro-fg-muted)] opacity-60"
                : "text-[var(--metro-fg)]"
            }`}
          >
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
      </div>

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

interface WorkoutCarouselSlideProps {
  workout: Doc<"workouts">;
  index: number;
  total: number;
  accentColor: string;
  todayKey: string;
}

function WorkoutCarouselSlide({
  workout,
  index,
  total,
  accentColor,
  todayKey,
}: WorkoutCarouselSlideProps) {
  const {
    notes,
    isCompleted,
    handleNotesChange,
    handleBlur,
    handleToggleCompleted,
  } = useWorkoutItemState(workout, todayKey);

  return (
    <article
      aria-label={workout.name}
      className="flex h-full w-full shrink-0 snap-center flex-col px-0.5"
    >
      <div className="flex flex-1 flex-col gap-3 border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] p-3.5">
        <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--metro-border-subtle)] pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <MetroCheckbox
              checked={isCompleted}
              accentColor={accentColor}
              label={workout.name}
              onToggle={handleToggleCompleted}
            />
            <h2
              className={`text-lg sm:text-xl font-medium tracking-[-0.015em] leading-snug break-words text-balance tabular-nums transition-opacity duration-150 ${
                isCompleted
                  ? "line-through text-[var(--metro-fg-muted)] opacity-60"
                  : "text-[var(--metro-fg)]"
              }`}
            >
              {workout.name}
            </h2>
          </div>
          <span className="shrink-0 border-2 border-[var(--metro-border)] bg-[var(--metro-bg)] px-2 py-0.5 text-xs font-medium text-[var(--metro-fg-muted)] tabular-nums">
            {index + 1} / {total}
          </span>
        </div>

        <div className="flex flex-1 flex-col border-2 border-[var(--metro-border)] bg-[var(--metro-bg)] p-3 transition-colors duration-150 focus-within:bg-[var(--metro-surface-elevated)]">
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="eg: 10Kg each last time, make sure to keep the back straight."
            className="h-full w-full flex-1 resize-none bg-transparent text-base leading-relaxed text-[var(--metro-fg)] placeholder:text-[var(--metro-fg-muted)] tabular-nums text-pretty focus:outline-none"
          />
        </div>
      </div>
    </article>
  );
}

export function DayWorkoutScreen({
  user,
  day,
  workouts,
  viewMode,
  onToggleViewMode,
  onEditDay,
  onBack,
}: DayWorkoutScreenProps) {
  const dayConfig = DAY_MAP[day];
  const accentColor = dayConfig.colors[user];
  const isLoading = workouts === undefined;
  const dayWorkouts = (workouts ?? []).filter((w) => w.day === day);
  const [todayKey, setTodayKey] = useState(() => getTodayDateKey());

  const [expandedId, setExpandedId] = useState<Id<"workouts"> | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [flipViewToggle, setFlipViewToggle] = useState(false);
  const initializedRef = useRef(false);
  const activeSlideRef = useRef(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  activeSlideRef.current = activeSlide;

  useEffect(() => {
    setTodayKey(getTodayDateKey());
  }, []);

  useEffect(() => {
    if (!initializedRef.current && dayWorkouts.length > 0) {
      setExpandedId(dayWorkouts[0]._id);
      initializedRef.current = true;
    }
  }, [dayWorkouts]);

  useEffect(() => {
    if (viewMode !== "carousel") return;
    const container = carouselRef.current;
    if (!container || container.clientWidth === 0) return;
    const clamped = Math.max(
      0,
      Math.min(dayWorkouts.length - 1, activeSlideRef.current),
    );
    container.scrollLeft = clamped * container.clientWidth;
  }, [viewMode, dayWorkouts.length]);

  const scrollToSlide = (index: number) => {
    const container = carouselRef.current;
    if (!container || dayWorkouts.length === 0) return;
    const clamped = Math.max(0, Math.min(dayWorkouts.length - 1, index));
    setActiveSlide(clamped);
    const targetWorkout = dayWorkouts[clamped];
    if (targetWorkout) {
      setExpandedId(targetWorkout._id);
    }
    container.scrollTo({
      left: clamped * container.clientWidth,
      behavior: "smooth",
    });
  };

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container || container.clientWidth === 0 || dayWorkouts.length === 0) {
      return;
    }
    const index = Math.round(container.scrollLeft / container.clientWidth);
    const clamped = Math.max(0, Math.min(dayWorkouts.length - 1, index));
    if (clamped !== activeSlide) {
      setActiveSlide(clamped);
      const targetWorkout = dayWorkouts[clamped];
      if (targetWorkout) {
        setExpandedId(targetWorkout._id);
      }
    }
  };

  const handleViewTogglePress = () => {
    if (viewMode === "list" && expandedId) {
      const idx = dayWorkouts.findIndex((w) => w._id === expandedId);
      if (idx >= 0) {
        setActiveSlide(idx);
      }
    }
    setFlipViewToggle(true);
    onToggleViewMode();
    setTimeout(() => setFlipViewToggle(false), 320);
  };

  return (
    <section
      aria-label={`${dayConfig.label} workouts`}
      className="flex h-dvh w-full max-w-md mx-auto flex-col px-3.5 pt-3.5 pb-4"
    >
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
          style={{ backgroundColor: accentColor }}
          className="metro-tile flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] px-4 text-center"
        >
          <h1 className="text-2xl font-medium tracking-[-0.025em] lowercase text-white leading-none">
            {dayConfig.label}
          </h1>
        </div>

        {dayWorkouts.length > 0 && (
          <button
            type="button"
            onClick={handleViewTogglePress}
            aria-label={
              viewMode === "list"
                ? "Switch to carousel view"
                : "Switch to list view"
            }
            className={`metro-tile flex h-13 w-13 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-[var(--metro-fg)] hover:bg-[var(--metro-surface-elevated)] ${
              flipViewToggle ? "metro-tile-flip" : ""
            }`}
          >
            {viewMode === "list" ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <rect
                  x="5"
                  y="4"
                  width="14"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2 8V16M22 8V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="square"
                />
              </svg>
            )}
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto">
          {[0, 1, 2, 3].map((slot) => (
            <div
              key={slot}
              style={{ "--metro-i": slot + 1 } as CSSProperties}
              className="metro-item h-[3.5rem] animate-pulse border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)]"
            />
          ))}
        </div>
      ) : dayWorkouts.length === 0 ? (
        <button
          type="button"
          onClick={onEditDay}
          aria-label={`Add workouts for ${dayConfig.label}`}
          style={{ "--metro-i": 1 } as CSSProperties}
          className="metro-item metro-tile flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-[var(--metro-fg-muted)] hover:bg-[var(--metro-surface-elevated)] hover:text-[var(--metro-fg)]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="square"
            />
          </svg>
        </button>
      ) : viewMode === "list" ? (
        <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto">
          {dayWorkouts.map((workout, idx) => (
            <WorkoutAccordionItem
              key={workout._id}
              workout={workout}
              index={idx}
              accentColor={accentColor}
              todayKey={todayKey}
              isExpanded={expandedId === workout._id}
              onToggle={() => {
                setActiveSlide(idx);
                setExpandedId((prev) =>
                  prev === workout._id ? null : workout._id,
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{ "--metro-i": 1 } as CSSProperties}
          className="metro-item flex flex-1 flex-col gap-2.5 overflow-hidden"
        >
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
          >
            {dayWorkouts.map((workout, idx) => (
              <WorkoutCarouselSlide
                key={workout._id}
                workout={workout}
                index={idx}
                total={dayWorkouts.length}
                accentColor={accentColor}
                todayKey={todayKey}
              />
            ))}
          </div>

          {dayWorkouts.length > 1 && (
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => scrollToSlide(activeSlide - 1)}
                disabled={activeSlide <= 0}
                aria-label="Previous exercise"
                className="metro-tile flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-[var(--metro-fg)] hover:bg-[var(--metro-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                >
                  <path
                    d="M15 6L9 12L15 18"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="square"
                  />
                </svg>
              </button>

              <div className="flex flex-1 items-center justify-center gap-1.5">
                {dayWorkouts.map((workout, idx) => {
                  const isActive = idx === activeSlide;
                  return (
                    <button
                      key={workout._id}
                      type="button"
                      onClick={() => scrollToSlide(idx)}
                      aria-label={`Go to exercise ${idx + 1}`}
                      style={
                        isActive ? { backgroundColor: accentColor } : undefined
                      }
                      className={`h-3 flex-1 max-w-8 border-2 border-[var(--metro-border)] transition-colors duration-150 ${
                        isActive ? "" : "bg-[var(--metro-surface)]"
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollToSlide(activeSlide + 1)}
                disabled={activeSlide >= dayWorkouts.length - 1}
                aria-label="Next exercise"
                className="metro-tile flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-[var(--metro-fg)] hover:bg-[var(--metro-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="square"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
