import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from '../../database/database';
import { Fotos } from 'src/fotos/models/Fotos';

interface ProductoAttributes {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    id_categoria: number;
    id_subcategoria: number;
    ancho: number;
    alto: number;
    profundo: number;
    peso_gramos: number;
    es_activo: boolean;
}

interface ProductoCreationAttributes
    extends Optional<ProductoAttributes, 'id'> {}

export class Productos
    extends Model<ProductoAttributes, ProductoCreationAttributes>
    implements ProductoAttributes
{
    declare id: number
    declare nombre: string;
    declare descripcion: string;
    declare precio: number;
    declare stock: number;
    declare id_categoria: number;
    declare id_subcategoria: number;
    declare ancho: number;
    declare alto: number;
    declare profundo: number;
    declare peso_gramos: number;
    declare es_activo: boolean;

    declare fotos?: NonAttribute<Fotos[]>;
    declare categoria?: NonAttribute<{ id: number; nombre: string }>;
    declare subcategoria?: NonAttribute<{ id: number; nombre: string }>;
}

Productos.init(
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
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_categoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_subcategoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ancho: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        alto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        profundo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        peso_gramos: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        es_activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Productos',
        tableName: 'Productos',
        timestamps: false,
    },
);

Productos.hasMany(Fotos, {
    foreignKey: 'id_producto',
    as: 'fotos',
});

Fotos.belongsTo(Productos, {
    foreignKey: 'id_producto',
    as: 'producto',
});