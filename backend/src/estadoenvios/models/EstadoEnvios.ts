import { sequelize } from "src/database/database";
import { DataTypes, Model, Optional } from "sequelize";
import { Envios } from "src/envios/models/Envios";

interface EstadoEnvioAttributes {
    id: number;
    nombre: string;
    esActivo: boolean;
}

interface EstadoEnvioCreationAttributes extends Optional<EstadoEnvioAttributes, "id"> {}

export class EstadoEnvios extends Model<EstadoEnvioAttributes, EstadoEnvioCreationAttributes> implements EstadoEnvioAttributes {
    declare id: number;
    declare nombre: string;
    declare esActivo: boolean;
}

EstadoEnvios.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
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
        modelName: "EstadoEnvios",
        tableName: "EstadoEnvios",
        timestamps: false,
    }
);

EstadoEnvios.hasMany(Envios, {
    foreignKey: "id_estado_envio",
    as: "envios",
});

Envios.belongsTo(EstadoEnvios, {
    foreignKey: "id_estado_envio",
    as: "estado_envio",
});