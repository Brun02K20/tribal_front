import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database/database';

interface CiudadAttributes {
    id: number;
    nombre: string;
    id_provincia: number;
}

interface CiudadCreationAttributes
    extends Optional<CiudadAttributes, 'id'> {}

export class Ciudades
    extends Model<CiudadAttributes, CiudadCreationAttributes>
    implements CiudadAttributes
{
    declare id: number;
    declare nombre: string;
    declare id_provincia: number;
}

Ciudades.init(
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
        id_provincia: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Provincias',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Ciudades',
        tableName: 'Ciudades',
        timestamps: false,
    },
);
