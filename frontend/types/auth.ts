export type AuthUser = {
  id: number;
  nombre: string;
  username: string | null;
  email: string;
  telefono: string | null;
  google_id: string | null;
  id_rol: number;
};

export type AuthResponse = {
  user: AuthUser;
};

export type RegisterPayload = {
  nombre: string;
  username?: string;
  email: string;
  telefono?: string;
  password: string;
};

export type GoogleRegisterPayload = {
  idToken: string;
  nombre?: string;
  username?: string;
  email?: string;
  telefono?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginFormValues = LoginPayload;

export type RegisterFormValues = {
  nombre: string;
  username: string;
  email: string;
  telefono: string;
  password: string;
};

export type BackendErrorResponse = {
  message?: string | string[];
};

export type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  login: (params: { user: AuthUser }) => void;
  logout: () => Promise<void>;
};
