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

const items = [
  { title: "Dashboard",        url: "/dashboard",        icon: LayoutDashboard },
  { title: "Modules",          url: "/modules",          icon: BookOpen },
  { title: "Students",         url: "/students",         icon: Users },
  { title: "Lessons",          url: "/lessons",          icon: CalendarDays },
  { title: "Attendance",       url: "/attendance",       icon: CheckSquare },
  { title: "Assignments",      url: "/assignments",      icon: ClipboardList },
  { title: "Grades",           url: "/grades",           icon: GraduationCap },
  { title: "Progress Reports", url: "/progress-reports", icon: TrendingUp },
  { title: "Materials",        url: "/materials",        icon: FolderOpen },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">TutorDash</span>
            <span className="text-[11px] text-sidebar-foreground/40">Tutor toolkit</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
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
      </SidebarContent>

      <SidebarFooter>
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
            title="Sign out"
          >
            {/* Avatar circle */}
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
              {initials}
            </div>
            {/* Email + label */}
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
