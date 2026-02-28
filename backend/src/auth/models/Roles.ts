import { sequelize } from "src/database/database";
import { DataTypes, Model, Optional } from "sequelize";
import { Usuarios } from "./Usuarios";

interface RolesAttributes {
    id: number;
    nombre: string;
}

interface RolesCreationAttributes extends Optional<RolesAttributes, 'id'> {}

export class Roles extends Model<RolesAttributes, RolesCreationAttributes> implements RolesAttributes {
    declare id: number;
    declare nombre: string;
}

Roles.init(
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
    },
    {
        sequelize,
        modelName: 'Roles',
        tableName: 'roles',
        timestamps: false,
    }
);

Roles.hasMany(Usuarios, {
    foreignKey: 'id_rol',
    as: 'usuarios',
});

Usuarios.belongsTo(Roles, {
    foreignKey: 'id_rol',
    as: 'rol',
});