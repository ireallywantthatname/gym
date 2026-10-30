"use client";

import type { UserProfile } from "./constants";

interface EditHubScreenProps {
  user: UserProfile;
  onBack: () => void;
  onOpenScheduleEditor: () => void;
  onToggleTheme: () => void;
  onSwitchUser: () => void;
}

export function EditHubScreen({
  user,
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
          className="metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-2xl font-normal leading-snug lowercase">
            add
            <br />
            schedule
          </span>
        </button>

        {/* Tile 2: light/dark mode */}
        <button
          type="button"
          onClick={onToggleTheme}
          style={{ backgroundColor: "#FA6800" }}
          className="metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-2xl font-normal leading-snug lowercase">
            light/dark
            <br />
            mode
          </span>
        </button>

        {/* Tile 3: food (inactive as requested) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex aspect-square cursor-not-allowed items-center justify-center border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] p-4 text-center opacity-45"
        >
          <span className="text-2xl font-normal leading-snug lowercase text-[var(--metro-fg)]">
            food
          </span>
        </button>

        {/* Tile 4: login as achini / akash */}
        <button
          type="button"
          onClick={onSwitchUser}
          style={{
            backgroundColor: nextUser === "achini" ? "#D80073" : "#6A00FF",
          }}
          className="metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-2xl font-normal leading-snug lowercase">
            login as
            <br />
            {nextUser}
          </span>
        </button>
      </div>
    </div>
  );
}
