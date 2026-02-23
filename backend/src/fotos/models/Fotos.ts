import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database/database';

interface FotoAttributes {
	id: number;
	url: string;
	id_producto: number | null;
	es_activo: number;
}

interface FotoCreationAttributes extends Optional<FotoAttributes, 'id' | 'id_producto' | 'es_activo'> {}

export class Fotos
	extends Model<FotoAttributes, FotoCreationAttributes>
	implements FotoAttributes
{
	declare id: number;
	declare url: string;
	declare id_producto: number | null;
	declare es_activo: number;
}

Fotos.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		id_producto: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		es_activo: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 1,
		},
	},
	{
		sequelize,
		modelName: 'Fotos',
		tableName: 'Fotos',
		timestamps: false,
	},
);
