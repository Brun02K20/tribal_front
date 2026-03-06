import { Ciudades } from 'src/domain/ciudades/models/Ciudades';
import { Provincias } from 'src/domain/provincias/models/Provincias';

export const mapProvincia = (provincia: Provincias) => ({
  id: provincia.id,
  nombre: provincia.nombre,
});

export const mapCiudad = (ciudad: Ciudades) => ({
  id: ciudad.id,
  nombre: ciudad.nombre,
  id_provincia: ciudad.id_provincia,
});
