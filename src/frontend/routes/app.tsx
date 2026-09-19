import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/app/shell";
import { Toaster } from "@/frontend/components/ui/sonner";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </AppShell>
  );
}
