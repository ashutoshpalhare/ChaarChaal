/** Shared UI primitives: buttons, panels, toggles, modal and the ChaarChal logo. */

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ logo */

export function Logo({
  size = 44,
  className,
  showWord = true,
}: {
  size?: number;
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="ChaarChal logo"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="cc-frame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd88a" />
            <stop offset="55%" stopColor="#f0a92b" />
            <stop offset="100%" stopColor="#e0384f" />
          </linearGradient>
        </defs>
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          fill="url(#cc-frame)"
          opacity="0.16"
        />
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          fill="none"
          stroke="url(#cc-frame)"
          strokeWidth="1.6"
        />
        {/* four directions */}
        <path
          d="M24 7 L41 24 L24 41 L7 24 Z"
          fill="none"
          stroke="#f0a92b"
          strokeWidth="1.2"
          opacity="0.5"
        />
        {/* four tokens */}
        <circle cx="24" cy="13.5" r="4" fill="#e0384f" />
        <circle cx="34.5" cy="24" r="4" fill="#1f9e56" />
        <circle cx="24" cy="34.5" r="4" fill="#eda515" />
        <circle cx="13.5" cy="24" r="4" fill="#2a72d6" />
        {/* the die at the centre */}
        <rect
          x="19.5"
          y="19.5"
          width="9"
          height="9"
          rx="2.4"
          fill="#fdf8ee"
          stroke="#1b2033"
          strokeWidth="0.8"
        />
        <circle cx="24" cy="24" r="1.5" fill="#1b2033" />
      </svg>
      {showWord ? (
        <span className="leading-none">
          <span className="block font-display text-xl font-semibold tracking-tight text-cream">
            Chaar<span className="text-saffron">Chal</span>
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
            Four moves to glory
          </span>
        </span>
      ) : null}
    </span>
  );
}

/* ---------------------------------------------------------------- button */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  full?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  full,
  className,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 select-none";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-br from-saffron to-saffron-deep text-ink-900 font-semibold shadow-lg shadow-saffron/20 hover:brightness-110",
    secondary: "bg-white/8 text-cream border border-white/10 hover:bg-white/14",
    ghost: "text-white/70 hover:text-white hover:bg-white/8",
    danger: "bg-lotus/90 text-white hover:bg-lotus",
    outline: "border border-white/20 text-cream hover:bg-white/8",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], full && "w-full", className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ panel */

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return <Tag className={cn("panel rounded-2xl", className)}>{children}</Tag>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-saffron/15 text-saffron">
            {icon}
          </span>
        ) : null}
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron/80">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-xl font-semibold text-cream sm:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/60">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ----------------------------------------------------------------- toggle */

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl px-3 py-3 transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-white/5",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-cream">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{description}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-saffron/60 bg-saffron/80" : "border-white/15 bg-white/10",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4.5 rounded-full bg-white transition-all duration-200",
            checked ? "left-[22px]" : "left-0.5",
          )}
          style={{ width: 18, height: 18 }}
        />
      </button>
    </label>
  );
}

/* --------------------------------------------------------------- segmented */

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-black/25 p-1.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition-all",
              active
                ? "bg-saffron text-ink-900 shadow"
                : "text-white/60 hover:bg-white/8 hover:text-white",
            )}
          >
            <span className="block">{option.label}</span>
            {option.hint ? (
              <span className={cn("block text-[10px]", active ? "text-ink-900/70" : "text-white/35")}>
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel pop-in relative z-10 w-full max-w-md rounded-2xl p-5 outline-none"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id={titleId} className="font-display text-lg font-semibold text-cream">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="text-sm leading-relaxed text-white/70">{children}</div>
        {footer ? <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ misc. */

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel-quiet rounded-xl p-3.5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/45">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold text-cream">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-white/40">{hint}</p> : null}
    </div>
  );
}

export function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "danger" | "success";
}) {
  const tones = {
    neutral: "bg-white/8 text-white/70 border-white/10",
    gold: "bg-saffron/15 text-saffron border-saffron/30",
    danger: "bg-lotus/15 text-lotus border-lotus/30",
    success: "bg-leaf/15 text-leaf border-leaf/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="panel-quiet rounded-2xl p-8 text-center">
      <p className="font-display text-base font-medium text-cream">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------- brand icon */

export function GithubIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}
