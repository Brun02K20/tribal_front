import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Productos } from 'src/domain/productos/models/Productos';
import { Subcategorias } from 'src/domain/subcategorias/models/Subcategorias';
import { Categorias } from 'src/domain/categorias/models/Categorias';

type DescuentoAttributes = {
  id: number;
  porcentaje: number;
  id_producto: number | null;
  id_subcategoria: number | null;
  id_categoria: number | null;
  fecha_inicio: Date;
  fecha_fin: Date;
  es_activo: boolean;
};

type DescuentoCreationAttributes = Optional<DescuentoAttributes, 'id'>;

export class Descuentos
  extends Model<DescuentoAttributes, DescuentoCreationAttributes>
  implements DescuentoAttributes
{
  declare id: number;
  declare porcentaje: number;
  declare id_producto: number | null;
  declare id_subcategoria: number | null;
  declare id_categoria: number | null;
  declare fecha_inicio: Date;
  declare fecha_fin: Date;
  declare es_activo: boolean;

  declare producto?: NonAttribute<{ id: number; nombre: string }>;
  declare subcategoria?: NonAttribute<{ id: number; nombre: string }>;
  declare categoria?: NonAttribute<{ id: number; nombre: string }>;
}

Descuentos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Productos',
        key: 'id',
      },
    },
    id_subcategoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Subcategorias',
        key: 'id',
      },
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categorias',
        key: 'id',
      },
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    es_activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Descuentos',
    tableName: 'Descuentos',
    timestamps: false,
  },
);

Descuentos.belongsTo(Productos, {
  foreignKey: 'id_producto',
  as: 'producto',
});

Descuentos.belongsTo(Subcategorias, {
  foreignKey: 'id_subcategoria',
  as: 'subcategoria',
});

Descuentos.belongsTo(Categorias, {
  foreignKey: 'id_categoria',
  as: 'categoria',
});
