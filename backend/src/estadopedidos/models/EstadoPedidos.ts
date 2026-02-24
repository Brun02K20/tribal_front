import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database/database';
// import { Subcategorias } from 'src/subcategorias/models/Subcategorias';

interface EstadoPedidoAttributes {
    id: number;
    nombre: string;
    esActivo: boolean;
}

interface EstadoPedidoCreationAttributes
    extends Optional<EstadoPedidoAttributes, 'id'> {}

export class EstadoPedidos
    extends Model<EstadoPedidoAttributes, EstadoPedidoCreationAttributes>
    implements EstadoPedidoAttributes
{
    declare id: number;
    declare nombre: string;
    declare esActivo: boolean;
}

EstadoPedidos.init(
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
        modelName: 'EstadoPedidos',
        tableName: 'EstadoPedidos',
        timestamps: false,
    },
);

// Categorias.hasMany(Subcategorias, {
//     foreignKey: 'id_categoria',
//     as: 'subcategorias',
// });

// Subcategorias.belongsTo(Categorias, {
//     foreignKey: 'id_categoria',
//     as: 'categoria',
// });