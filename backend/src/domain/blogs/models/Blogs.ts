import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Fotos } from 'src/domain/fotos/models/Fotos';

interface BlogAttributes {
    id: number;
    titulo: string;
    cuerpo: string;
    es_activo: number;
    created_at: Date;
}

interface BlogCreationAttributes extends Optional<BlogAttributes, 'id' | 'es_activo' | 'created_at'> {}

export class Blogs
    extends Model<BlogAttributes, BlogCreationAttributes>
    implements BlogAttributes
{
    declare id: number;
    declare titulo: string;
    declare cuerpo: string;
    declare es_activo: number;
    declare created_at: Date;

    declare fotos?: NonAttribute<Fotos[]>;
}

Blogs.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        titulo: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        cuerpo: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        es_activo: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Blogs',
        tableName: 'Blogs',
        timestamps: false,
    },
);

Blogs.hasMany(Fotos, {
    foreignKey: 'id_blog',
    as: 'fotos',
});

Fotos.belongsTo(Blogs, {
    foreignKey: 'id_blog',
    as: 'blog',
});