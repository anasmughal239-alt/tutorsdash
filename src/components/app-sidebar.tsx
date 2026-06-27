import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  FolderOpen,
  Zap,
  LogOut,
  School,
  BookMarked,
  ListChecks,
  FileText,
  PackageOpen,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useMode } from "@/lib/mode";
import { useSubscription } from "@/lib/subscription";
import { toast } from "sonner";

const tutorGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Workspace",
    items: [
      { title: "Modules", url: "/modules", icon: BookOpen },
      { title: "Students", url: "/students", icon: Users },
    ],
  },
  {
    label: "Daily",
    items: [
      { title: "Lessons", url: "/lessons", icon: CalendarDays },
      { title: "Attendance", url: "/attendance", icon: CheckSquare },
      { title: "Grades", url: "/grades", icon: GraduationCap },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Assignments", url: "/assignments", icon: ClipboardList },
      { title: "Progress Reports", url: "/progress-reports", icon: TrendingUp },
      { title: "Materials", url: "/materials", icon: FolderOpen },
    ],
  },
];

const schoolGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Classes",
    items: [
      { title: "My Classes", url: "/school-classes", icon: School },
    ],
  },
  {
    label: "Daily",
    items: [
      { title: "Diary", url: "/school-diary", icon: BookMarked },
      { title: "Attendance", url: "/school-attendance", icon: CheckSquare },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Scheme of Work", url: "/school-scheme", icon: ListChecks },
      { title: "PTM Reports", url: "/school-ptm", icon: FileText },
      { title: "Inspector Export", url: "/inspector-export", icon: PackageOpen },
    ],
  },
];

const PLAN_LABEL: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
};

const PLAN_COLOR: Record<string, string> = {
  trial: "text-amber-600 bg-amber-50 border-amber-300",
  starter: "text-blue-700 bg-blue-50 border-blue-300",
  pro: "text-primary bg-primary/10 border-primary/30",
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const { mode, setMode } = useMode();
  const sub = useSubscription();

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";
  const groups = mode === "school" ? schoolGroups : tutorGroups;

  function handleSchoolToggle() {
    if (!sub.schoolModeEnabled) {
      toast.error("School mode requires the Pro plan.", {
        description: "Upgrade to Pro (Rs 999/month) to unlock School mode.",
        action: { label: "View plans", onClick: () => window.location.assign("/pricing") },
      });
      return;
    }
    setMode("school");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">TutorDash</span>
            <span className="text-[11px] text-sidebar-foreground/40">Your teaching hub</span>
          </div>
        </div>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <div className="flex rounded-lg border border-sidebar-border p-0.5 gap-0.5">
            <button
              onClick={() => setMode("tutor")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${
                mode === "tutor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
              }`}
            >
              Tutor
            </button>
            <button
              onClick={handleSchoolToggle}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1 ${
                mode === "school"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
              }`}
            >
              {!sub.schoolModeEnabled && <Lock className="h-2.5 w-2.5" />}
              School
            </button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* Plan badge */}
        {!sub.loading && (
          <div className="px-3 pb-1 group-data-[collapsible=icon]:hidden">
            <Link to="/pricing" className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${PLAN_COLOR[sub.plan]} hover:opacity-80 transition-opacity`}>
              {sub.plan === "pro" && <Zap className="h-2.5 w-2.5" />}
              {PLAN_LABEL[sub.plan]} plan
              {sub.plan === "trial" && sub.daysLeft !== null && ` · ${sub.daysLeft}d left`}
            </Link>
          </div>
        )}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
            title="Sign out"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
              <div className="text-xs font-medium text-sidebar-foreground/80 truncate">
                {user?.email}
              </div>
              <div className="text-[10px] text-sidebar-foreground/40 flex items-center gap-1 mt-0.5">
                <LogOut className="h-2.5 w-2.5" />
                Sign out
              </div>
            </div>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
