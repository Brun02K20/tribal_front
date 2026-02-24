// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
dotenv.config();
// Agrega credenciales
const productionAccessToken = process.env.MP_PRODUCTION_ACCESS_TOKEN;
const testAccessToken = process.env.MP_ACCESS_TOKEN;
const accessToken = productionAccessToken || testAccessToken;
console.log('MP Access Token mode:' + (productionAccessToken ? 'production' : 'test'));
export const mpMode = productionAccessToken ? 'production' : 'test';

if (!accessToken) {
	throw new Error(
		'Falta configurar MP_PRODUCTION_ACCESS_TOKEN o MP_ACCESS_TOKEN en variables de entorno.',
	);
}

export const client = new MercadoPagoConfig({ accessToken });

export { Preference };