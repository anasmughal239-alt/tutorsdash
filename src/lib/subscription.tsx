import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export type Plan = "trial" | "starter" | "pro";

export type SubInfo = {
  plan: Plan;
  studentLimit: number;
  schoolModeEnabled: boolean;
  trialEndsAt: Date | null;
  daysLeft: number | null;
  isExpired: boolean;
  loading: boolean;
};

const DEFAULTS: SubInfo = {
  plan: "trial",
  studentLimit: 5,
  schoolModeEnabled: false,
  trialEndsAt: null,
  daysLeft: null,
  isExpired: false,
  loading: true,
};

const Ctx = createContext<SubInfo>(DEFAULTS);
export const useSubscription = () => useContext(Ctx);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sub, setSub] = useState<SubInfo>(DEFAULTS);

  useEffect(() => {
    if (!user) { setSub({ ...DEFAULTS, loading: false }); return; }
    load(user.id);
  }, [user]);

  async function load(userId: string) {
    let { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("tutor_id", userId)
      .maybeSingle();

    if (!data) {
      const { data: created } = await supabase
        .from("subscriptions")
        .insert({ tutor_id: userId })
        .select()
        .single();
      data = created;
    }

    if (!data) { setSub({ ...DEFAULTS, loading: false }); return; }

    const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
    const now = new Date();
    const daysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000))
      : null;
    const trialExpired = data.plan === "trial" && trialEndsAt !== null && trialEndsAt < now;
    const isExpired = trialExpired || data.status === "expired";

    setSub({
      plan: data.plan as Plan,
      studentLimit: data.student_limit,
      schoolModeEnabled: data.school_mode_enabled,
      trialEndsAt,
      daysLeft,
      isExpired,
      loading: false,
    });
  }

  return <Ctx.Provider value={sub}>{children}</Ctx.Provider>;
}
