"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { DAY_MAP, DAYS, type DayOfWeek, type UserProfile } from "./constants";

const WORKOUT_SLOTS = [0, 1, 2, 3, 4, 5, 6] as const;

interface EditScheduleCarouselScreenProps {
  user: UserProfile;
  initialDay: DayOfWeek;
  workouts: Doc<"workouts">[] | undefined;
  onBack: () => void;
}

interface WorkoutSlotBlockProps {
  user: UserProfile;
  day: DayOfWeek;
  slot: number;
  initialName: string;
}

function WorkoutSlotBlock({
  user,
  day,
  slot,
  initialName,
}: WorkoutSlotBlockProps) {
  const upsertWorkoutSlot = useMutation(api.workouts.upsertWorkoutSlot);
  const [name, setName] = useState(initialName);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedNameRef = useRef(initialName);

  useEffect(() => {
    if (initialName !== lastSyncedNameRef.current) {
      setName(initialName);
      lastSyncedNameRef.current = initialName;
    }
  }, [initialName]);

  const persistSlot = async (nextName: string) => {
    if (nextName === lastSyncedNameRef.current) {
      return;
    }
    try {
      await upsertWorkoutSlot({
        user,
        day,
        slot,
        name: nextName,
      });
      lastSyncedNameRef.current = nextName;
    } catch {
      // Ignore transient errors; next keystroke or blur will retry
    }
  };

  const handleChange = (value: string) => {
    setName(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void persistSlot(value);
    }, 300);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    void persistSlot(name);
  };

  return (
    <div className="flex flex-1 items-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] px-3.5">
      <input
        type="text"
        value={name}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        aria-label={`${day} workout ${slot + 1}`}
        className="h-full w-full bg-transparent text-base sm:text-lg font-normal text-[var(--metro-fg)] focus:outline-none"
      />
    </div>
  );
}

interface DayScheduleSlideProps {
  user: UserProfile;
  day: DayOfWeek;
  workouts: Doc<"workouts">[];
}

function DayScheduleSlide({ user, day, workouts }: DayScheduleSlideProps) {
  return (
    <div className="flex h-full w-full shrink-0 snap-center flex-col gap-2.5 px-3.5 pb-3.5">
      {WORKOUT_SLOTS.map((slot) => {
        const existing = workouts.find((w) => w.order === slot);
        return (
          <WorkoutSlotBlock
            key={`${user}-${day}-${slot}`}
            user={user}
            day={day}
            slot={slot}
            initialName={existing?.name ?? ""}
          />
        );
      })}
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

  const activeDayConfig = DAY_MAP[activeDay];

  return (
    <div className="metro-screen-enter flex h-dvh w-full max-w-md mx-auto flex-col pt-3.5 select-none">
      {/* Top Header: Back button + 'edit [monday]' dynamic block */}
      <header className="flex items-stretch gap-2.5 px-3.5 pb-3.5">
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

      {/* Horizontal Scroll-Snap Carousel with 7 fixed workout blocks per day */}
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
              workouts={dayWorkouts}
            />
          );
        })}
      </div>
    </div>
  );
}
