import { useEffect, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { MobileQuickActions } from "@/components/mobile-quick-actions";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import { AlertTriangle, ArrowRight } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, role } = useAuth();
  const sub = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
    if (!loading && user && role === "student") navigate({ to: "/portal", replace: true });
  }, [user, loading, role, navigate]);

  if (loading || sub.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Subscription expired — full gate
  if (sub.isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">Trial ended</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Your 7-day free trial has ended. Subscribe to continue using TutorDash.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            View Plans <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Already paid? WhatsApp us and we'll activate your plan within 2 hours.
          </p>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  const showTrialBanner = sub.plan === "trial" && sub.daysLeft !== null && sub.daysLeft <= 3;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Trial expiry banner */}
          {showTrialBanner && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-amber-800 font-medium">
                {sub.daysLeft === 0
                  ? "Your trial expires today."
                  : `Your trial ends in ${sub.daysLeft} day${sub.daysLeft !== 1 ? "s" : ""}.`}
              </span>
              <Link to="/pricing" className="text-amber-800 underline underline-offset-2 hover:text-amber-900 whitespace-nowrap font-semibold flex items-center gap-1">
                Subscribe now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
          <header className="h-14 flex items-center border-b bg-background px-4 sticky top-0 z-10 gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="w-px h-5 bg-border" />
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground select-none">
              TutorDash
            </span>
          </header>
          <main className="flex-1 p-6 overflow-x-auto">{children}</main>
        </div>
      </div>
      <MobileQuickActions />
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        {eyebrow && <p className="zp-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
