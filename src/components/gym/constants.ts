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
    metroColor: "#128C8C", // Desaturated Metro Teal
    metroSecondary: "#0D6B6B",
  },
  {
    id: "tuesday",
    label: "tuesday",
    shortLabel: "tue",
    metroColor: "#B8256E", // Desaturated Metro Magenta
    metroSecondary: "#8F1B54",
  },
  {
    id: "wednesday",
    label: "wednesday",
    shortLabel: "wed",
    metroColor: "#1E7E48", // Desaturated Metro Emerald
    metroSecondary: "#155E35",
  },
  {
    id: "thursday",
    label: "thursday",
    shortLabel: "thu",
    metroColor: "#D45D18", // Desaturated Metro Orange
    metroSecondary: "#A64710",
  },
  {
    id: "friday",
    label: "friday",
    shortLabel: "fri",
    metroColor: "#5E35B8", // Desaturated Metro Violet
    metroSecondary: "#47268F",
  },
  {
    id: "saturday",
    label: "saturday",
    shortLabel: "sat",
    metroColor: "#1E7FB8", // Desaturated Metro Cyan
    metroSecondary: "#155F8A",
  },
] as const;

export const EDIT_TILE_COLORS = {
  schedule: "#128C8C",
  theme: "#D45D18",
  achini: "#B8256E",
  akash: "#5E35B8",
} as const;

export const DAY_MAP: Record<DayOfWeek, DayConfig> = {
  monday: DAYS[0],
  tuesday: DAYS[1],
  wednesday: DAYS[2],
  thursday: DAYS[3],
  friday: DAYS[4],
  saturday: DAYS[5],
};
