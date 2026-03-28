import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Pedidos } from 'src/domain/pedidos/models/Pedidos';
import { EstadoPedidos } from 'src/domain/estadopedidos/models/EstadoPedidos';
import { Usuarios } from 'src/auth/models/Usuarios';

interface HistorialPedidoAttributes {
    id: number;
    id_pedido: number;
    id_estado: number;
    fecha: Date;
    id_usuario: number | null;
}

interface HistorialPedidoCreationAttributes
    extends Optional<HistorialPedidoAttributes, 'id' | 'fecha' | 'id_usuario'> {}

export class HistorialPedidos
    extends Model<HistorialPedidoAttributes, HistorialPedidoCreationAttributes>
    implements HistorialPedidoAttributes
{
    declare id: number;
    declare id_pedido: number;
    declare id_estado: number;
    declare fecha: Date;
    declare id_usuario: number | null;

    declare pedido?: NonAttribute<Pedidos>;
    declare estado?: NonAttribute<EstadoPedidos>;
    declare usuario?: NonAttribute<Usuarios>;
}

HistorialPedidos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        id_pedido: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'HistorialPedidos',
        tableName: 'HistorialPedidos',
        timestamps: false,
    },
);

HistorialPedidos.belongsTo(Pedidos, {
    foreignKey: 'id_pedido',
    as: 'pedido',
});

HistorialPedidos.belongsTo(EstadoPedidos, {
    foreignKey: 'id_estado',
    as: 'estado',
});

HistorialPedidos.belongsTo(Usuarios, {
    foreignKey: 'id_usuario',
    as: 'usuario',
});
