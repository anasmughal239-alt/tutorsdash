import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "tutor" | "student" | null; // null = still resolving

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: Role;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole]       = useState<Role>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Resolve role after user is known.
  // A user is a tutor unless they were added as a student by a DIFFERENT tutor.
  // Using neq("tutor_id", user.id) excludes rows where the person added themselves
  // (same email, same uid) — keeps tutors from being mis-classified as students.
  useEffect(() => {
    if (!user) { setRole(null); return; }
    supabase
      .from("students")
      .select("id, tutor_id")
      .eq("email", user.email ?? "")
      .neq("tutor_id", user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data ? "student" : "tutor"));
  }, [user]);

  async function signOut() {
    await supabase.auth.signOut();
    setRole(null);
  }

  return (
    <Ctx.Provider value={{ user, session, loading, role, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
