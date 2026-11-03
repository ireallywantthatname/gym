"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import {
  getCurrentDayOfWeek,
  type ScheduleViewMode,
  type ScreenView,
  type ThemeMode,
  type UserProfile,
} from "@/components/gym/constants";
import { DayWorkoutScreen } from "@/components/gym/DayWorkoutScreen";
import {
  loadDevicePreferences,
  saveDevicePreferences,
} from "@/components/gym/db";
import { EditScheduleCarouselScreen } from "@/components/gym/EditScheduleCarouselScreen";
import { HomeScreen } from "@/components/gym/HomeScreen";
import { api } from "../../convex/_generated/api";

type TurnstileTransition =
  | "forward-in"
  | "forward-out"
  | "back-in"
  | "back-out";

export default function Home() {
  const [user, setUser] = useState<UserProfile>("akash");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("list");
  const [screen, setScreen] = useState<ScreenView>({ type: "home" });
  const [transition, setTransition] =
    useState<TurnstileTransition>("forward-in");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    void loadDevicePreferences().then((prefs) => {
      if (!active) return;
      setUser(prefs.user);
      setTheme(prefs.theme);
      setViewMode(prefs.viewMode);
      document.documentElement.setAttribute("data-theme", prefs.theme);
    });
    return () => {
      active = false;
    };
  }, []);

  const navigateWithTurnstile = (
    nextScreen: ScreenView,
    direction: "forward" | "back",
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setTransition(direction === "forward" ? "forward-out" : "back-out");
    timerRef.current = setTimeout(() => {
      setScreen(nextScreen);
      setTransition(direction === "forward" ? "forward-in" : "back-in");
    }, 150);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    void saveDevicePreferences({ user, theme: nextTheme, viewMode });
  };

  const handleSwitchUser = () => {
    const nextUser: UserProfile = user === "akash" ? "achini" : "akash";
    setUser(nextUser);
    void saveDevicePreferences({ user: nextUser, theme, viewMode });
  };

  const handleToggleViewMode = () => {
    const nextViewMode: ScheduleViewMode =
      viewMode === "list" ? "carousel" : "list";
    setViewMode(nextViewMode);
    void saveDevicePreferences({ user, theme, viewMode: nextViewMode });
  };

  const workouts = useQuery(api.workouts.listByUser, { user });

  return (
    <main
      data-transition={transition}
      className="metro-stage min-h-dvh w-full bg-[var(--metro-bg)] text-[var(--metro-fg)]"
    >
      {screen.type === "home" && (
        <HomeScreen
          user={user}
          workouts={workouts}
          onSelectDay={(day) =>
            navigateWithTurnstile({ type: "day", day }, "forward")
          }
          onOpenScheduleEditor={() =>
            navigateWithTurnstile(
              {
                type: "editSchedule",
                initialDay: getCurrentDayOfWeek(),
                returnTo: { type: "home" },
              },
              "forward",
            )
          }
          onToggleTheme={handleToggleTheme}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {screen.type === "day" && (
        <DayWorkoutScreen
          user={user}
          day={screen.day}
          workouts={workouts}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          onEditDay={() =>
            navigateWithTurnstile(
              {
                type: "editSchedule",
                initialDay: screen.day,
                returnTo: { type: "day", day: screen.day },
              },
              "forward",
            )
          }
          onBack={() => navigateWithTurnstile({ type: "home" }, "back")}
        />
      )}

      {screen.type === "editSchedule" && (
        <EditScheduleCarouselScreen
          user={user}
          initialDay={screen.initialDay}
          workouts={workouts}
          onBack={() =>
            navigateWithTurnstile(screen.returnTo ?? { type: "home" }, "back")
          }
        />
      )}
    </main>
  );
}
