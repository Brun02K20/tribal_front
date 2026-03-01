export type UserAddress = {
  id: number;
  cod_postal_destino: string;
  calle: string;
  altura: string;
  id_provincia: number;
  provincia: string;
  id_ciudad: number;
  ciudad: string;
  id_usuario: number;
};

export type CreateUserAddressPayload = {
  cod_postal_destino: string;
  calle: string;
  altura: string;
  id_provincia: number;
  id_ciudad: number;
};

export type AccountConfigAddress = {
  cod_postal_destino: string;
  calle: string;
  altura: string;
  id_provincia: number;
  id_ciudad: number;
  id_usuario: number;
};

export type AccountConfigResponse = {
  nombre: string | null;
  email: string | null;
  username: string | null;
  telefono: string | null;
  direcciones: AccountConfigAddress[];
};

export type UpdateAccountConfigPayload = {
  username?: string;
  telefono?: string;
  password?: string;
  direcciones?: AccountConfigAddress[];
};

export type UpdateAccountConfigResponse = {
  id: number;
  message: string;
};

export type AccountConfigFormValues = {
  nombre: string;
  email: string;
  username: string;
  telefono: string;
  password: string;
  direcciones: AccountConfigAddress[];
};
