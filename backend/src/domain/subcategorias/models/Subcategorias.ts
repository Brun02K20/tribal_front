import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Productos } from 'src/domain/productos/models/Productos';

interface SubcategoriaAttributes {
    id: number;
    nombre: string;
    id_categoria: number;
    esActivo: boolean;
}

interface SubcategoriaCreationAttributes
    extends Optional<SubcategoriaAttributes, 'id'> {}

export class Subcategorias
    extends Model<SubcategoriaAttributes, SubcategoriaCreationAttributes>
    implements SubcategoriaAttributes
{
    declare id: number;
    declare nombre: string;
    declare id_categoria: number;
    declare esActivo: boolean;
}

Subcategorias.init(
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
        id_categoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Categorias',
                key: 'id',
            },
        },
        esActivo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Subcategorias',
        tableName: 'Subcategorias',
        timestamps: false,
    },
);

Subcategorias.hasMany(Productos, {
    foreignKey: 'id_subcategoria',
    as: 'productos',
});

Productos.belongsTo(Subcategorias, {
    foreignKey: 'id_subcategoria',
    as: 'subcategoria',
});