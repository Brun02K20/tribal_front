export type NamedActiveEntity = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export const mapNamedActiveEntity = <T extends NamedActiveEntity>(entity: T) => ({
  id: entity.id,
  nombre: entity.nombre,
  esActivo: entity.esActivo,
});
