import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { client, Preference, mpMode } from '../mercadopago/mercadopago';
import { Payment as MPayment } from 'mercadopago';
import { sequelize } from 'src/database/database';
import { Pedidos } from 'src/pedidos/models/Pedidos';
import { Pagos } from './models/Pagos';
import { DetallePedidos } from 'src/detallepedido/models/DetallePedidos';
import { Envios } from 'src/envios/models/Envios';
import { EstadoPedidos } from 'src/estadopedidos/models/EstadoPedidos';
import { EstadoEnvios } from 'src/estadoenvios/models/EstadoEnvios';

interface MetadataProducto {
	id_producto: number;
	unidades: number;
	subtotal: number;
	medidas?: {
		ancho?: number;
		alto?: number;
		profundo?: number;
	};
}

interface PaymentMetadata {
	usuario?: {
		id?: number;
	};
	pedido?: {
		id_usuario?: number;
		id_direccion?: number;
		costo_total_productos?: number;
		costo_envio?: number;
		costo_ganancia_envio?: number;
		costo_total?: number;
	};
	productos?: MetadataProducto[];
	costo_total?: number;
}

@Injectable()
export class PagosService {
	async buyProductWithMercadoPago(
		guest_id: number,
		product_id: number,
	): Promise<string> {
		const preference = await new Preference(client).create({
			body: {
				items: [
					{
						id: product_id.toString(),
						title: 'Producto Tribal Trend',
						quantity: 1,
						unit_price: 50,
					},
				],
				back_urls: {
					success: 'https://tribaltrend.com.ar/login',
					failure: 'https://tribaltrend.com.ar/',
					pending: 'https://tribaltrend.com.ar/',
				},
				auto_return: 'approved',
				metadata: {
					status: 'pending',
					guest_id,
					product_id,
					integration_mode: mpMode,
				},
			},
		});

		return preference.init_point!;
	}

	// aca es donde se recibe la notificacion de pago de mercado pago, y se procesa el pago
	// esta ruta debe ser la misma que se configura en el webhook de mercado pago

	// Adicionalmente, aca es donde se va a crear el pedido en la base de datos, descontar el stock del producto, etc
	// crear el pago, el envio, el pedido, etc
	async receivePaymentNotification(paymentId: string) {
		try {
			const res = await new MPayment(client).get({ id: paymentId });
			const payment = JSON.parse(JSON.stringify(res));

			if (payment.status !== 'approved') {
				return;
			}

			const metadata = (payment.metadata ?? {}) as PaymentMetadata;
			const pedidoMetadata = metadata.pedido;
			const usuarioId = Number(pedidoMetadata?.id_usuario ?? metadata.usuario?.id);
			const direccionId = Number(pedidoMetadata?.id_direccion);
			const detalles = Array.isArray(metadata.productos) ? metadata.productos : [];

			if (!usuarioId || !direccionId || !detalles.length) {
				throw new BadRequestException('Metadata de pago incompleta para registrar pedido/pago/envio');
			}

			const estadoPedidoAprobado =
				(await EstadoPedidos.findOne({ where: { nombre: 'Aprobado' } })) ??
				(await EstadoPedidos.findOne({ where: { nombre: 'Pagado' } })) ??
				(await EstadoPedidos.findOne({ where: { nombre: 'Pendiente' } })) ??
				(await EstadoPedidos.findOne({ order: [['id', 'ASC']] }));

			const estadoEnvioPendiente =
				(await EstadoEnvios.findOne({ where: { nombre: 'Pendiente' } })) ??
				(await EstadoEnvios.findOne({ where: { nombre: 'En preparación' } })) ??
				(await EstadoEnvios.findOne({ where: { nombre: 'En preparacion' } })) ??
				(await EstadoEnvios.findOne({ order: [['id', 'ASC']] }));

			if (!estadoPedidoAprobado || !estadoEnvioPendiente) {
				throw new BadRequestException('No se encontraron estados de pedido/envío configurados en BD');
			}

			const costoTotalProductos = Number(pedidoMetadata?.costo_total_productos ?? 0);
			const costoEnvio = Number(pedidoMetadata?.costo_envio ?? 0);
			const costoGananciaEnvio = Number(pedidoMetadata?.costo_ganancia_envio ?? 0);

			const anchoPaquete = detalles.reduce((max, detalle) => {
				const valor = Number(detalle.medidas?.ancho ?? 0);
				return valor > max ? valor : max;
			}, 0);

			const altoPaquete = detalles.reduce((max, detalle) => {
				const valor = Number(detalle.medidas?.alto ?? 0);
				return valor > max ? valor : max;
			}, 0);

			const profundoPaquete = detalles.reduce((total, detalle) => {
				const valor = Number(detalle.medidas?.profundo ?? 0);
				return total + valor;
			}, 0);

			await sequelize.transaction(async (transaction) => {
				const pedido = await Pedidos.create(
					{
						id_usuario: usuarioId,
						fecha_pedido: new Date(),
						costo_total_productos: costoTotalProductos,
						costo_envio: costoEnvio,
						costo_ganancia_envio: costoGananciaEnvio,
						id_estado_pedido: estadoPedidoAprobado.id,
						es_activo: true,
					},
					{ transaction },
				);

				await Pagos.create(
					{
						monto_total: Number(pedidoMetadata?.costo_total ?? metadata.costo_total ?? payment.transaction_amount ?? 0),
						fecha_pago: payment.date_approved ? new Date(payment.date_approved) : new Date(),
						aprobado: true,
						id_pedido: pedido.id,
						es_activo: true,
					},
					{ transaction },
				);

				await DetallePedidos.bulkCreate(
					detalles.map((detalle) => ({
						id_pedido: pedido.id,
						id_producto: Number(detalle.id_producto),
						unidades: Number(detalle.unidades),
						subtotal: Number(detalle.subtotal),
						es_activo: true,
					})),
					{ transaction },
				);

				await Envios.create(
					{
						id_pedido: pedido.id,
						id_estado_envio: estadoEnvioPendiente.id,
						ancho_paquete: anchoPaquete,
						alto_paquete: altoPaquete,
						profundo_paquete: profundoPaquete,
						costo_envio: costoEnvio,
						id_direccion: direccionId,
						id_envio_CA: null as unknown as number,
						es_activo: true,
					},
					{ transaction },
				);
			});
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new BadRequestException('Error processing payment notification');
		}
	}
}
