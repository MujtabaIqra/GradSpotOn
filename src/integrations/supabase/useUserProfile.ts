
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  user_type: string;
  student_id?: string | null;
};

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setProfile(data ?? null);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}
