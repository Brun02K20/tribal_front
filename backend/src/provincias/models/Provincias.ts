import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database/database';

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
