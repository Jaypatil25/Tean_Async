import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
  type AuthUser,
} from "../services/authService";

const AUTH_STORAGE_KEY = "creditai-auth";

type StoredAuthState = {
  token: string;
  user: AuthUser;
};

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (input: SignUpInput) => Promise<void>;
  login: (input: SignInInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): StoredAuthState | null {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth) as StoredAuthState;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = readStoredAuth();

    if (!storedAuth) {
      setIsLoading(false);
      return;
    }

    setToken(storedAuth.token);

    const hydrateUser = async () => {
      try {
        const response = await getCurrentUser(storedAuth.token);
        persistAuth({
          token: storedAuth.token,
          user: response.user,
        });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const persistAuth = (nextAuth: StoredAuthState | null) => {
    if (!nextAuth) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setToken(null);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setUser(nextAuth.user);
    setToken(nextAuth.token);
  };

  const signup = async (input: SignUpInput) => {
    await signupRequest(input);
    const loginResponse = await loginRequest({
      email: input.email,
      password: input.password,
    });
    const currentUser = await getCurrentUser(loginResponse.token);

    persistAuth({
      token: loginResponse.token,
      user: currentUser.user,
    });
  };

  const login = async (input: SignInInput) => {
    const response = await loginRequest(input);
    const currentUser = await getCurrentUser(response.token);

    persistAuth({
      token: response.token,
      user: currentUser.user,
    });
  };

  const logout = async () => {
    const currentToken = token;

    if (currentToken) {
      try {
        await logoutRequest(currentToken);
      } catch {
        // Clear local auth even if the backend token is already invalid.
      }
    }

    persistAuth(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      signup,
      login,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
