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
  | { type: "editHub" }
  | { type: "editSchedule"; initialDay: DayOfWeek };

export interface DayConfig {
  id: DayOfWeek;
  label: string;
  shortLabel: string;
  metroColor: string;
  metroSecondary: string;
}

export const DAYS: readonly DayConfig[] = [
  {
    id: "monday",
    label: "monday",
    shortLabel: "mon",
    metroColor: "#00ABA9", // Metro Teal
    metroSecondary: "#008280",
  },
  {
    id: "tuesday",
    label: "tuesday",
    shortLabel: "tue",
    metroColor: "#D80073", // Metro Magenta
    metroSecondary: "#A80059",
  },
  {
    id: "wednesday",
    label: "wednesday",
    shortLabel: "wed",
    metroColor: "#008A00", // Metro Emerald
    metroSecondary: "#006600",
  },
  {
    id: "thursday",
    label: "thursday",
    shortLabel: "thu",
    metroColor: "#FA6800", // Metro Orange
    metroSecondary: "#C75200",
  },
  {
    id: "friday",
    label: "friday",
    shortLabel: "fri",
    metroColor: "#6A00FF", // Metro Violet
    metroSecondary: "#5200C7",
  },
  {
    id: "saturday",
    label: "saturday",
    shortLabel: "sat",
    metroColor: "#1BA1E2", // Metro Cyan
    metroSecondary: "#1278AA",
  },
] as const;

export const DAY_MAP: Record<DayOfWeek, DayConfig> = {
  monday: DAYS[0],
  tuesday: DAYS[1],
  wednesday: DAYS[2],
  thursday: DAYS[3],
  friday: DAYS[4],
  saturday: DAYS[5],
};
