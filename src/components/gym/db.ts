import Dexie, { type EntityTable } from "dexie";
import type { ScheduleViewMode, ThemeMode, UserProfile } from "./constants";

export interface DevicePreferences {
  id: string;
  user: UserProfile;
  theme: ThemeMode;
  viewMode: ScheduleViewMode;
}

const DEVICE_PREFS_ID = "device";
const LEGACY_USER_KEY = "gym:user";
const LEGACY_THEME_KEY = "gym:theme";

class GymDatabase extends Dexie {
  preferences!: EntityTable<DevicePreferences, "id">;

  constructor() {
    super("gym-db");
    this.version(1).stores({
      preferences: "id",
    });
  }
}

export const db = new GymDatabase();

export async function loadDevicePreferences(): Promise<DevicePreferences> {
  const existing = await db.preferences.get(DEVICE_PREFS_ID);
  if (existing) {
    return {
      ...existing,
      viewMode: existing.viewMode === "carousel" ? "carousel" : "list",
    };
  }

  let initialUser: UserProfile = "akash";
  let initialTheme: ThemeMode = "dark";

  if (typeof window !== "undefined") {
    const savedUser = window.localStorage.getItem(LEGACY_USER_KEY);
    if (savedUser === "akash" || savedUser === "achini") {
      initialUser = savedUser;
    }
    const savedTheme = window.localStorage.getItem(LEGACY_THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      initialTheme = savedTheme;
    }
    window.localStorage.removeItem(LEGACY_USER_KEY);
    window.localStorage.removeItem(LEGACY_THEME_KEY);
  }

  const initial: DevicePreferences = {
    id: DEVICE_PREFS_ID,
    user: initialUser,
    theme: initialTheme,
    viewMode: "list",
  };

  await db.preferences.put(initial);
  return initial;
}

export async function saveDevicePreferences(
  prefs: Pick<DevicePreferences, "user" | "theme" | "viewMode">,
): Promise<void> {
  await db.preferences.put({
    id: DEVICE_PREFS_ID,
    user: prefs.user,
    theme: prefs.theme,
    viewMode: prefs.viewMode,
  });
}
