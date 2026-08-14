import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Web platform: use cookie-based auth, fetch user from API
      if (Platform.OS === "web") {
        const apiUser = await Api.getMe();

        if (apiUser) {
          const userInfo: Auth.User = {
            id: apiUser.id,
            openId: apiUser.openId,
            name: apiUser.name,
            email: apiUser.email,
            loginMethod: apiUser.loginMethod,
            lastSignedIn: new Date(apiUser.lastSignedIn),
          };
          setUser(userInfo);
          // Cache user info in localStorage for faster subsequent loads
          await Auth.setUserInfo(userInfo);
        } else {
          setUser(null);
          await Auth.clearUserInfo();
        }
        return;
      }

      // Native sessions must be validated server-side; cached identity is not proof of auth.
      if (!(await Auth.getSessionToken())) {
        setUser(null);
        return;
      }
      const apiUser = await Api.getMe();
      if (!apiUser) {
        setUser(null);
        await Auth.removeSessionToken();
        await Auth.clearUserInfo();
        return;
      }
      const userInfo: Auth.User = {
        id: apiUser.id,
        openId: apiUser.openId,
        name: apiUser.name,
        email: apiUser.email,
        loginMethod: apiUser.loginMethod,
        lastSignedIn: new Date(apiUser.lastSignedIn),
      };
      setUser(userInfo);
      await Auth.setUserInfo(userInfo);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      // Surface the error to the UI without logging identity or token data.
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      // Continue with logout even if API call fails
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      setUser(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    if (autoFetch) {
      if (Platform.OS === "web") {
        // Web: fetch user from the cookie-backed API.
        fetchUser();
      } else {
        // Native: validate the token and fetch the current identity.
        fetchUser();
      }
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);


  return {
    user,
    loading,
    error,
    isAuthenticated,
    refresh: fetchUser,
    logout,
  };
}
