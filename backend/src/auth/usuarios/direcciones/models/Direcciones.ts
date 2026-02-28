import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from '../../../../database/database';
import { Envios } from 'src/envios/models/Envios';
import { Ciudades } from 'src/ciudades/models/Ciudades';
import { Provincias } from 'src/provincias/models/Provincias';

interface DireccionAttributes {
    id: number;
    cod_postal_destino: string;
    calle: string;
    altura: string;
    id_provincia: number;
    id_ciudad: number;
    id_usuario: number;
    es_activo: boolean;
}

interface DireccionCreationAttributes
    extends Optional<DireccionAttributes, 'id' > {}

export class Direcciones
    extends Model<DireccionAttributes, DireccionCreationAttributes>
    implements DireccionAttributes
{
    declare id: number;
    declare cod_postal_destino: string;
    declare calle: string;
    declare altura: string;
    declare id_provincia: number;
    declare id_ciudad: number;
    declare id_usuario: number;
    declare es_activo: boolean;

    declare provincia?: NonAttribute<Provincias>;
    declare ciudad?: NonAttribute<Ciudades>;
}

Direcciones.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        cod_postal_destino: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        calle: {
            type: DataTypes.STRING(1024),
            allowNull: false,
        },
        altura: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        id_provincia: {
            type: DataTypes.INTEGER,    
            allowNull: false,
        },
        id_ciudad: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Usuarios',
                key: 'id',
            },
        },
        es_activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Direcciones',
        tableName: 'Direcciones',
        timestamps: false,
    },
);

Direcciones.hasMany(Envios, {
    foreignKey: 'id_direccion',
    as: 'envios',
});

Envios.belongsTo(Direcciones, {
    foreignKey: 'id_direccion',
    as: 'direccion',
});
