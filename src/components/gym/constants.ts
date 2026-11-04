export type UserProfile = "akash" | "achini";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type ThemeMode = "dark" | "light";

export type ScreenView =
  | { type: "home" }
  | { type: "day"; day: DayOfWeek }
  | {
      type: "editSchedule";
      initialDay: DayOfWeek;
      returnTo?: { type: "home" } | { type: "day"; day: DayOfWeek };
    };

export interface DayConfig {
  id: DayOfWeek;
  label: string;
  shortLabel: string;
  colors: Record<UserProfile, string>;
}

export const DAYS: readonly DayConfig[] = [
  {
    id: "monday",
    label: "monday",
    shortLabel: "mon",
    colors: {
      akash: "#1B5E91",
      achini: "#B8256E",
    },
  },
  {
    id: "tuesday",
    label: "tuesday",
    shortLabel: "tue",
    colors: {
      akash: "#128C8C",
      achini: "#C43E2F",
    },
  },
  {
    id: "wednesday",
    label: "wednesday",
    shortLabel: "wed",
    colors: {
      akash: "#1E7E48",
      achini: "#D45D18",
    },
  },
  {
    id: "thursday",
    label: "thursday",
    shortLabel: "thu",
    colors: {
      akash: "#3B4990",
      achini: "#8E287A",
    },
  },
  {
    id: "friday",
    label: "friday",
    shortLabel: "fri",
    colors: {
      akash: "#4A607A",
      achini: "#B5651D",
    },
  },
  {
    id: "saturday",
    label: "saturday",
    shortLabel: "sat",
    colors: {
      akash: "#0E7C61",
      achini: "#A82450",
    },
  },
] as const;

export const EDIT_TILE_COLORS = {
  schedule: "#128C8C",
  theme: "#D45D18",
  achini: "#B8256E",
  akash: "#1B5E91",
} as const;

export const DAY_MAP: Record<DayOfWeek, DayConfig> = {
  monday: DAYS[0],
  tuesday: DAYS[1],
  wednesday: DAYS[2],
  thursday: DAYS[3],
  friday: DAYS[4],
  saturday: DAYS[5],
};

const JS_DAY_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  0: "monday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export function getCurrentDayOfWeek(): DayOfWeek {
  return JS_DAY_TO_DAY_OF_WEEK[new Date().getDay()] ?? "monday";
}

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
