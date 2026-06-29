"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className,
  id,
  "aria-label": ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "field-input flex w-full items-center justify-between gap-2 text-left",
          disabled && "cursor-not-allowed opacity-50",
        )}
        disabled={disabled}
        id={triggerId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        <span className={cn(!selected && "text-muted")}>
          {selected?.label ?? placeholder}
        </span>
        <CaretIcon className={cn("size-4 shrink-0 text-muted transition", open && "rotate-180")} />
      </button>

      {open ? (
        <ul
          aria-labelledby={triggerId}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-black/10 bg-surface py-1 shadow-lg ring-1 ring-black/5"
          id={listboxId}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value || "__empty__"} role="presentation">
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-brand/5",
                    isSelected && "bg-brand/10 font-medium text-brand",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  role="option"
                  type="button"
                >
                  <span>{option.label}</span>
                  {isSelected ? <CheckIcon className="size-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function CaretIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
