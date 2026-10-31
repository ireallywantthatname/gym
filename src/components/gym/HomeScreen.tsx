"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { DAYS, type DayOfWeek, type UserProfile } from "./constants";

interface HomeScreenProps {
  user: UserProfile;
  workouts: Doc<"workouts">[] | undefined;
  onSelectDay: (day: DayOfWeek) => void;
  onOpenEditHub: () => void;
}

const INITIAL_TURNS: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 0,
  wednesday: 0,
  thursday: 0,
  friday: 0,
  saturday: 0,
};

const INITIAL_BACK_TEXT: Record<DayOfWeek, string> = {
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
};

function randomBetween(minMs: number, maxMs: number): number {
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

export function HomeScreen({
  user,
  workouts,
  onSelectDay,
  onOpenEditHub,
}: HomeScreenProps) {
  const [turns, setTurns] = useState<Record<DayOfWeek, number>>(INITIAL_TURNS);
  const [backText, setBackText] =
    useState<Record<DayOfWeek, string>>(INITIAL_BACK_TEXT);

  const workoutsByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, string[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    };
    for (const workout of workouts ?? []) {
      const trimmed = workout.name.trim();
      if (trimmed) {
        grouped[workout.day].push(trimmed);
      }
    }
    return grouped;
  }, [workouts]);

  const workoutsByDayRef = useRef(workoutsByDay);
  workoutsByDayRef.current = workoutsByDay;

  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  const backTextRef = useRef(backText);
  backTextRef.current = backText;

  // Reset all tiles to front face when switching user profile
  useEffect(() => {
    void user;
    setTurns(INITIAL_TURNS);
    setBackText(INITIAL_BACK_TEXT);
  }, [user]);

  // Windows Phone Start Screen random live-tile flip choreography
  useEffect(() => {
    let schedulerTimer: ReturnType<typeof setTimeout> | null = null;
    const flipBackTimers = new Map<DayOfWeek, ReturnType<typeof setTimeout>>();

    const scheduleNextFlip = (delayMs: number) => {
      schedulerTimer = setTimeout(() => {
        const currentWorkouts = workoutsByDayRef.current;
        const currentTurns = turnsRef.current;

        const currentlyFlippedCount = DAYS.filter(
          (d) => currentTurns[d.id] % 2 === 1,
        ).length;

        const eligibleDays = DAYS.map((d) => d.id).filter(
          (dayId) =>
            currentWorkouts[dayId].length > 0 && currentTurns[dayId] % 2 === 0,
        );

        if (eligibleDays.length > 0 && currentlyFlippedCount < 2) {
          const targetDay =
            eligibleDays[Math.floor(Math.random() * eligibleDays.length)];
          const dayExercises = currentWorkouts[targetDay];
          const previousText = backTextRef.current[targetDay];

          const candidates =
            dayExercises.length > 1
              ? dayExercises.filter((name) => name !== previousText)
              : dayExercises;

          const pickedExercise =
            candidates[Math.floor(Math.random() * candidates.length)] ??
            dayExercises[0];

          setBackText((prev) => ({
            ...prev,
            [targetDay]: pickedExercise,
          }));

          setTurns((prev) => ({
            ...prev,
            [targetDay]: prev[targetDay] + 1,
          }));

          const existingReturn = flipBackTimers.get(targetDay);
          if (existingReturn) {
            clearTimeout(existingReturn);
          }

          const returnTimer = setTimeout(
            () => {
              flipBackTimers.delete(targetDay);
              setTurns((prev) => {
                if (prev[targetDay] % 2 === 1) {
                  return {
                    ...prev,
                    [targetDay]: prev[targetDay] + 1,
                  };
                }
                return prev;
              });
            },
            randomBetween(3600, 5200),
          );

          flipBackTimers.set(targetDay, returnTimer);
        }

        scheduleNextFlip(randomBetween(2200, 3800));
      }, delayMs);
    };

    scheduleNextFlip(1400);

    return () => {
      if (schedulerTimer) {
        clearTimeout(schedulerTimer);
      }
      for (const timer of flipBackTimers.values()) {
        clearTimeout(timer);
      }
      flipBackTimers.clear();
    };
  }, []);

  return (
    <section
      aria-label="weekly workout schedule"
      className="flex min-h-dvh w-full max-w-md mx-auto flex-col justify-center px-3.5 pt-3.5 pb-4 select-none"
    >
      <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-6.25rem)*2/3))]">
        {/* 2x3 Square Metro Live Tile Grid for Monday - Saturday */}
        <nav aria-label="days of the week" className="grid grid-cols-2 gap-3">
          {DAYS.map((day, idx) => {
            const tileColor = day.colors[user];
            const turnCount = turns[day.id];
            const exercisePreview = backText[day.id];

            return (
              <div
                key={day.id}
                style={{ "--metro-i": idx } as CSSProperties}
                className="metro-item metro-live-scene aspect-square"
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(day.id)}
                  aria-label={day.label}
                  className="metro-live-button relative block h-full w-full text-white"
                >
                  <div
                    style={{ "--flip-turn": turnCount } as CSSProperties}
                    className="metro-live-card"
                  >
                    {/* Front Face: Day Name */}
                    <div
                      style={{ backgroundColor: tileColor }}
                      className="metro-live-face metro-live-face-front flex items-center justify-center border-2 border-[var(--metro-border)] p-4"
                    >
                      <span className="text-[1.65rem] sm:text-[1.85rem] font-medium tracking-[-0.025em] lowercase text-white leading-[1.05] text-center text-balance">
                        {day.label}
                      </span>
                    </div>

                    {/* Back Face: Random Workout from that Day */}
                    <div
                      style={{ backgroundColor: tileColor }}
                      aria-hidden="true"
                      className="metro-live-face metro-live-face-back flex items-center justify-center border-2 border-[var(--metro-border)] p-3.5"
                    >
                      <span className="line-clamp-4 break-words text-[1.15rem] sm:text-[1.3rem] font-medium tracking-[-0.02em] leading-[1.15] lowercase text-white text-center text-balance tabular-nums">
                        {exercisePreview}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
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
