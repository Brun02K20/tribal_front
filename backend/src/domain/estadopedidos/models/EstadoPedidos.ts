import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Pedidos } from 'src/domain/pedidos/models/Pedidos';

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

EstadoPedidos.hasMany(Pedidos, {
    foreignKey: 'id_estado_pedido',
    as: 'pedidos',
});

Pedidos.belongsTo(EstadoPedidos, {
    foreignKey: 'id_estado_pedido',
    as: 'estadoPedido',
});