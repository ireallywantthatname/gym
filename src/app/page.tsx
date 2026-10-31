"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import type {
  ScreenView,
  ThemeMode,
  UserProfile,
} from "@/components/gym/constants";
import { DayWorkoutScreen } from "@/components/gym/DayWorkoutScreen";
import {
  loadDevicePreferences,
  saveDevicePreferences,
} from "@/components/gym/db";
import { EditHubScreen } from "@/components/gym/EditHubScreen";
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
    void saveDevicePreferences({ user, theme: nextTheme });
  };

  const handleSwitchUser = () => {
    const nextUser: UserProfile = user === "akash" ? "achini" : "akash";
    setUser(nextUser);
    void saveDevicePreferences({ user: nextUser, theme });
  };

  const workouts = useQuery(api.workouts.listByUser, { user });

  return (
    <main
      data-transition={transition}
      className="metro-stage min-h-dvh w-full bg-[var(--metro-bg)] text-[var(--metro-fg)]"
    >
      {screen.type === "home" && (
        <HomeScreen
          onSelectDay={(day) =>
            navigateWithTurnstile({ type: "day", day }, "forward")
          }
          onOpenEditHub={() =>
            navigateWithTurnstile({ type: "editHub" }, "forward")
          }
        />
      )}

      {screen.type === "day" && (
        <DayWorkoutScreen
          day={screen.day}
          workouts={workouts}
          onBack={() => navigateWithTurnstile({ type: "home" }, "back")}
        />
      )}

      {screen.type === "editHub" && (
        <EditHubScreen
          user={user}
          onBack={() => navigateWithTurnstile({ type: "home" }, "back")}
          onOpenScheduleEditor={() =>
            navigateWithTurnstile(
              { type: "editSchedule", initialDay: "monday" },
              "forward",
            )
          }
          onToggleTheme={handleToggleTheme}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {screen.type === "editSchedule" && (
        <EditScheduleCarouselScreen
          user={user}
          initialDay={screen.initialDay}
          workouts={workouts}
          onBack={() => navigateWithTurnstile({ type: "editHub" }, "back")}
        />
      )}
    </main>
  );
}
