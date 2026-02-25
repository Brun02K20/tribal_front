import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database/database';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';
import { Productos } from 'src/productos/models/Productos';

interface CategoriaAttributes {
    id: number;
    nombre: string;
    esActivo: boolean;
}

interface CategoriaCreationAttributes
    extends Optional<CategoriaAttributes, 'id'> {}

export class Categorias
    extends Model<CategoriaAttributes, CategoriaCreationAttributes>
    implements CategoriaAttributes
{
    declare id: number;
    declare nombre: string;
    declare esActivo: boolean;
}

Categorias.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        esActivo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Categorias',
        tableName: 'Categorias',
        timestamps: false,
    },
);

Categorias.hasMany(Subcategorias, {
    foreignKey: 'id_categoria',
    as: 'subcategorias',
});

Subcategorias.belongsTo(Categorias, {
    foreignKey: 'id_categoria',
    as: 'categoria',
});

Categorias.hasMany(Productos, {
    foreignKey: 'id_categoria',
    as: 'productos',
});

Productos.belongsTo(Categorias, {
    foreignKey: 'id_categoria',
    as: 'categoria',
});

