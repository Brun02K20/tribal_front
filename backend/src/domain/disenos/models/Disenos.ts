import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';

interface DisenoAttributes {
    id: number;
    nombre: string;
    precio: number;
    url_foto: string | null;
    id_producto: number;
}

interface DisenoCreationAttributes extends Optional<DisenoAttributes, 'id'> {}

export class Disenos
    extends Model<DisenoAttributes, DisenoCreationAttributes>
    implements DisenoAttributes
{
    declare id: number;
    declare nombre: string;
    declare precio: number;
    declare url_foto: string | null;
    declare id_producto: number;
}

Disenos.init(
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
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        url_foto: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Disenos',
        tableName: 'Disenos',
        timestamps: false,
    },
);
