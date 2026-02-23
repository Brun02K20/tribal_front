export type BaseUserInput = {
  nombre: string;
  username?: string;
  email: string;
  telefono?: string;
  id_rol?: number;
};

export type RegisterInput = BaseUserInput & { password: string };

export type LoginInput = { email: string; password: string };

export type GoogleInput = BaseUserInput & { idToken: string };

export type GoogleTokenInfo = {
  sub: string;
  email: string;
  email_verified?: string;
  name?: string;
  aud?: string;
};
