import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Encargos } from 'src/domain/encargos/models/Encargos';
import { EstadoEncargos } from 'src/domain/estadoencargos/models/EstadoEncargos';
import { Usuarios } from 'src/auth/models/Usuarios';

interface HistorialEncargoAttributes {
    id: number;
    id_encargo: number;
    id_estado: number;
    fecha: Date;
    id_usuario: number | null;
}

interface HistorialEncargoCreationAttributes
    extends Optional<HistorialEncargoAttributes, 'id' | 'fecha' | 'id_usuario'> {}

export class HistorialEncargos
    extends Model<HistorialEncargoAttributes, HistorialEncargoCreationAttributes>
    implements HistorialEncargoAttributes
{
    declare id: number;
    declare id_encargo: number;
    declare id_estado: number;
    declare fecha: Date;
    declare id_usuario: number | null;

    declare encargo?: NonAttribute<Encargos>;
    declare estado?: NonAttribute<EstadoEncargos>;
    declare usuario?: NonAttribute<Usuarios>;
}

HistorialEncargos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        id_encargo: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'HistorialEncargos',
        tableName: 'HistorialEncargos',
        timestamps: false,
    },
);

HistorialEncargos.belongsTo(Encargos, {
    foreignKey: 'id_encargo',
    as: 'encargo',
});

HistorialEncargos.belongsTo(EstadoEncargos, {
    foreignKey: 'id_estado',
    as: 'estado',
});

HistorialEncargos.belongsTo(Usuarios, {
    foreignKey: 'id_usuario',
    as: 'usuario',
});
