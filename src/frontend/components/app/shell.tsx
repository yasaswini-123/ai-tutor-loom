import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  CircleHelp,
  FolderKanban,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
  Bell,
  FileText,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { studyStore, useStudyStore } from "@/backend/lib/store";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/frontend/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/frontend/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/frontend/components/ui/command";
import { cn } from "@/backend/lib/utils";
import {
  currentUser,
  getProject,
  notifications,
  projects,
  spaces,
  materials,
} from "@/backend/lib/demo-data";

const mainNav = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/spaces", label: "Spaces", icon: FolderKanban },
  { to: "/app/analytics", label: "Global Analytics", icon: BarChart3 },
  { to: "/app/activity", label: "Activity", icon: Activity },
];

const projectNav = [
  { slug: "", label: "Overview", icon: LayoutDashboard },
  { slug: "materials", label: "Materials", icon: FileText },
  { slug: "knowledge", label: "Knowledge", icon: BookOpen },
  { slug: "tutor", label: "AI Tutor", icon: MessageSquare },
  { slug: "quiz", label: "Quiz", icon: ListChecks },
  { slug: "mastery", label: "Mastery", icon: Brain },
  { slug: "growth", label: "Growth", icon: LineChart },
  { slug: "analytics", label: "Analytics", icon: BarChart3 },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      {!compact ? (
        <span className="font-display text-[15px] leading-tight font-semibold">
          AI Study
          <span className="block text-xs font-normal text-muted-foreground">Companion</span>
        </span>
      ) : null}
    </Link>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const store = useStudyStore();
  const { pathname } = useLocation();
  const match = pathname.match(/\/app\/projects\/([^/]+)(?:\/([^/]+))?/);
  const projectId = match?.[1];
  const projectTab = match?.[2] ?? "";
  const project = projectId ? (store.projects.find((p) => p.id === projectId) || getProject(projectId)) : undefined;
  const user = store.user || currentUser;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="space-y-1">
        {mainNav.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            active={item.exact ? pathname === item.to : pathname.startsWith(item.to)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {project ? (
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Current project
          </p>
          <div className="mx-1 mb-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <p className="truncate text-sm font-medium">{project.name}</p>
            <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
          </div>
          <nav className="space-y-1">
            {projectNav.map((item) => (
              <NavItem
                key={item.label}
                to={`/app/projects/${project.id}${item.slug ? `/${item.slug}` : ""}`}
                label={item.label}
                icon={item.icon}
                active={projectTab === item.slug}
                onClick={onNavigate}
              />
            ))}
          </nav>
        </div>
      ) : null}

      <div className="mt-auto space-y-1 border-t border-border pt-4">
        {user.role === "admin" ? (
          <NavItem
            to="/admin"
            label="Admin Dashboard"
            icon={Shield}
            active={pathname.startsWith("/admin")}
            onClick={onNavigate}
          />
        ) : null}
        <NavItem to="/app/settings" label="Settings" icon={Settings} active={pathname === "/app/settings"} onClick={onNavigate} />
        <NavItem to="/app/help" label="Help" icon={CircleHelp} active={pathname === "/app/help"} onClick={onNavigate} />

        {/* Data Mode & Clean Slate Controller */}
        <div className="pt-2 pb-1">
          <button
            type="button"
            onClick={() => {
              const nextMode = store.dataMode === "demo" ? "live" : "demo";
              studyStore.setDataMode(nextMode);
            }}
            className={cn(
              "w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors",
              store.dataMode === "live"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-muted/60 text-muted-foreground border-border hover:text-foreground hover:bg-muted",
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              <RotateCcw className="size-3 shrink-0" />
              <span>{store.dataMode === "live" ? "Live (0% Baseline)" : "Demo Mode"}</span>
            </span>
            <span className="text-[10px] font-semibold underline underline-offset-2 shrink-0">
              {store.dataMode === "live" ? "Reset" : "Start 0%"}
            </span>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-muted/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              studyStore.logout();
              window.location.href = "/login";
            }}
            title="Sign out"
            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search className="size-4" />
        <span>Search spaces, projects, materials…</span>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search across your workspace…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Spaces">
            {spaces.map((s) => (
              <CommandItem key={s.id} value={`space ${s.name}`} onSelect={() => setOpen(false)} asChild>
                <Link to="/app/spaces/$spaceId" params={{ spaceId: s.id }}>
                  <FolderKanban className="size-4" /> {s.name}
                  <span className="ml-auto text-xs text-muted-foreground">Space</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => setOpen(false)} asChild>
                <Link to="/app/projects/$projectId" params={{ projectId: p.id }}>
                  <BookOpen className="size-4" /> {p.name}
                  <span className="ml-auto text-xs text-muted-foreground">Project</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Materials">
            {materials.map((m) => (
              <CommandItem key={m.id} value={`material ${m.name}`} onSelect={() => setOpen(false)} asChild>
                <Link to="/app/projects/$projectId/materials" params={{ projectId: m.projectId }}>
                  <FileText className="size-4" /> {m.name}
                  <span className="ml-auto text-xs text-muted-foreground">Material</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Concepts">
            {["Gradient Descent", "Neural Networks", "Overfitting", "Decision Trees"].map((c) => (
              <CommandItem key={c} value={`concept ${c}`} onSelect={() => setOpen(false)} asChild>
                <Link to="/app/projects/$projectId/mastery" params={{ projectId: "ml-fundamentals" }}>
                  <Sparkles className="size-4" /> {c}
                  <span className="ml-auto text-xs text-muted-foreground">Concept</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function NotificationPanel() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            5
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
        </div>
        <ul className="max-h-80 divide-y divide-border overflow-y-auto">
          {notifications.map((n) => (
            <li key={n.id} className="flex gap-3 px-4 py-3">
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.tone === "success"
                    ? "bg-success"
                    : n.tone === "error"
                      ? "bg-destructive"
                      : "bg-primary",
                )}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">{n.detail}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="hidden flex-1 sm:block">
            <GlobalSearch />
          </div>
          <div className="flex-1 sm:hidden" />

          <NotificationPanel />
          <Link
            to="/app/projects/$projectId/tutor"
            params={{ projectId: "ml-fundamentals" }}
            className="hidden sm:block"
          >
            <Button size="sm">
              <Sparkles className="size-4" /> Ask Tutor
            </Button>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <span className="flex items-center gap-1">
      {parts.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="size-3" /> : null}
          {p}
        </span>
      ))}
    </span>
  );
}
