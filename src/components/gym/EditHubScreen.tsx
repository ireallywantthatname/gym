"use client";

import type { ThemeMode, UserProfile } from "./constants";

interface EditHubScreenProps {
  user: UserProfile;
  theme: ThemeMode;
  onBack: () => void;
  onOpenScheduleEditor: () => void;
  onToggleTheme: () => void;
  onSwitchUser: () => void;
}

export function EditHubScreen({
  user,
  theme,
  onBack,
  onOpenScheduleEditor,
  onToggleTheme,
  onSwitchUser,
}: EditHubScreenProps) {
  const nextUser: UserProfile = user === "akash" ? "achini" : "akash";

  return (
    <div className="metro-screen-enter flex h-dvh w-full max-w-md mx-auto flex-col p-3.5 select-none">
      {/* Top Header: Back button + 'edit' block */}
      <header className="flex items-stretch gap-2.5 pb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="metro-tile flex h-13 w-13 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-2xl font-light text-[var(--metro-fg)]"
        >
          ←
        </button>
        <div className="flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] px-4 text-center">
          <h1 className="text-2xl font-normal tracking-wide lowercase text-[var(--metro-fg)]">
            edit
          </h1>
        </div>
      </header>

      {/* 2x2 Metro Tile Grid matching Screen 3 sketch */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: add schedule */}
        <button
          type="button"
          onClick={onOpenScheduleEditor}
          style={{ backgroundColor: "#00ABA9" }}
          className="metro-tile relative flex aspect-square flex-col items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-2xl font-normal leading-snug lowercase">
            add
            <br />
            schedule
          </span>
          <span className="absolute bottom-2.5 left-3 text-[11px] font-light tracking-wide text-white/80 lowercase">
            update days
          </span>
        </button>

        {/* Tile 2: light/dark mode */}
        <button
          type="button"
          onClick={onToggleTheme}
          style={{ backgroundColor: "#FA6800" }}
          className="metro-tile relative flex aspect-square flex-col items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-2xl font-normal leading-snug lowercase">
            light/dark
            <br />
            mode
          </span>
          <span className="absolute bottom-2.5 left-3 text-[11px] font-light tracking-wide text-white/85 lowercase">
            current: {theme}
          </span>
        </button>

        {/* Tile 3: food (inactive as requested) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="relative flex aspect-square cursor-not-allowed flex-col items-center justify-center border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] p-4 text-center opacity-45"
        >
          <span className="text-2xl font-normal leading-snug lowercase text-[var(--metro-fg)]">
            food
          </span>
          <span className="absolute bottom-2.5 left-3 text-[11px] font-light tracking-wide text-[var(--metro-fg-muted)] lowercase">
            coming soon
          </span>
        </button>

        {/* Tile 4: login as achini / akash */}
        <button
          type="button"
          onClick={onSwitchUser}
          style={{
            backgroundColor: nextUser === "achini" ? "#D80073" : "#6A00FF",
          }}
          className="metro-tile relative flex aspect-square flex-col items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-2xl font-normal leading-snug lowercase">
            login as
            <br />
            {nextUser}
          </span>
          <span className="absolute bottom-2.5 left-3 text-[11px] font-light tracking-wide text-white/85 lowercase">
            now: {user}
          </span>
        </button>
      </div>

      {/* Bottom Metro status info */}
      <div className="mt-auto border-t border-[var(--metro-border-subtle)] pt-3 flex items-center justify-between text-xs lowercase text-[var(--metro-fg-muted)]">
        <span>signed in as {user}</span>
        <span>{theme} theme</span>
      </div>
    </div>
  );
}
