import { cn } from "@/backend/lib/utils";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb ? (
          <p className="mb-1.5 truncate text-xs font-medium text-muted-foreground">{breadcrumb}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "primary";
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              tone === "primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  ready: "bg-success/10 text-success border-success/20",
  operational: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  success: "bg-success/10 text-success border-success/20",
  active: "bg-success/10 text-success border-success/20",
  improving: "bg-success/10 text-success border-success/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  running: "bg-primary/10 text-primary border-primary/20",
  stable: "bg-primary/10 text-primary border-primary/20",
  queued: "bg-muted text-muted-foreground border-border",
  idle: "bg-muted text-muted-foreground border-border",
  retrying: "bg-warning/15 text-warning-foreground border-warning/30",
  degraded: "bg-warning/15 text-warning-foreground border-warning/30",
  slow: "bg-warning/15 text-warning-foreground border-warning/30",
  attention: "bg-warning/15 text-warning-foreground border-warning/30",
  "needs attention": "bg-warning/15 text-warning-foreground border-warning/30",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  unavailable: "bg-destructive/10 text-destructive border-destructive/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[key] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {key === "processing" || key === "running" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : key === "failed" || key === "unavailable" ? (
        <AlertTriangle className="size-3" />
      ) : key === "queued" ? (
        <Clock className="size-3" />
      ) : key === "ready" || key === "completed" || key === "operational" ? (
        <CheckCircle2 className="size-3" />
      ) : null}
      {status}
    </span>
  );
}

export function TrendPill({ trend }: { trend: "improving" | "stable" | "attention" }) {
  const map = {
    improving: { label: "Improving", Icon: TrendingUp },
    stable: { label: "Stable", Icon: Minus },
    attention: { label: "Needs attention", Icon: TrendingDown },
  } as const;
  const { label, Icon } = map[trend];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[trend],
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full brand-gradient transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 160,
  label = "Overall progress",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-muted"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="url(#ringGradient)"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.54 0.19 268)" />
              <stop offset="100%" stopColor="oklch(0.58 0.2 305)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold">{value}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FileText,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="surface-card flex flex-col items-start gap-2 border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="size-4" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface-card space-y-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EvidenceNote({ children, note }: { children?: React.ReactNode; note?: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />
      <span>{note || children}</span>
    </p>
  );
}
