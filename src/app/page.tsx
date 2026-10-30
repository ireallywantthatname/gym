"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import type {
  DayOfWeek,
  ScreenView,
  ThemeMode,
  UserProfile,
} from "@/components/gym/constants";
import { DayWorkoutScreen } from "@/components/gym/DayWorkoutScreen";
import { EditHubScreen } from "@/components/gym/EditHubScreen";
import { EditScheduleCarouselScreen } from "@/components/gym/EditScheduleCarouselScreen";
import { HomeScreen } from "@/components/gym/HomeScreen";
import { api } from "../../convex/_generated/api";

const USER_STORAGE_KEY = "the-gymnasium:user";
const THEME_STORAGE_KEY = "the-gymnasium:theme";

export default function Home() {
  const [user, setUser] = useState<UserProfile>("akash");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [screen, setScreen] = useState<ScreenView>({ type: "home" });
  const [scheduleReturnScreen, setScheduleReturnScreen] = useState<ScreenView>({
    type: "editHub",
  });

  // Hydrate persisted user & theme from localStorage on client mount
  useEffect(() => {
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser === "akash" || savedUser === "achini") {
      setUser(savedUser);
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const handleSwitchUser = () => {
    const nextUser: UserProfile = user === "akash" ? "achini" : "akash";
    setUser(nextUser);
    window.localStorage.setItem(USER_STORAGE_KEY, nextUser);
  };

  // Single reactive query for the active user's entire weekly schedule
  const workouts = useQuery(api.workouts.listByUser, { user });

  const openScheduleEditor = (initialDay: DayOfWeek, returnTo: ScreenView) => {
    setScheduleReturnScreen(returnTo);
    setScreen({ type: "editSchedule", initialDay });
  };

  return (
    <main className="min-h-dvh w-full bg-[var(--metro-bg)] text-[var(--metro-fg)]">
      {screen.type === "home" && (
        <HomeScreen
          user={user}
          workouts={workouts}
          onSelectDay={(day) => setScreen({ type: "day", day })}
          onOpenEditHub={() => setScreen({ type: "editHub" })}
        />
      )}

      {screen.type === "day" && (
        <DayWorkoutScreen
          day={screen.day}
          workouts={workouts}
          onBack={() => setScreen({ type: "home" })}
          onEditDaySchedule={(day) =>
            openScheduleEditor(day, { type: "day", day })
          }
        />
      )}

      {screen.type === "editHub" && (
        <EditHubScreen
          user={user}
          theme={theme}
          onBack={() => setScreen({ type: "home" })}
          onOpenScheduleEditor={() =>
            openScheduleEditor("monday", { type: "editHub" })
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
          onBack={() => setScreen(scheduleReturnScreen)}
        />
      )}
    </main>
  );
}
