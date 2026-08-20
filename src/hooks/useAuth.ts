import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, EDITOR_EMAIL } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function login(password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({
      email: EDITOR_EMAIL,
      password,
    });
    return error ? "Неверный пароль" : null;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return { session, isAuthenticated: !!session, loading, login, logout };
}
