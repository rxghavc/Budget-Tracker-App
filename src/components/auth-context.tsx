"use client";
import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";

interface AuthContextType {
  isLoggedIn: boolean;
  user: ReturnType<typeof useUser>["user"];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser();

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!isSignedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
