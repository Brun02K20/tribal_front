import { Injectable, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { client } from '../mercadopago/mercadopago';
import { Payment as MPayment } from 'mercadopago';
import { sequelize } from 'src/database/database';
import { Pedidos } from 'src/pedidos/models/Pedidos';
import { Pagos } from './models/Pagos';
import { DetallePedidos } from 'src/detallepedido/models/DetallePedidos';
import { Envios } from 'src/envios/models/Envios';
import { EstadoPedidos } from 'src/estadopedidos/models/EstadoPedidos';
import { EstadoEnvios } from 'src/estadoenvios/models/EstadoEnvios';
import { Productos } from 'src/productos/models/Productos';
import { Usuarios } from 'src/auth/models/Usuarios';
import { sendEmail } from 'src/utils/mail/smtp';
import {
	NotificacionProducto,
	PurchaseNotificationContext,
	buildPurchaseNotificationContent,
} from 'src/utils/mail/templates/purchase-notification.template';

interface MetadataProducto {
	id_producto: number;
	nombre?: string;
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
		nombre?: string;
		email?: string;
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
	private readonly logger = new Logger(PagosService.name);
	private readonly adminUserId = 10;
	private readonly frontendBaseUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://tribaltrend.com.ar').replace(/\/$/, '');

	// aca es donde se recibe la notificacion de pago de mercado pago, y se procesa el pago
	// esta ruta debe ser la misma que se configura en el webhook de mercado pago

	// Adicionalmente, aca es donde se va a crear el pedido en la base de datos, descontar el stock del producto, etc
	// crear el pago, el envio, el pedido, etc
	async receivePaymentNotification(paymentId: string) {
		try {
			this.logger.log(`Webhook recibido. paymentId=${paymentId}`);

			const res = await new MPayment(client).get({ id: paymentId });
			const payment = JSON.parse(JSON.stringify(res));
			this.logger.log(
				`Pago consultado en MP. id=${payment.id} status=${payment.status} status_detail=${payment.status_detail ?? 'N/A'}`,
			);
			this.logger.debug(
				`Pago MP resumen. transaction_amount=${payment.transaction_amount ?? 'N/A'} date_approved=${payment.date_approved ?? 'N/A'} external_reference=${payment.external_reference ?? 'N/A'}`,
			);

			if (payment.status !== 'approved') {
				this.logger.warn(
					`Se omite procesamiento porque status=${payment.status}. paymentId=${paymentId}`,
				);
				return;
			}

			const metadata = (payment.metadata ?? {}) as PaymentMetadata;
			const pedidoMetadata = metadata.pedido;
			const usuarioId = Number(pedidoMetadata?.id_usuario ?? metadata.usuario?.id);
			const direccionId = Number(pedidoMetadata?.id_direccion);
			const detalles = Array.isArray(metadata.productos) ? metadata.productos : [];
			const productNamesById = new Map<number, string>();
			let pedidoCreadoId: number | null = null;

			this.logger.log(
				`Metadata parseada. usuarioId=${usuarioId} direccionId=${direccionId} cantidad_detalles=${detalles.length}`,
			);
			this.logger.debug(`Metadata completa=${JSON.stringify(metadata)}`);

			if (!usuarioId || !direccionId || !detalles.length) {
				this.logger.error(
					`Metadata incompleta. metadata=${JSON.stringify(metadata)}`,
				);
				throw new BadRequestException('Metadata de pago incompleta para registrar pedido/pago/envio');
			}

			const estadoPedidoAprobado = await this.findPedidoStateByPriority([
				'Aprobado',
				'Pagado',
				'Pendiente',
			]);

			const estadoEnvioPendiente = await this.findEnvioStateByPriority([
				'Pendiente',
				'En preparación',
				'En preparacion',
			]);

			if (!estadoPedidoAprobado || !estadoEnvioPendiente) {
				this.logger.error(
					`Estados faltantes. estadoPedidoAprobado=${estadoPedidoAprobado?.id ?? 'null'} estadoEnvioPendiente=${estadoEnvioPendiente?.id ?? 'null'}`,
				);
				throw new BadRequestException('No se encontraron estados de pedido/envío configurados en BD');
			}

			const costoTotalProductos = Number(pedidoMetadata?.costo_total_productos ?? 0);
			const costoEnvio = Number(pedidoMetadata?.costo_envio ?? 0);
			const costoGananciaEnvio = Number(pedidoMetadata?.costo_ganancia_envio ?? 0);
            const montoTotalPago = Number(
                pedidoMetadata?.costo_total ?? metadata.costo_total ?? payment.transaction_amount ?? 0,
            );

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

			this.logger.debug(
				`Montos y medidas calculadas. costoTotalProductos=${costoTotalProductos} costoEnvio=${costoEnvio} costoGananciaEnvio=${costoGananciaEnvio} montoTotalPago=${montoTotalPago} anchoPaquete=${anchoPaquete} altoPaquete=${altoPaquete} profundoPaquete=${profundoPaquete}`,
			);

			await sequelize.transaction(async (transaction) => {
				this.logger.log(`Iniciando transacción de persistencia para paymentId=${paymentId}`);
				this.logger.debug(`Paso 1/4 creando Pedido`);

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

				this.logger.debug(`Pedido creado. pedidoId=${pedido.id}`);
				pedidoCreadoId = pedido.id;
				this.logger.debug(`Paso 2/4 creando Pago`);

				await Pagos.create(
					{
						monto_total: montoTotalPago,
						fecha_pago: payment.date_approved ? new Date(payment.date_approved) : new Date(),
						aprobado: true,
						id_pedido: pedido.id,
						es_activo: true,
					},
					{ transaction },
				);

				this.logger.debug(`Pago creado para pedidoId=${pedido.id}`);
				this.logger.debug(`Paso 3/4 creando DetallePedidos. cantidad=${detalles.length}`);

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

				this.logger.debug(`DetallePedidos creados para pedidoId=${pedido.id}`);
				this.logger.debug(`Paso 4/4 creando Envio`);

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

				this.logger.debug(`Envio creado para pedidoId=${pedido.id}`);

				this.logger.debug(`Paso 5/5 descontando stock de productos`);

				const unidadesPorProducto = detalles.reduce((acumulado, detalle) => {
					const idProducto = Number(detalle.id_producto);
					const unidades = Number(detalle.unidades);
					const actual = acumulado.get(idProducto) ?? 0;
					acumulado.set(idProducto, actual + unidades);
					return acumulado;
				}, new Map<number, number>());

				for (const [idProducto, unidadesDescontar] of unidadesPorProducto.entries()) {
					const producto = await Productos.findByPk(idProducto, { transaction, lock: transaction.LOCK.UPDATE });

					if (!producto) {
						throw new BadRequestException(`Producto no encontrado para descontar stock. id_producto=${idProducto}`);
					}

					const stockActual = Number(producto.stock ?? 0);
					productNamesById.set(idProducto, producto.nombre);
					if (stockActual < unidadesDescontar) {
						throw new BadRequestException(
							`Stock insuficiente al confirmar pago para producto ${producto.nombre} (id=${idProducto}). stock=${stockActual}, requerido=${unidadesDescontar}`,
						);
					}

					const nuevoStock = stockActual - unidadesDescontar;
					await producto.update({ stock: nuevoStock }, { transaction });
					this.logger.debug(
						`Stock actualizado. productoId=${idProducto} stockAnterior=${stockActual} unidadesDescontadas=${unidadesDescontar} stockNuevo=${nuevoStock}`,
					);
				}

				this.logger.log(`Transacción OK. paymentId=${paymentId} pedidoId=${pedido.id}`);
			});

			if (pedidoCreadoId) {
				const productosNotificacion = detalles.map((detalle) => ({
					nombre:
						productNamesById.get(Number(detalle.id_producto)) ??
						detalle.nombre ??
						`Producto #${Number(detalle.id_producto)}`,
					unidades: Number(detalle.unidades),
					subtotal: Number(detalle.subtotal),
				}));

				await this.sendPurchaseNotifications({
					pedidoId: pedidoCreadoId,
					usuarioId,
					nombreCliente: String(metadata.usuario?.nombre ?? ''),
					emailCliente: String(metadata.usuario?.email ?? ''),
					productos: productosNotificacion,
					costoTotalProductos,
					costoEnvio,
					costoGananciaEnvio,
					montoTotalPago,
				});
			}
		} catch (error) {
			const errorDetails = this.buildErrorDetails(error);
			this.logger.error(
				`Fallo al procesar webhook paymentId=${paymentId}. error=${
					error instanceof Error ? error.message : String(error)
				}`,
				error instanceof Error ? error.stack : undefined,
			);
			this.logger.error(`Detalle técnico error paymentId=${paymentId}: ${errorDetails}`);

			if (error instanceof HttpException) {
				throw error;
			}
			throw new BadRequestException(
				error instanceof Error
					? `Error processing payment notification: ${error.message}`
					: 'Error processing payment notification',
			);
		}
	}

	private buildErrorDetails(error: unknown): string {
		if (!error || typeof error !== 'object') {
			return String(error);
		}

		const errorObject = error as {
			name?: string;
			message?: string;
			code?: string;
			errors?: Array<{ message?: string; path?: string; validatorKey?: string }>;
			parent?: {
				code?: string;
				errno?: number;
				sqlState?: string;
				sqlMessage?: string;
				sql?: string;
			};
			original?: {
				code?: string;
				errno?: number;
				sqlState?: string;
				sqlMessage?: string;
				sql?: string;
			};
		};

		const validationDetails =
			errorObject.errors?.map((item) => ({ message: item.message, path: item.path, validatorKey: item.validatorKey })) ?? [];

		return JSON.stringify({
			name: errorObject.name,
			message: errorObject.message,
			code: errorObject.code,
			validationDetails,
			parent: errorObject.parent,
			original: errorObject.original,
		});
	}

	private async findPedidoStateByPriority(nombres: string[]): Promise<EstadoPedidos | null> {
		for (const nombre of nombres) {
			const estado = await EstadoPedidos.findOne({ where: { nombre } });
			if (estado) {
				return estado;
			}
		}

		return EstadoPedidos.findOne({ order: [['id', 'ASC']] });
	}

	private async findEnvioStateByPriority(nombres: string[]): Promise<EstadoEnvios | null> {
		for (const nombre of nombres) {
			const estado = await EstadoEnvios.findOne({ where: { nombre } });
			if (estado) {
				return estado;
			}
		}

		return EstadoEnvios.findOne({ order: [['id', 'ASC']] });
	}

	private async sendPurchaseNotifications(context: PurchaseNotificationContext): Promise<void> {
		try {
			const [adminUser, clienteDb] = await Promise.all([
				Usuarios.findByPk(this.adminUserId),
				Usuarios.findByPk(context.usuarioId),
			]);

			const emailClienteFinal = clienteDb?.email ?? context.emailCliente;
			const nombreClienteFinal = clienteDb?.nombre ?? context.nombreCliente ?? `Usuario #${context.usuarioId}`;

			const finalContext: PurchaseNotificationContext = {
				...context,
				emailCliente: emailClienteFinal,
				nombreCliente: nombreClienteFinal,
			};

			const { text: bodyText, html: bodyHtml } = buildPurchaseNotificationContent(finalContext, this.frontendBaseUrl);

			if (adminUser?.email) {
				await sendEmail({
					to: adminUser.email,
					subject: `Nueva compra registrada #${finalContext.pedidoId}`,
					text: bodyText,
					html: bodyHtml,
				});
				this.logger.log(`Email de nueva compra enviado al admin. pedidoId=${finalContext.pedidoId}`);
			} else {
				this.logger.warn(`No se pudo enviar email al admin (id=${this.adminUserId}) por falta de email.`);
			}

			if (emailClienteFinal) {
				await sendEmail({
					to: emailClienteFinal,
					subject: `Confirmación de compra #${finalContext.pedidoId}`,
					text: bodyText,
					html: bodyHtml,
				});
				this.logger.log(`Email de confirmación enviado al cliente. pedidoId=${finalContext.pedidoId} usuarioId=${finalContext.usuarioId}`);
			} else {
				this.logger.warn(`No se pudo enviar email al cliente por falta de email. usuarioId=${finalContext.usuarioId}`);
			}
		} catch (error) {
			this.logger.error(
				`Error enviando emails de compra para pedidoId=${context.pedidoId}: ${
					error instanceof Error ? error.message : String(error)
				}`,
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
}
