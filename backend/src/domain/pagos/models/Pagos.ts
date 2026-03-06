import { sequelize } from "src/database/database";
import { DataTypes, Model, NonAttribute, Optional } from "sequelize";
import { Pedidos } from "src/domain/pedidos/models/Pedidos";

interface PagosAttributes {
    id: number;
    monto_total: number;
    fecha_pago: Date;
    aprobado: boolean;
    id_pedido: number;
    es_activo: boolean;
}

interface PagosCreationAttributes extends Optional<PagosAttributes, "id"> {}

export class Pagos extends Model<PagosAttributes, PagosCreationAttributes> implements PagosAttributes {
    declare id: number;
    declare monto_total: number;
    declare fecha_pago: Date;
    declare aprobado: boolean;
    declare id_pedido: number;
    declare es_activo: boolean;

    declare pedido?: NonAttribute<Pedidos>;
}

Pagos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        monto_total: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
        },
        fecha_pago: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        aprobado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        id_pedido: {
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
        modelName: "Pagos",
        tableName: "Pagos",
        timestamps: false,
    },
);
