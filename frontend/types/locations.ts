export type Provincia = {
  id: number;
  nombre: string;
};

export type Ciudad = {
  id: number;
  nombre: string;
  id_provincia: number;
};
