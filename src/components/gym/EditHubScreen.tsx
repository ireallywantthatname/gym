"use client";

import { type CSSProperties, useState } from "react";
import { EDIT_TILE_COLORS, type UserProfile } from "./constants";

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
  const [flipTheme, setFlipTheme] = useState(false);
  const [flipUser, setFlipUser] = useState(false);

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
      aria-label="edit settings"
      className="flex h-dvh w-full max-w-md mx-auto flex-col px-3.5 pt-3.5 pb-4 select-none"
    >
      {/* Top Header: Back button + 'edit' block */}
      <header
        style={{ "--metro-i": 0 } as CSSProperties}
        className="metro-item flex items-stretch gap-2.5 pb-4"
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="metro-tile flex h-13 w-13 shrink-0 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] text-[var(--metro-fg)] hover:bg-[var(--metro-surface-elevated)]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 -translate-x-[1px]"
          >
            <path
              d="M19 12H5M11 6L5 12L11 18"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="square"
            />
          </svg>
        </button>
        <div className="metro-tile flex flex-1 items-center justify-center border-2 border-[var(--metro-border)] bg-[var(--metro-surface)] px-4 text-center">
          <h1 className="text-2xl font-medium tracking-[-0.025em] lowercase text-[var(--metro-fg)] leading-none">
            edit
          </h1>
        </div>
      </header>

      {/* 2x2 Square Metro Tile Grid matching Screen 3 sketch */}
      <nav aria-label="edit actions" className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: add schedule */}
        <button
          type="button"
          onClick={onOpenScheduleEditor}
          style={
            {
              backgroundColor: EDIT_TILE_COLORS.schedule,
              "--metro-i": 1,
            } as CSSProperties
          }
          className="metro-item metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white"
        >
          <span className="text-[1.6rem] sm:text-[1.75rem] font-medium tracking-[-0.025em] leading-[1.1] lowercase text-balance">
            add
            <br />
            schedule
          </span>
        </button>

        {/* Tile 2: light/dark mode */}
        <button
          type="button"
          onClick={handleThemePress}
          style={
            {
              backgroundColor: EDIT_TILE_COLORS.theme,
              "--metro-i": 2,
            } as CSSProperties
          }
          className={`metro-item metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white ${
            flipTheme ? "metro-tile-flip" : ""
          }`}
        >
          <span className="text-[1.6rem] sm:text-[1.75rem] font-medium tracking-[-0.025em] leading-[1.1] lowercase text-balance">
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
          style={{ "--metro-i": 3 } as CSSProperties}
          className="metro-item flex aspect-square cursor-not-allowed items-center justify-center border-2 border-[var(--metro-border-subtle)] bg-[var(--metro-surface)] p-4 text-center opacity-45"
        >
          <span className="text-[1.6rem] sm:text-[1.75rem] font-medium tracking-[-0.025em] leading-[1.1] lowercase text-[var(--metro-fg)]">
            food
          </span>
        </button>

        {/* Tile 4: login as achini / akash */}
        <button
          type="button"
          onClick={handleUserPress}
          style={
            {
              backgroundColor:
                nextUser === "achini"
                  ? EDIT_TILE_COLORS.achini
                  : EDIT_TILE_COLORS.akash,
              "--metro-i": 4,
            } as CSSProperties
          }
          className={`metro-item metro-tile flex aspect-square items-center justify-center border-2 border-[var(--metro-border)] p-4 text-center text-white ${
            flipUser ? "metro-tile-flip" : ""
          }`}
        >
          <span className="text-[1.6rem] sm:text-[1.75rem] font-medium tracking-[-0.025em] leading-[1.1] lowercase text-balance">
            login as
            <br />
            {nextUser}
          </span>
        </button>
      </nav>
    </section>
  );
}
