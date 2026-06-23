import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';

// ── OrdenConfigCategoria ──────────────────────────────────────────────────────
// Una fila por categoría priorizada, con su posición (1 = primera).

interface OrdenConfigCategoriaAttributes {
    id: number;
    id_categoria: number;
    posicion: number;
}

interface OrdenConfigCategoriaCreation extends Optional<OrdenConfigCategoriaAttributes, 'id'> {}

export class OrdenConfigCategoria
    extends Model<OrdenConfigCategoriaAttributes, OrdenConfigCategoriaCreation>
    implements OrdenConfigCategoriaAttributes
{
    declare id: number;
    declare id_categoria: number;
    declare posicion: number;
    declare subcategorias?: NonAttribute<OrdenConfigSubcategoria[]>;
}

OrdenConfigCategoria.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        id_categoria: { type: DataTypes.INTEGER, allowNull: false },
        posicion: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, modelName: 'OrdenConfigCategoria', tableName: 'OrdenConfigCategoria', timestamps: false },
);

// ── OrdenConfigSubcategoria ───────────────────────────────────────────────────
// Una fila por subcategoría priorizada dentro de una categoría.

interface OrdenConfigSubcategoriaAttributes {
    id: number;
    id_categoria: number;
    id_subcategoria: number;
    posicion: number;
}

interface OrdenConfigSubcategoriaCreation extends Optional<OrdenConfigSubcategoriaAttributes, 'id'> {}

export class OrdenConfigSubcategoria
    extends Model<OrdenConfigSubcategoriaAttributes, OrdenConfigSubcategoriaCreation>
    implements OrdenConfigSubcategoriaAttributes
{
    declare id: number;
    declare id_categoria: number;
    declare id_subcategoria: number;
    declare posicion: number;
}

OrdenConfigSubcategoria.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        id_categoria: { type: DataTypes.INTEGER, allowNull: false },
        id_subcategoria: { type: DataTypes.INTEGER, allowNull: false },
        posicion: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, modelName: 'OrdenConfigSubcategoria', tableName: 'OrdenConfigSubcategoria', timestamps: false },
);

// Asociación para poder hacer include de subcategorías al leer la config
OrdenConfigCategoria.hasMany(OrdenConfigSubcategoria, {
    foreignKey: 'id_categoria',
    sourceKey: 'id_categoria',
    as: 'subcategorias',
});
