import { Injectable, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { client } from '../mercadopago/mercadopago';
import { Payment as MPayment } from 'mercadopago';
import { MerchantOrder as MPMerchantOrder } from 'mercadopago';
import { sequelize } from 'src/database/database';
import { Transaction } from 'sequelize';
import { Pedidos } from 'src/domain/pedidos/models/Pedidos';
import { Pagos } from './models/Pagos';
import { DetallePedidos } from 'src/domain/detallepedido/models/DetallePedidos';
import { Envios } from 'src/domain/envios/models/Envios';
import { EstadoPedidos } from 'src/domain/estadopedidos/models/EstadoPedidos';
import { EstadoEnvios } from 'src/domain/estadoenvios/models/EstadoEnvios';
import { HistorialPedidos } from 'src/domain/historialpedidos/models/HistorialPedidos';
import { EstadoEncargos } from 'src/domain/estadoencargos/models/EstadoEncargos';
import { Encargos } from 'src/domain/encargos/models/Encargos';
import { HistorialEncargos } from 'src/domain/historialencargos/models/HistorialEncargos';
import { Productos } from 'src/domain/productos/models/Productos';
import { Disenos } from 'src/domain/disenos/models/Disenos';
import { Usuarios } from 'src/auth/models/Usuarios';
import { Direcciones } from 'src/auth/usuarios/direcciones/models/Direcciones';
import { sendEmail } from 'src/utils/mail/smtp';
import {
	NotificacionProducto,
	PurchaseNotificationContext,
	buildPurchaseNotificationContent,
} from 'src/utils/mail/templates/purchase-notification.template';
import {CorreoArgentinoService} from '../correoArgentino/correoArgentino.service';
import { provinceNameToCACode } from '../correoArgentino/utils/province-code-mapper';

interface MetadataProducto {
	id_producto: number;
	id_descuento?: number | null;
	nombre?: string;
	unidades: number;
	subtotal: number;
	medidas?: {
		ancho?: number;
		alto?: number;
		profundo?: number;
	};
	disenos_urls?: string[] | null;
}

interface PaymentMetadata {
	workflow_type?: 'pedido' | 'encargo';
	usuario?: {
		id?: number;
		nombre?: string;
		email?: string;
	};
	pedido?: {
		id_usuario?: number;
		id_direccion?: number;
		observaciones?: string | null;
		costo_total_productos?: number;
		costo_envio?: number;
		costo_ganancia_envio?: number;
		costo_total?: number;
	};
	encargo?: {
		id_encargo?: number;
		id_usuario?: number;
		id_direccion?: number;
		costo_envio?: number;
		costo_ganancia_envio?: number;
		costo_total?: number;
		ancho?: number;
		alto?: number;
		profundo?: number;
		peso_en_gramos?: number;
		ancho_paquete?: number;
		alto_paquete?: number;
		profundo_paquete?: number;
	};
	productos?: MetadataProducto[];
	costo_total?: number;
	correo_argentino?: {
        delivered_type?: string | null;
        product_type?: string | null;
        product_name?: string | null;
        price?: number | null;
    };
	direccion_envio?: {
        id?: number;
        calle?: string;
        altura?: string;
        cod_postal_destino?: string;
        ciudad?: { id?: number; nombre?: string } | null;
        provincia?: { id?: number; nombre?: string } | null;
    };
}

@Injectable()
export class PagosService {
	private readonly logger = new Logger(PagosService.name);
	private readonly adminUserId = 10;
	private readonly frontendBaseUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://tribaltrend.com.ar').replace(/\/$/, '');
	private paymentLockTableReadyPromise: Promise<void> | null = null;

	constructor(private readonly correoArgentinoService: CorreoArgentinoService) {}

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
			this.logger.debug(
				`[WebhookDebug] paymentId=${paymentId} metadataKeys=${Object.keys(metadata ?? {}).join(',') || 'none'} ` +
				`hasPedido=${Boolean(metadata?.pedido)} hasEncargo=${Boolean(metadata?.encargo)} workflow_type=${metadata?.workflow_type ?? 'N/A'}`,
			);
			const workflowType = this.resolvePaymentWorkflowType(metadata);
			this.logger.log(
				`[WebhookDebug] paymentId=${paymentId} workflowTypeResuelto=${workflowType} ` +
				`encargo.id_encargo=${metadata?.encargo?.id_encargo ?? 'N/A'} pedido.id_usuario=${metadata?.pedido?.id_usuario ?? 'N/A'}`,
			);
			if (workflowType === 'encargo') {
				this.logger.log(`[WebhookDebug] paymentId=${paymentId} iniciando processEncargoPayment`);
				await this.processEncargoPayment({
					paymentId,
					payment,
					metadata,
				});
				this.logger.log(`[WebhookDebug] paymentId=${paymentId} processEncargoPayment finalizado OK`);
				return;
			}

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
			const observaciones =
				typeof pedidoMetadata?.observaciones === 'string' && pedidoMetadata.observaciones.trim().length
					? pedidoMetadata.observaciones.trim()
					: null;
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
				const lockAcquired = await this.acquirePaymentProcessingLock(paymentId, transaction);
				if (!lockAcquired) {
					this.logger.warn(
						`Se omite procesamiento duplicado para paymentId=${paymentId} (ya procesado o en curso).`,
					);
					return;
				}

				this.logger.debug(`Paso 1/4 creando Pedido`);

				const pedido = await Pedidos.create(
					{
						id_usuario: usuarioId,
						fecha_pedido: new Date(),
						observaciones,
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
				this.logger.debug(
					`[PedidoWebhook] Creando HistorialPedidos. pedidoId=${pedido.id} id_estado=${pedido.id_estado_pedido} id_usuario=${pedido.id_usuario}`,
				);
				const historialPedido = await HistorialPedidos.create(
					{
						id_pedido: pedido.id,
						id_estado: pedido.id_estado_pedido,
						id_usuario: pedido.id_usuario,
					},
					{ transaction },
				);
				const historialPersistido = await HistorialPedidos.findByPk(historialPedido.id, { transaction });
				this.logger.log(
					`[PedidoWebhook] HistorialPedido creado. historialId=${historialPedido.id} pedidoId=${pedido.id} estado=${pedido.id_estado_pedido} verificado=${Boolean(historialPersistido)}`,
				);
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
						id_descuento:
							typeof detalle.id_descuento === 'number' && Number(detalle.id_descuento) > 0
								? Number(detalle.id_descuento)
								: null,
						unidades: Number(detalle.unidades),
						subtotal: Number(detalle.subtotal),
						disenos_urls: Array.isArray(detalle.disenos_urls) ? detalle.disenos_urls : null,
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

				const unidadesPorDiseno = detalles.reduce((acumulado, detalle) => {
					const idProducto = Number(detalle.id_producto);
					const disenosUrls = Array.isArray(detalle.disenos_urls) ? detalle.disenos_urls : [];
					for (const url of disenosUrls) {
						if (typeof url !== 'string' || !url.trim()) {
							continue;
						}
						const key = `${idProducto}||${url.trim()}`;
						const actual = acumulado.get(key) ?? { idProducto, url: url.trim(), unidades: 0 };
						actual.unidades += 1;
						acumulado.set(key, actual);
					}
					return acumulado;
				}, new Map<string, { idProducto: number; url: string; unidades: number }>());

				for (const { idProducto, url, unidades } of unidadesPorDiseno.values()) {
					const diseno = await Disenos.findOne({
						where: { id_producto: idProducto, url_foto: url },
						transaction,
						lock: transaction.LOCK.UPDATE,
					});

					if (!diseno) {
						throw new BadRequestException(`DiseÃ±o no encontrado para descontar stock. id_producto=${idProducto}`);
					}

					const stockDisenoActual = Number(diseno.stock ?? 0);
					if (stockDisenoActual < unidades) {
						throw new BadRequestException(
							`Stock insuficiente para diseÃ±o ${diseno.nombre} (id=${diseno.id}). stock=${stockDisenoActual}, requerido=${unidades}`,
						);
					}

					const nuevoStockDiseno = stockDisenoActual - unidades;
					await diseno.update({ stock: nuevoStockDiseno }, { transaction });
					this.logger.debug(
						`Stock de diseÃ±o actualizado. productoId=${idProducto} disenoId=${diseno.id} stockAnterior=${stockDisenoActual} unidadesDescontadas=${unidades} stockNuevo=${nuevoStockDiseno}`,
					);
				}

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

				// Paso 6/6: Importar envío a Correo Argentino
                const caMetadata = metadata.correo_argentino;
                if (caMetadata?.delivered_type && caMetadata?.product_type) {
                    try {
                        const direccionEnvio = metadata.direccion_envio;
                        // Calcular peso total sumando peso_gramos de cada producto × unidades
                        let pesoTotal = 0;
                        for (const [idProducto, unidades] of unidadesPorProducto.entries()) {
                            const prod = await Productos.findByPk(idProducto, {
                                attributes: ['peso_gramos'],
                                transaction,
                            });
                            pesoTotal += (Number(prod?.peso_gramos ?? 0)) * unidades;
                        }

                        await this.correoArgentinoService.import_order_to_CA({
                            customerId: '', // se resuelve internamente
                            extOrderId: `PED-${pedido.id}`,
                            orderNumber: `#${pedido.id}`,
                            recipient: {
                                name: String(metadata.usuario?.nombre ?? ''),
                                email: String(metadata.usuario?.email ?? ''),
                            },
                            shipping: {
                                deliveryType: caMetadata.delivered_type,
                                productType: caMetadata.product_type,
                                weight: pesoTotal || 500,
                                declaredValue: costoTotalProductos,
                                height: altoPaquete,
                                length: profundoPaquete,
                                width: anchoPaquete,
                                address: {
                                    streetName: direccionEnvio?.calle,
                                    streetNumber: direccionEnvio?.altura,
                                    city: direccionEnvio?.ciudad?.nombre,
                                    provinceCode: provinceNameToCACode(direccionEnvio?.provincia?.nombre ?? ''),
                                    postalCode: direccionEnvio?.cod_postal_destino,
                                },
                            },
                        });
                        this.logger.log(`Envío importado a CA para pedidoId=${pedido.id}`);
                    } catch (caError) {
                        // No romper el flujo si CA falla — el pedido ya está pago
                        this.logger.error(
                            `Error importando envío a CA para pedidoId=${pedido.id}: ${
                                caError instanceof Error ? caError.message : String(caError)
                            }`,
                        );
                    }
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

	async receiveMerchantOrderNotification(merchantOrderId: string) {
		try {
			this.logger.log(`Webhook merchant_order recibido. merchantOrderId=${merchantOrderId}`);

			const merchantOrderResponse = await new MPMerchantOrder(client).get({ merchantOrderId });
			const merchantOrder = JSON.parse(JSON.stringify(merchantOrderResponse)) as {
				id?: string | number;
				payments?: Array<{ id?: string | number; status?: string }>;
			};

			const paymentIds = (merchantOrder.payments ?? [])
				.map((payment) => {
					const id = payment?.id;
					if (id === undefined || id === null) {
						return null;
					}

					return String(id);
				})
				.filter((id): id is string => Boolean(id));

			if (!paymentIds.length) {
				this.logger.warn(
					`merchant_order sin pagos asociados. merchantOrderId=${merchantOrderId} payload=${JSON.stringify(merchantOrder)}`,
				);
				return;
			}

			this.logger.log(
				`[WebhookDebug] merchantOrderId=${merchantOrderId} pagosDetectados=${paymentIds.length} ` +
				`detallePagos=${JSON.stringify((merchantOrder.payments ?? []).map((payment) => ({ id: payment?.id, status: payment?.status })) )}`,
			);

			for (const paymentId of paymentIds) {
				this.logger.log(`[WebhookDebug] merchantOrderId=${merchantOrderId} procesando paymentId=${paymentId}`);
				await this.receivePaymentNotification(paymentId);
			}
		} catch (error) {
			this.logger.error(
				`Fallo al procesar webhook merchant_order=${merchantOrderId}. error=${
					error instanceof Error ? error.message : String(error)
				}`,
				error instanceof Error ? error.stack : undefined,
			);

			if (error instanceof HttpException) {
				throw error;
			}

			throw new BadRequestException(
				error instanceof Error
					? `Error processing merchant order notification: ${error.message}`
					: 'Error processing merchant order notification',
			);
		}
	}

	private ensurePaymentLockTableReady(): Promise<void> {
		if (!this.paymentLockTableReadyPromise) {
			this.paymentLockTableReadyPromise = sequelize
				.query(
					`CREATE TABLE IF NOT EXISTS WebhookPaymentLocks (
						payment_id VARCHAR(64) NOT NULL,
						created_at DATETIME NOT NULL,
						PRIMARY KEY (payment_id)
					) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
				)
				.then(() => undefined)
				.catch((error) => {
					this.paymentLockTableReadyPromise = null;
					throw error;
				});
		}

		return this.paymentLockTableReadyPromise;
	}

	private async acquirePaymentProcessingLock(paymentId: string, transaction: Transaction): Promise<boolean> {
		await this.ensurePaymentLockTableReady();

		try {
			await sequelize.query(
				`INSERT INTO WebhookPaymentLocks (payment_id, created_at) VALUES (:paymentId, NOW())`,
				{
					replacements: { paymentId },
					transaction,
				},
			);
			return true;
		} catch (error) {
			if (this.isDuplicateEntryError(error)) {
				return false;
			}

			throw error;
		}
	}

	private isDuplicateEntryError(error: unknown): boolean {
		if (!error || typeof error !== 'object') {
			return false;
		}

		const dbError = error as {
			name?: string;
			parent?: { code?: string; errno?: number };
			original?: { code?: string; errno?: number };
		};

		const parentCode = dbError.parent?.code ?? dbError.original?.code;
		const parentErrno = dbError.parent?.errno ?? dbError.original?.errno;

		return parentCode === 'ER_DUP_ENTRY' || parentErrno === 1062;
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

	private resolvePaymentWorkflowType(metadata: PaymentMetadata): 'pedido' | 'encargo' {
		if (metadata.workflow_type === 'encargo' || metadata.encargo?.id_encargo) {
			return 'encargo';
		}

		return 'pedido';
	}

	private async processEncargoPayment(params: {
		paymentId: string;
		payment: {
			date_approved?: string;
			transaction_amount?: number;
		};
		metadata: PaymentMetadata;
	}): Promise<void> {
		const { paymentId, payment, metadata } = params;
		const encargoMetadata = metadata.encargo;

		try {
			this.logger.debug(
				`[EncargoWebhook] paymentId=${paymentId} metadata.encargo=${JSON.stringify(encargoMetadata ?? {})} metadata.usuario=${JSON.stringify(metadata.usuario ?? {})}`,
			);

			const idEncargo = Number(encargoMetadata?.id_encargo);
			const idDireccion = Number(encargoMetadata?.id_direccion);
			const rawUsuarioIdMetadata = encargoMetadata?.id_usuario ?? metadata.usuario?.id;
			const usuarioIdMetadata = rawUsuarioIdMetadata !== undefined && rawUsuarioIdMetadata !== null
				? Number(rawUsuarioIdMetadata)
				: null;

			this.logger.log(
				`[EncargoWebhook] paymentId=${paymentId} parseIds idEncargo=${idEncargo || 'N/A'} idDireccion=${idDireccion || 'N/A'} usuarioIdMetadata=${usuarioIdMetadata ?? 'N/A'}`,
			);

			if (!idEncargo || !idDireccion) {
				this.logger.error(
					`[EncargoWebhook] paymentId=${paymentId} metadata incompleta. encargoMetadata=${JSON.stringify(encargoMetadata ?? {})}`,
				);
				throw new BadRequestException('Metadata de encargo incompleta para registrar pago/envío');
			}

			const estadoEncargoPagado = await this.findEstadoEncargoByPriority([
				'Pagado',
			]);

			const estadoEnvioPendiente = await this.findEnvioStateByPriority([
				'Pendiente',
				'En preparación',
				'En preparacion',
			]);

			this.logger.log(
				`[EncargoWebhook] paymentId=${paymentId} estados resueltos estadoEncargoPagado=${estadoEncargoPagado?.id ?? 'N/A'} estadoEnvioPendiente=${estadoEnvioPendiente?.id ?? 'N/A'}`,
			);

			if (!estadoEncargoPagado || !estadoEnvioPendiente) {
				throw new BadRequestException('No se encontraron estados de encargo/envío configurados en BD');
			}

			const costoEnvio = Number(encargoMetadata?.costo_envio ?? 0);
			const costoGananciaEnvio = Number(encargoMetadata?.costo_ganancia_envio ?? 0);
			const montoTotalPago = Number(
				encargoMetadata?.costo_total ?? metadata.costo_total ?? payment.transaction_amount ?? 0,
			);
			const anchoPaquete = Number(encargoMetadata?.ancho ?? encargoMetadata?.ancho_paquete ?? 0);
			const altoPaquete = Number(encargoMetadata?.alto ?? encargoMetadata?.alto_paquete ?? 0);
			const profundoPaquete = Number(encargoMetadata?.profundo ?? encargoMetadata?.profundo_paquete ?? 0);

			this.logger.debug(
				`[EncargoWebhook] paymentId=${paymentId} montos/medidas montoTotalPago=${montoTotalPago} costoEnvio=${costoEnvio} costoGananciaEnvio=${costoGananciaEnvio} ancho=${anchoPaquete} alto=${altoPaquete} profundo=${profundoPaquete}`,
			);

			await sequelize.transaction(async (transaction) => {
				this.logger.log(`[EncargoWebhook] paymentId=${paymentId} transaction start`);
				const lockAcquired = await this.acquirePaymentProcessingLock(paymentId, transaction);
				if (!lockAcquired) {
					this.logger.warn(
						`[EncargoWebhook] paymentId=${paymentId} lock duplicado (ya procesado o en curso)`,
					);
					return;
				}

				this.logger.debug(`[EncargoWebhook] paymentId=${paymentId} lock adquirido`);

				const encargo = await Encargos.findByPk(idEncargo, {
					transaction,
					lock: transaction.LOCK.UPDATE,
				});

				if (!encargo) {
					throw new BadRequestException(`Encargo no encontrado para paymentId=${paymentId}`);
				}

				this.logger.debug(
					`[EncargoWebhook] paymentId=${paymentId} encargo encontrado id=${encargo.id} id_usuario=${encargo.id_usuario} id_estado_actual=${encargo.id_estado} id_direccion=${encargo.id_direccion}`,
				);

				if (usuarioIdMetadata !== null && Number(encargo.id_usuario) !== usuarioIdMetadata) {
					throw new BadRequestException('El usuario del pago no coincide con el dueño del encargo');
				}

				const direccion = await Direcciones.findOne({
					where: {
						id: idDireccion,
						id_usuario: encargo.id_usuario,
					},
					transaction,
					lock: transaction.LOCK.UPDATE,
				});

				if (!direccion) {
					throw new BadRequestException('Dirección inválida para el encargo pagado');
				}

				this.logger.debug(
					`[EncargoWebhook] paymentId=${paymentId} direccion validada id=${direccion.id} usuario=${encargo.id_usuario}`,
				);

				await encargo.update(
					{
						id_estado: estadoEncargoPagado.id,
					},
					{ transaction },
				);
				this.logger.log(
					`[EncargoWebhook] paymentId=${paymentId} encargo actualizado id=${encargo.id} nuevo_estado=${estadoEncargoPagado.id}`,
				);

				const historial = await HistorialEncargos.create(
					{
						id_encargo: encargo.id,
						id_estado: estadoEncargoPagado.id,
						id_usuario: encargo.id_usuario,
					},
					{ transaction },
				);
				this.logger.log(
					`[EncargoWebhook] paymentId=${paymentId} historial creado id=${historial.id} encargo=${encargo.id}`,
				);

				const pago = await Pagos.create(
					{
						monto_total: montoTotalPago,
						fecha_pago: payment.date_approved ? new Date(payment.date_approved) : new Date(),
						aprobado: true,
						id_pedido: null,
						id_encargo: encargo.id,
						es_activo: true,
					},
					{ transaction },
				);
				this.logger.log(
					`[EncargoWebhook] paymentId=${paymentId} pago creado id=${pago.id} id_encargo=${encargo.id} monto=${montoTotalPago}`,
				);

				const envio = await Envios.create(
					{
						id_pedido: null,
						id_encargo: encargo.id,
						id_estado_envio: estadoEnvioPendiente.id,
						ancho_paquete: anchoPaquete,
						alto_paquete: altoPaquete,
						profundo_paquete: profundoPaquete,
						costo_envio: costoEnvio + costoGananciaEnvio,
						id_direccion: idDireccion,
						id_envio_CA: null as unknown as number,
						es_activo: true,
					},
					{ transaction },
				);
				this.logger.log(
					`[EncargoWebhook] paymentId=${paymentId} envio creado id=${envio.id} id_encargo=${encargo.id} id_estado_envio=${estadoEnvioPendiente.id}`,
				);

				this.logger.log(`Transacción OK encargo. paymentId=${paymentId} encargoId=${encargo.id}`);
			});

			this.logger.log(`[EncargoWebhook] paymentId=${paymentId} transaction commit OK`);
		} catch (error) {
			this.logger.error(
				`[EncargoWebhook] paymentId=${paymentId} fallo en processEncargoPayment. error=${error instanceof Error ? error.message : String(error)}`,
				error instanceof Error ? error.stack : undefined,
			);
			this.logger.error(
				`[EncargoWebhook] paymentId=${paymentId} detalleError=${this.buildErrorDetails(error)} metadata=${JSON.stringify(metadata ?? {})}`,
			);
			throw error;
		}
	}

	private async findEstadoEncargoByPriority(nombres: string[]): Promise<EstadoEncargos | null> {
		for (const nombre of nombres) {
			const estado = await EstadoEncargos.findOne({ where: { nombre, esActivo: true } });
			if (estado) {
				return estado;
			}
		}

		const activos = await EstadoEncargos.findAll({ where: { esActivo: true } });
		const fallback = activos.find((estado) => {
			const nombre = String(estado.nombre ?? '').toLowerCase();
			return nombre.includes('pagad') || nombre.includes('abonad') || nombre.includes('pago');
		});

		if (fallback) {
			return fallback;
		}

		return null;
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
