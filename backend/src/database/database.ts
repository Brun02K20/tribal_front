import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const dialect = process.env.BD_DIALECT ?? 'mysql';
const host = process.env.BD_HOST_ET;
const username = process.env.BD_USERNAME_ET;
const password = process.env.BD_PASSWORD_ET;
const database = process.env.BD_DATABASE_ET;

if (!host || !username || !password || !database) {
	throw new Error('Faltan variables de entorno de base de datos en el archivo .env');
}

export const sequelize = new Sequelize(database, username, password, {
	host,
	dialect: dialect as 'mysql',
	logging: false,
	define: {
		timestamps: false,
		freezeTableName: true,
	},
});

export const connectToDatabase = async (): Promise<void> => {
	await sequelize.authenticate();
};
