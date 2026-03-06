import { DataTypes, Model, NonAttribute, Optional } from 'sequelize';
import { sequelize } from 'src/database/database';
import { Direcciones } from '../usuarios/direcciones/models/Direcciones';
import { Pedidos } from 'src/domain/pedidos/models/Pedidos';
import { Roles } from './Roles';

interface UsuarioAttributes {
	id: number;
	nombre: string;
	username: string | null;
	email: string;
	telefono: string | null;
	password_hash: string | null;
	google_id: string | null;
	id_rol: number;
	fecha_registro: Date;
}

interface UsuarioCreationAttributes
	extends Optional<UsuarioAttributes, 'id' | 'username' | 'telefono' | 'password_hash' | 'google_id' | 'fecha_registro'> {}

export class Usuarios
	extends Model<UsuarioAttributes, UsuarioCreationAttributes>
	implements UsuarioAttributes
{
	declare id: number;
	declare nombre: string;
	declare username: string | null;
	declare email: string;
	declare telefono: string | null;
	declare password_hash: string | null;
	declare google_id: string | null;
	declare id_rol: number;
	declare fecha_registro: Date;

	// asociación cargada por include
    declare direcciones?: NonAttribute<Direcciones[]>;
	declare pedidos?: NonAttribute<Pedidos[]>;
	declare rol?: NonAttribute<Roles>;
}


Usuarios.init(
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
		username: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		telefono: {
			type: DataTypes.STRING(24),
			allowNull: true,
		},
		password_hash: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		google_id: {
			type: DataTypes.STRING(100),
			allowNull: true,
			unique: true,
		},
		id_rol: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 2,
		},
		fecha_registro: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: 'Usuarios',
		tableName: 'Usuarios',
		timestamps: false,
	},
);

Usuarios.hasMany(Direcciones, {
	foreignKey: 'id_usuario',
	as: 'direcciones',
});

Direcciones.belongsTo(Usuarios, {
	foreignKey: 'id_usuario',
	as: 'usuario',
});

Usuarios.hasMany(Pedidos, {
	foreignKey: 'id_usuario',
	as: 'pedidos',
});

Pedidos.belongsTo(Usuarios, {
	foreignKey: 'id_usuario',
	as: 'usuario',
});