import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from '../../database/database';
import { DetallePedidos } from 'src/detallepedido/models/DetallePedidos';
import { Pagos } from 'src/pagos/models/Pagos';
import { Envios } from 'src/envios/models/Envios';
import { Usuarios } from 'src/auth/models/Usuarios';
import { EstadoPedidos } from 'src/estadopedidos/models/EstadoPedidos';

interface PedidoAttributes {
    id: number;
    id_usuario: number;
    fecha_pedido: Date;
    costo_total_productos: number;
    costo_envio: number;
    costo_ganancia_envio: number;
    id_estado_pedido: number;
    es_activo: boolean;
}

interface PedidoCreationAttributes extends Optional<PedidoAttributes, 'id'> {}

export class Pedidos extends Model<PedidoAttributes, PedidoCreationAttributes> {
    declare id: number;
    declare id_usuario: number;
    declare fecha_pedido: Date;
    declare costo_total_productos: number;
    declare costo_envio: number;
    declare costo_ganancia_envio: number;
    declare id_estado_pedido: number;
    declare es_activo: boolean;

    declare detallePedidos?: NonAttribute<DetallePedidos[]>;
    declare pago?: NonAttribute<Pagos>;
    declare envio?: NonAttribute<Envios>;
    declare usuario?: NonAttribute<Usuarios>;
    declare estadoPedido?: NonAttribute<EstadoPedidos>;
}

Pedidos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha_pedido: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        costo_total_productos: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        costo_envio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        costo_ganancia_envio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        id_estado_pedido: {
            type: DataTypes.INTEGER,
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
        modelName: 'Pedidos',
        tableName: 'pedidos',
        timestamps: false,
    }
);

Pedidos.hasMany(DetallePedidos, {
    foreignKey: 'id_pedido',
    as: 'detallePedidos',
});

DetallePedidos.belongsTo(Pedidos, {
    foreignKey: 'id_pedido',
    as: 'pedido',
});

Pedidos.hasOne(Pagos, {
    foreignKey: 'id_pedido',
    as: 'pago',
});

Pagos.belongsTo(Pedidos, {
    foreignKey: 'id_pedido',
    as: 'pedido',
});

Pedidos.hasOne(Envios, {
    foreignKey: 'id_pedido',
    as: 'envio',
});

Envios.belongsTo(Pedidos, {
    foreignKey: 'id_pedido',
    as: 'pedido',
});
