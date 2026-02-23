export type RegisterDto = {
  nombre: string;
  username?: string;
  email: string;
  telefono?: string;
  password: string;
  id_rol?: number;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type GoogleRegisterDto = {
  idToken: string;
  nombre?: string;
  username?: string;
  email?: string;
  telefono?: string;
  id_rol?: number;
};

export type GoogleLoginDto = {
  idToken: string;
};
