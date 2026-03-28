import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Usuarios } from 'src/auth/models/Usuarios';
import { Direcciones } from 'src/auth/usuarios/direcciones/models/Direcciones';
import { EstadoEncargos } from 'src/domain/estadoencargos/models/EstadoEncargos';
import { Pagos } from 'src/domain/pagos/models/Pagos';
import { Envios } from 'src/domain/envios/models/Envios';

interface EncargoAttributes {
    id: number;
    id_usuario: number;
    id_direccion: number;
    fecha_encargo: Date;
    presupuesto: number | null;
    ancho: number | null;
    alto: number | null;
    profundo: number | null;
    peso_en_gramos: number | null;
    descripcion: string;
    id_estado: number;
}

interface EncargoCreationAttributes
    extends Optional<EncargoAttributes, 'id' | 'fecha_encargo' | 'presupuesto'> {}

export class Encargos
    extends Model<EncargoAttributes, EncargoCreationAttributes>
    implements EncargoAttributes
{
    declare id: number;
    declare id_usuario: number;
    declare id_direccion: number;
    declare fecha_encargo: Date;
    declare presupuesto: number | null;
    declare ancho: number | null;
    declare alto: number | null;
    declare profundo: number | null;
    declare peso_en_gramos: number | null;
    declare descripcion: string;
    declare id_estado: number;

    declare usuario?: NonAttribute<Usuarios>;
    declare direccion?: NonAttribute<Direcciones>;
    declare estado_encargo?: NonAttribute<EstadoEncargos>;
    declare pago?: NonAttribute<Pagos>;
    declare envio?: NonAttribute<Envios>;
}

Encargos.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_direccion: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha_encargo: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        presupuesto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        ancho: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        alto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        profundo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        peso_en_gramos: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'peso_en_gramos',
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        id_estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Encargos',
        tableName: 'Encargos',
        timestamps: false,
    },
);

Usuarios.hasMany(Encargos, {
    foreignKey: 'id_usuario',
    as: 'encargos',
});

Encargos.belongsTo(Usuarios, {
    foreignKey: 'id_usuario',
    as: 'usuario',
});

Direcciones.hasMany(Encargos, {
    foreignKey: 'id_direccion',
    as: 'encargos',
});

Encargos.belongsTo(Direcciones, {
    foreignKey: 'id_direccion',
    as: 'direccion',
});

EstadoEncargos.hasMany(Encargos, {
    foreignKey: 'id_estado',
    as: 'encargos',
});

Encargos.belongsTo(EstadoEncargos, {
    foreignKey: 'id_estado',
    as: 'estado_encargo',
});

Encargos.hasOne(Pagos, {
    foreignKey: 'id_encargo',
    as: 'pago',
});

Pagos.belongsTo(Encargos, {
    foreignKey: 'id_encargo',
    as: 'encargo',
});

Encargos.hasOne(Envios, {
    foreignKey: 'id_encargo',
    as: 'envio',
});

Envios.belongsTo(Encargos, {
    foreignKey: 'id_encargo',
    as: 'encargo',
});
