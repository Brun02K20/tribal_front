import { Ciudades } from 'src/ciudades/models/Ciudades';
import { Provincias } from 'src/provincias/models/Provincias';

export const mapProvincia = (provincia: Provincias) => ({
  id: provincia.id,
  nombre: provincia.nombre,
});

export const mapCiudad = (ciudad: Ciudades) => ({
  id: ciudad.id,
  nombre: ciudad.nombre,
  id_provincia: ciudad.id_provincia,
});
