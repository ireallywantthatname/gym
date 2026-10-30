"use client";

import { useMutation } from "convex/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { DAY_MAP, DAYS, type DayOfWeek, type UserProfile } from "./constants";

interface EditScheduleCarouselScreenProps {
  user: UserProfile;
  initialDay: DayOfWeek;
  workouts: Doc<"workouts">[] | undefined;
  onBack: () => void;
}

interface DayScheduleSlideProps {
  user: UserProfile;
  day: DayOfWeek;
  accentColor: string;
  workouts: Doc<"workouts">[];
}

function DayScheduleSlide({
  user,
  day,
  accentColor,
  workouts,
}: DayScheduleSlideProps) {
  const addWorkout = useMutation(api.workouts.addWorkout);
  const updateWorkout = useMutation(api.workouts.updateWorkout);
  const deleteWorkout = useMutation(api.workouts.deleteWorkout);
  const moveWorkout = useMutation(api.workouts.moveWorkout);

  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [editingId, setEditingId] = useState<Id<"workouts"> | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newWorkoutName.trim();
    if (!trimmed || isAdding) return;

    setIsAdding(true);
    setNewWorkoutName("");
    try {
      await addWorkout({
        user,
        day,
        name: trimmed,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (workout: Doc<"workouts">) => {
    setEditingId(workout._id);
    setEditingName(workout.name);
  };

  const saveEdit = async (id: Id<"workouts">) => {
    const trimmed = editingName.trim();
    setEditingId(null);
    if (!trimmed) return;
    await updateWorkout({ id, name: trimmed });
  };

  return (
    <div className="flex h-full w-full shrink-0 snap-center flex-col px-3.5 pb-3.5">
      {/* Add New Workout Form at top of slide */}
      <form onSubmit={handleAdd} className="mb-3 flex gap-2">
        <input
          type="text"
          value={newWorkoutName}
          onChange={(e) => setNewWorkoutName(e.target.value)}
          placeholder={`add workout to ${day}...`}
          className="min-w-0 flex-1 border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] px-3 py-2.5 text-sm text-[var(--metro-fg)] placeholder:text-[var(--metro-fg-muted)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newWorkoutName.trim() || isAdding}
          style={{ backgroundColor: accentColor }}
          className="metro-tile shrink-0 border-2 border-[var(--metro-border)] px-4 py-2.5 text-sm font-semibold lowercase text-white disabled:opacity-40"
        >
          + add
        </button>
      </form>

      {/* Stacked Workout Blocks matching Screen 4 sketch */}
      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto pb-2">
        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] px-4 py-10 text-center">
            <p className="text-sm lowercase text-[var(--metro-fg-muted)]">
              no workouts for {day} yet
            </p>
            <p className="mt-1 text-xs lowercase text-[var(--metro-fg-muted)]">
              type an exercise above (e.g. Barbell Flat Bench Press) and tap +
              add
            </p>
          </div>
        ) : (
          workouts.map((workout, idx) => {
            const isEditing = editingId === workout._id;
            return (
              <div
                key={workout._id}
                className="flex items-center justify-between gap-2 border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] px-3 py-3"
                style={{
                  borderLeftWidth: "6px",
                  borderLeftColor: accentColor,
                }}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveEdit(workout._id);
                    }}
                    className="flex flex-1 items-center gap-2"
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => void saveEdit(workout._id)}
                      // biome-ignore lint/a11y/noAutofocus: immediate inline editing on mobile tap
                      autoFocus
                      className="min-w-0 flex-1 border border-[var(--metro-border)] bg-[var(--metro-bg)] px-2.5 py-1 text-base text-[var(--metro-fg)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: accentColor }}
                      className="border border-[var(--metro-border)] px-2.5 py-1 text-xs font-medium lowercase text-white"
                    >
                      save
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditing(workout)}
                      className="min-w-0 flex-1 text-left text-base font-medium leading-snug text-[var(--metro-fg)] break-words"
                    >
                      {workout.name}
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          void moveWorkout({ id: workout._id, direction: "up" })
                        }
                        disabled={idx === 0}
                        aria-label="Move workout up"
                        className="metro-tile flex h-7 w-7 items-center justify-center border border-[var(--metro-border-subtle)] bg-[var(--metro-bg)] text-xs text-[var(--metro-fg)] disabled:opacity-25"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void moveWorkout({
                            id: workout._id,
                            direction: "down",
                          })
                        }
                        disabled={idx === workouts.length - 1}
                        aria-label="Move workout down"
                        className="metro-tile flex h-7 w-7 items-center justify-center border border-[var(--metro-border-subtle)] bg-[var(--metro-bg)] text-xs text-[var(--metro-fg)] disabled:opacity-25"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteWorkout({ id: workout._id })}
                        aria-label={`Delete ${workout.name}`}
                        className="metro-tile flex h-7 w-7 items-center justify-center border border-[var(--metro-border-subtle)] bg-[#E51400] text-xs font-bold text-white"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function EditScheduleCarouselScreen({
  user,
  initialDay,
  workouts,
  onBack,
}: EditScheduleCarouselScreenProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>(initialDay);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const initializedScrollRef = useRef(false);

  // Scroll to initialDay on mount without animation
  useEffect(() => {
    const container = carouselRef.current;
    if (!container || initializedScrollRef.current) return;
    const index = DAYS.findIndex((d) => d.id === initialDay);
    if (index >= 0) {
      container.scrollLeft = index * container.clientWidth;
    }
    initializedScrollRef.current = true;
  }, [initialDay]);

  const handleScroll = () => {
    const container = carouselRef.current;
    if (!container || container.clientWidth === 0) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    const clampedIndex = Math.max(0, Math.min(DAYS.length - 1, index));
    const nextDay = DAYS[clampedIndex]?.id;
    if (nextDay && nextDay !== activeDay) {
      setActiveDay(nextDay);
    }
  };

  const scrollToDay = (day: DayOfWeek) => {
    const container = carouselRef.current;
    if (!container) return;
    const index = DAYS.findIndex((d) => d.id === day);
    if (index >= 0) {
      setActiveDay(day);
      container.scrollTo({
        left: index * container.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const activeDayConfig = DAY_MAP[activeDay];

  return (
    <div className="metro-screen-enter flex h-dvh w-full max-w-md mx-auto flex-col pt-3.5 select-none">
      {/* Top Header: Back button + 'edit [monday]' dynamic block */}
      <header className="flex items-stretch gap-2.5 px-3.5 pb-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="metro-tile flex h-13 w-13 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-2xl font-light text-[var(--metro-fg)]"
        >
          ←
        </button>
        <div
          style={{ backgroundColor: activeDayConfig.metroColor }}
          className="flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] px-3 text-center transition-colors duration-200"
        >
          <h1 className="text-xl sm:text-2xl font-normal tracking-wide lowercase text-white">
            edit [{activeDayConfig.label}]
          </h1>
        </div>
      </header>

      {/* Metro Pivot Day Strip + Swipe Hint */}
      <div className="px-3.5 pb-3">
        <div className="grid grid-cols-6 gap-1.5">
          {DAYS.map((d) => {
            const isSelected = d.id === activeDay;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => scrollToDay(d.id)}
                style={{
                  backgroundColor: isSelected
                    ? d.metroColor
                    : "var(--metro-surface)",
                }}
                className={`metro-tile border py-1 text-center text-xs lowercase transition-colors ${
                  isSelected
                    ? "border-[var(--metro-border)] font-semibold text-white"
                    : "border-[var(--metro-border-subtle)] text-[var(--metro-fg-muted)]"
                }`}
              >
                {d.shortLabel}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] lowercase text-[var(--metro-fg-muted)]">
          <span>swipe left / right to switch days</span>
          <span>tap workout to rename</span>
        </div>
      </div>

      {/* Horizontal Scroll-Snap Carousel */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      >
        {DAYS.map((dayConfig) => {
          const dayWorkouts = (workouts ?? []).filter(
            (w) => w.day === dayConfig.id,
          );
          return (
            <DayScheduleSlide
              key={dayConfig.id}
              user={user}
              day={dayConfig.id}
              accentColor={dayConfig.metroColor}
              workouts={dayWorkouts}
            />
          );
        })}
      </div>
    </div>
  );
}
