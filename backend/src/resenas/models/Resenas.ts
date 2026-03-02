import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { Usuarios } from 'src/auth/models/Usuarios';
import { sequelize } from 'src/database/database';
import { Productos } from 'src/productos/models/Productos';

interface ResenaAttributes {
  id: number;
  id_producto: number;
  id_usuario: number;
  calificacion: number;
  fecha: Date;
  es_activo: boolean;
}

interface ResenaCreationAttributes extends Optional<ResenaAttributes, 'id' | 'fecha' | 'es_activo'> {}

export class Resenas extends Model<ResenaAttributes, ResenaCreationAttributes> implements ResenaAttributes {
  declare id: number;
  declare id_producto: number;
  declare id_usuario: number;
  declare calificacion: number;
  declare fecha: Date;
  declare es_activo: boolean;

  declare producto?: NonAttribute<Productos>;
  declare usuario?: NonAttribute<Usuarios>;
}

Resenas.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    calificacion: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    es_activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Resenas',
    tableName: 'Resenas',
    timestamps: false,
  },
);

Resenas.belongsTo(Productos, {
  foreignKey: 'id_producto',
  as: 'producto',
});

Productos.hasMany(Resenas, {
  foreignKey: 'id_producto',
  as: 'resenas',
});

Resenas.belongsTo(Usuarios, {
  foreignKey: 'id_usuario',
  as: 'usuario',
});

Usuarios.hasMany(Resenas, {
  foreignKey: 'id_usuario',
  as: 'resenas',
});
