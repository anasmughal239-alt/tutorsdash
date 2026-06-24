import { useNavigate } from "@tanstack/react-router";
import { CheckSquare, CalendarDays, Upload } from "lucide-react";

export function MobileQuickActions() {
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden border-t bg-card shadow-lg">
        <QuickBtn
          icon={<CheckSquare className="h-5 w-5" />}
          label="Attendance"
          onClick={() => navigate({ to: "/attendance" })}
        />
        <QuickBtn
          icon={<CalendarDays className="h-5 w-5" />}
          label="Schedule"
          onClick={() => navigate({ to: "/lessons" })}
        />
        <QuickBtn
          icon={<Upload className="h-5 w-5" />}
          label="Upload"
          onClick={() => navigate({ to: "/materials" })}
        />
      </div>
      <div className="h-16 sm:hidden" />
    </>
  );
}

function QuickBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
