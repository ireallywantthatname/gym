"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import {
  DAY_MAP,
  DAYS,
  type DayOfWeek,
  EDIT_TILE_COLORS,
  getCurrentDayOfWeek,
  type UserProfile,
} from "./constants";

interface HomeScreenProps {
  user: UserProfile;
  workouts: Doc<"workouts">[] | undefined;
  onSelectDay: (day: DayOfWeek) => void;
  onOpenScheduleEditor: () => void;
  onToggleTheme: () => void;
  onSwitchUser: () => void;
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
  onOpenScheduleEditor,
  onToggleTheme,
  onSwitchUser,
}: HomeScreenProps) {
  const [currentDay, setCurrentDay] = useState<DayOfWeek>("monday");
  const [turns, setTurns] = useState<Record<DayOfWeek, number>>(INITIAL_TURNS);
  const [backText, setBackText] =
    useState<Record<DayOfWeek, string>>(INITIAL_BACK_TEXT);
  const [flipTheme, setFlipTheme] = useState(false);
  const [flipUser, setFlipUser] = useState(false);

  const nextUser: UserProfile = user === "akash" ? "achini" : "akash";

  useEffect(() => {
    setCurrentDay(getCurrentDayOfWeek());
  }, []);

  const orderedDays = useMemo(() => {
    const todayConfig = DAY_MAP[currentDay];
    const remaining = DAYS.filter((d) => d.id !== currentDay);
    return [todayConfig, ...remaining];
  }, [currentDay]);

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

  const handleThemePress = () => {
    setFlipTheme(true);
    onToggleTheme();
    setTimeout(() => setFlipTheme(false), 320);
  };

  const handleUserPress = () => {
    setFlipUser(true);
    onSwitchUser();
    setTimeout(() => setFlipUser(false), 320);
  };

  return (
    <section
      aria-label="weekly workout schedule"
      className="min-h-dvh w-full max-w-md mx-auto px-3.5 pt-3.5 pb-4 select-none"
    >
      <nav aria-label="days and actions" className="grid grid-cols-2 gap-3">
        {orderedDays.map((day, idx) => {
          const isCurrentDay = day.id === currentDay;
          const tileColor = day.colors[user];
          const turnCount = turns[day.id];
          const exercisePreview = backText[day.id];

          return (
            <div
              key={day.id}
              style={{ "--metro-i": idx } as CSSProperties}
              className={`metro-item metro-live-scene aspect-square ${
                isCurrentDay ? "col-span-2" : "col-span-1"
              }`}
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
                    <span
                      className={`font-medium tracking-[-0.025em] lowercase text-white leading-[1.05] text-center text-balance ${
                        isCurrentDay
                          ? "text-[2.4rem] sm:text-[2.75rem]"
                          : "text-[1.65rem] sm:text-[1.85rem]"
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>

                  {/* Back Face: Random Workout from that Day */}
                  <div
                    style={{ backgroundColor: tileColor }}
                    aria-hidden="true"
                    className="metro-live-face metro-live-face-back flex items-center justify-center border-2 border-[var(--metro-border)] p-3.5"
                  >
                    <span
                      className={`break-words font-medium tracking-[-0.02em] leading-[1.15] lowercase text-white text-center text-balance tabular-nums ${
                        isCurrentDay
                          ? "line-clamp-5 text-[1.5rem] sm:text-[1.75rem]"
                          : "line-clamp-4 text-[1.15rem] sm:text-[1.3rem]"
                      }`}
                    >
                      {exercisePreview}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}

        {/* 2x2 Quarter-Tile Action Sub-Grid in the 6th Normal Slot */}
        <div className="col-span-1 grid aspect-square grid-cols-2 grid-rows-2 gap-3">
          {/* Quarter Tile 1: add schedule */}
          <button
            type="button"
            onClick={onOpenScheduleEditor}
            aria-label="add schedule"
            style={
              {
                backgroundColor: EDIT_TILE_COLORS.schedule,
                "--metro-i": 6,
              } as CSSProperties
            }
            className="metro-item metro-tile flex aspect-square h-full w-full items-center justify-center border-2 border-[var(--metro-border)] text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M3 10H21M8 3V6M16 3V6M12 13V18M9.5 15.5H14.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </button>

          {/* Quarter Tile 2: light/dark mode */}
          <button
            type="button"
            onClick={handleThemePress}
            aria-label="light/dark mode"
            style={
              {
                backgroundColor: EDIT_TILE_COLORS.theme,
                "--metro-i": 7,
              } as CSSProperties
            }
            className={`metro-item metro-tile flex aspect-square h-full w-full items-center justify-center border-2 border-[var(--metro-border)] text-white ${
              flipTheme ? "metro-tile-flip" : ""
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
            >
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7.1 7.1M16.9 16.9L18.7 18.7M18.7 5.3L16.9 7.1M7.1 16.9L5.3 18.7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </button>

          {/* Quarter Tile 3: food (disabled) */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="food"
            style={{ "--metro-i": 8 } as CSSProperties}
            className="metro-item flex aspect-square h-full w-full cursor-not-allowed items-center justify-center border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] text-[var(--metro-fg)] opacity-45"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
            >
              <path
                d="M6 3V10C6 11.6569 7.34315 13 9 13V21M9 3V9M12 3V10C12 11.6569 10.6569 13 9 13M17 3V14H19V21M17 3C15.3431 3 14 5.23858 14 8V12C14 13.1046 14.8954 14 16 14H17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </button>

          {/* Quarter Tile 4: switch user */}
          <button
            type="button"
            onClick={handleUserPress}
            aria-label={`login as ${nextUser}`}
            style={
              {
                backgroundColor:
                  nextUser === "achini"
                    ? EDIT_TILE_COLORS.achini
                    : EDIT_TILE_COLORS.akash,
                "--metro-i": 9,
              } as CSSProperties
            }
            className={`metro-item metro-tile flex aspect-square h-full w-full items-center justify-center border-2 border-[var(--metro-border)] text-white ${
              flipUser ? "metro-tile-flip" : ""
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </nav>
    </section>
  );
}
