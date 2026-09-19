import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Logo } from "@/frontend/components/app/shell";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { studyStore } from "@/backend/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AI Study Companion" },
      { name: "description", content: "Sign in to your AI-powered learning workspace." },
      { property: "og:title", content: "Sign in — AI Study Companion" },
      { property: "og:description", content: "Sign in to your AI-powered learning workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="surface-card p-6">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Continue your learning journey where you left off.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              setLoading(true);
              setTimeout(() => {
                const name = email.split("@")[0] || "Learner";
                studyStore.login(name, email);
                toast.success(`Signed in as ${name}`);
                navigate({ to: "/app" });
              }, 500);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required defaultValue="yash@studycompanion.ai" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info("Password reset link sent (demo)")}
                >
                  Forgot password?
                </button>
              </div>
              <Input id="password" type="password" required defaultValue="demo-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Sign In
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              toast.success("Signed in with Google (demo)");
              navigate({ to: "/app" });
            }}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
