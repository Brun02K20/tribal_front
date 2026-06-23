import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';

interface OrdenConfigAttributes {
    id: number;
    id_categoria: number | null;
    id_subcategoria: number | null;
}

interface OrdenConfigCreationAttributes extends Optional<OrdenConfigAttributes, 'id' | 'id_categoria' | 'id_subcategoria'> {}

export class OrdenConfig
    extends Model<OrdenConfigAttributes, OrdenConfigCreationAttributes>
    implements OrdenConfigAttributes
{
    declare id: number;
    declare id_categoria: number | null;
    declare id_subcategoria: number | null;
}

OrdenConfig.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_categoria: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        id_subcategoria: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        modelName: 'OrdenConfig',
        tableName: 'OrdenConfig',
        timestamps: false,
    },
);
