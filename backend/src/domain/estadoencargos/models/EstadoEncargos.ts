import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';

interface EstadoEncargoAttributes {
    id: number;
    nombre: string;
    esActivo: boolean;
}

interface EstadoEncargoCreationAttributes extends Optional<EstadoEncargoAttributes, 'id' | 'esActivo'> {}

export class EstadoEncargos
    extends Model<EstadoEncargoAttributes, EstadoEncargoCreationAttributes>
    implements EstadoEncargoAttributes
{
    declare id: number;
    declare nombre: string;
    declare esActivo: boolean;
}

EstadoEncargos.init(
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
            field: 'es_activo',
        },
    },
    {
        sequelize,
        modelName: 'EstadoEncargos',
        tableName: 'EstadoEncargos',
        timestamps: false,
    },
);
