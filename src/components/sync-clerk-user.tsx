"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function SyncClerkUserToSupabase() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn && user?.id) {
      (async () => {
        const token = await getToken();
        const supabase = createClient(token || undefined);
        await supabase
          .from("users")
          .upsert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName,
            avatar_url: user.imageUrl,
          });
      })();
    }
  }, [isSignedIn, user?.id, getToken]);
  return null;
}
