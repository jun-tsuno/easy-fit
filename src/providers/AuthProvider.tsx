import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchUserAttributes,
  getCurrentUser,
  updateUserAttributes,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { createContext, use, useCallback, useEffect, useState } from "react";

type AuthUser = {
  username: string;
  userId: string;
  nickname: string | null;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    const [{ username, userId }, attributes] = await Promise.all([
      getCurrentUser(),
      fetchUserAttributes(),
    ]);
    return { username, userId, nickname: attributes.nickname ?? null };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    const currentUser = await loadCurrentUser();
    setUser(currentUser);
    setStatus(currentUser ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    refresh();
    return Hub.listen("auth", ({ payload }) => {
      if (
        payload.event === "signedIn" ||
        payload.event === "signedOut" ||
        payload.event === "tokenRefresh_failure"
      ) {
        refresh();
      }
    });
  }, [refresh]);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const result = await amplifySignIn({ username, password });
      if (!result.isSignedIn) {
        throw new Error(
          "追加の認証手続きが必要です。管理者にお問い合わせください。",
        );
      }
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await amplifySignOut();
    await refresh();
  }, [refresh]);

  const updateNickname = useCallback(
    async (nickname: string) => {
      await updateUserAttributes({ userAttributes: { nickname } });
      await refresh();
    },
    [refresh],
  );

  return (
    <AuthContext value={{ status, user, signIn, signOut, updateNickname }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
