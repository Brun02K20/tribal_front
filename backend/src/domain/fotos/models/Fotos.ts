import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';

interface FotoAttributes {
	id: number;
	url: string;
	id_producto: number;
	es_activo: number;
}

interface FotoCreationAttributes extends Optional<FotoAttributes, 'id' | 'id_producto' | 'es_activo'> {}

export class Fotos
	extends Model<FotoAttributes, FotoCreationAttributes>
	implements FotoAttributes
{
	declare id: number;
	declare url: string;
	declare id_producto: number;
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
			allowNull: false,
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
