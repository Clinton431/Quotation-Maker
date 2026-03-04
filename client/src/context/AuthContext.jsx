import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until session restore attempt completes
  const sessionTimerRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ── Clear session ──────────────────────────────────────────────────────────
  const clearSession = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    localStorage.removeItem("wt_user");
    localStorage.removeItem("wt_token");
    localStorage.removeItem("wt_session_expiry");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  }, []);

  // ── Schedule expiry ────────────────────────────────────────────────────────
  const scheduleExpiry = useCallback(
    (msUntilExpiry) => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = setTimeout(() => {
        clearSession();
        window.dispatchEvent(new CustomEvent("wt:session-expired"));
      }, msUntilExpiry);
    },
    [clearSession]
  );

  // ── Persist session ────────────────────────────────────────────────────────
  const persistSession = useCallback(
    (userData, token) => {
      if (!userData || !token) {
        console.error("[AuthContext] persistSession — missing data:", {
          userData,
          token,
        });
        return;
      }
      const expiry = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem("wt_user", JSON.stringify(userData));
      localStorage.setItem("wt_token", token);
      localStorage.setItem("wt_session_expiry", expiry.toString());
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      scheduleExpiry(SESSION_DURATION_MS);
    },
    [scheduleExpiry]
  );

  // ── Restore session on mount ───────────────────────────────────────────────
  // IMPORTANT: setLoading(false) is called in ALL branches so that consumers
  // (e.g. AdminDashboard) never see a transient null user and navigate away.
  useEffect(() => {
    const stored = localStorage.getItem("wt_user");
    const storedExpiry = localStorage.getItem("wt_session_expiry");
    const storedToken = localStorage.getItem("wt_token");

    if (stored && storedExpiry && storedToken) {
      const expiry = parseInt(storedExpiry, 10);
      if (Date.now() < expiry) {
        try {
          const parsedUser = JSON.parse(stored);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
          setUser(parsedUser);
          scheduleExpiry(expiry - Date.now());
        } catch {
          clearSession();
        }
      } else {
        // Session expired while the tab was closed
        clearSession();
      }
    }
    // Always mark loading complete — even when no session exists
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      const { token, user: userData } = res.data;
      if (!token || !userData)
        throw new Error(
          `Unexpected login response: ${JSON.stringify(res.data)}`
        );
      persistSession(userData, token);
      return userData;
    },
    [persistSession]
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (name, email, password) => {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });
      const { token, user: userData } = res.data;
      if (!token || !userData) {
        return {
          verificationPending: true,
          message: res.data?.message ?? "Check your email.",
        };
      }
      persistSession(userData, token);
      return userData;
    },
    [persistSession]
  );

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_URL}/api/auth/google`;
  }, []);

  const handleGoogleCallback = useCallback(
    async (token) => {
      if (!token) throw new Error("No token provided");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await axios.get(`${API_URL}/api/auth/me`);
      const userData = res.data?.user ?? res.data;
      persistSession(userData, token);
      return userData;
    },
    [persistSession]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => clearSession(), [clearSession]);

  // ── Activity-based session refresh (every 30 min of activity) ─────────────
  useEffect(() => {
    if (!user) return;
    let lastRefresh = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastRefresh > 30 * 60 * 1000) {
        lastRefresh = now;
        const token = localStorage.getItem("wt_token");
        if (token && userRef.current) persistSession(userRef.current, token);
      }
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true })
    );
    return () =>
      events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [user, persistSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
