import { sequelize } from "src/database/database";
import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { Productos } from "src/productos/models/Productos";

interface DetallePedidosAttributes {
    id: number;
    id_pedido: number;
    id_producto: number;
    unidades: number;
    subtotal: number;
    es_activo: boolean;
}

interface DetallePedidosCreationAttributes extends Optional<DetallePedidosAttributes, 'id'> {}

export class DetallePedidos extends Model<DetallePedidosAttributes, DetallePedidosCreationAttributes> implements DetallePedidosAttributes {
    declare id: number;
    declare id_pedido: number;
    declare id_producto: number;
    declare unidades: number;
    declare subtotal: number;
    declare es_activo: boolean;

    declare producto?: NonAttribute<Productos>;
}

DetallePedidos.init(
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
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unidades: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
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
        modelName: 'DetallePedidos',
        tableName: 'DetallePedidos',
        timestamps: false,
    },
);

