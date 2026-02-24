import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database/database';
import { Ciudades } from 'src/ciudades/models/Ciudades';

interface ProvinciaAttributes {
	id: number;
	nombre: string;
}

interface ProvinciaCreationAttributes
	extends Optional<ProvinciaAttributes, 'id'> {}

export class Provincias
	extends Model<ProvinciaAttributes, ProvinciaCreationAttributes>
	implements ProvinciaAttributes
{
	declare id: number;
	declare nombre: string;
}

Provincias.init(
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
		modelName: 'Provincias',
		tableName: 'Provincias',
		timestamps: false,
	},
);

Provincias.hasMany(Ciudades, {
    foreignKey: 'id_provincia',
    as: 'ciudades',
});

Ciudades.belongsTo(Provincias, {
	foreignKey: 'id_provincia',
	as: 'provincia',
});