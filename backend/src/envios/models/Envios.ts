import { sequelize } from "src/database/database";
import { DataTypes, Model, NonAttribute, Optional } from "sequelize";
import { Pedidos } from "src/pedidos/models/Pedidos";
import { EstadoEnvios } from "src/estadoenvios/models/EstadoEnvios";
import { Direcciones } from "src/auth/usuarios/direcciones/models/Direcciones";

interface EnviosAttributes {
    id: number;
    id_pedido: number;
    id_estado_envio: number;
    ancho_paquete: number;
    alto_paquete: number;
    profundo_paquete: number;
    costo_envio: number;
    id_direccion: number;
    id_envio_CA: number;
    es_activo: boolean;
}

interface EnviosCreationAttributes extends Optional<EnviosAttributes, "id"> {}

export class Envios extends Model<EnviosAttributes, EnviosCreationAttributes> implements EnviosAttributes {
    declare id: number;
    declare id_pedido: number;
    declare id_estado_envio: number;
    declare ancho_paquete: number;
    declare alto_paquete: number;
    declare profundo_paquete: number;
    declare costo_envio: number;
    declare id_direccion: number;
    declare id_envio_CA: number;
    declare es_activo: boolean;

    declare pedido?: NonAttribute<Pedidos>;
    declare estado_envio?: NonAttribute<EstadoEnvios>;
    declare direccion?: NonAttribute<Direcciones>;
}

Envios.init(
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
        id_estado_envio: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ancho_paquete: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        alto_paquete: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        profundo_paquete: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        costo_envio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        id_direccion: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_envio_CA: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        es_activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "Envios",
        tableName: "Envios",
        timestamps: false,
    },
);
