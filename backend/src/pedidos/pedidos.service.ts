import { Injectable, BadRequestException, HttpException, NotFoundException, Logger } from '@nestjs/common';
import { client, Preference, mpMode } from '../mercadopago/mercadopago';
import { Op } from 'sequelize';
import { Direcciones } from 'src/auth/usuarios/direcciones/models/Direcciones';
import { Usuarios } from 'src/auth/models/Usuarios';
import { Productos } from 'src/productos/models/Productos';
import { Categorias } from 'src/categorias/models/Categorias';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';
import { Ciudades } from 'src/ciudades/models/Ciudades';
import { Provincias } from 'src/provincias/models/Provincias';
import { Pedidos } from './models/Pedidos';
import { DetallePedidos } from 'src/detallepedido/models/DetallePedidos';
import { CreatePedidoDto, DetallePedidoCreateDto } from './DTOs/createpedido.dto';
import { DetallePedidoResponseDto } from './DTOs/getpedido.dto';
import { Envios } from 'src/envios/models/Envios';
import { Pagos } from 'src/pagos/models/Pagos';
import { EstadoPedidos } from 'src/estadopedidos/models/EstadoPedidos';
import { EstadoEnvios } from 'src/estadoenvios/models/EstadoEnvios';
import { sendEmail } from 'src/utils/mail/smtp';
import { buildShippingStatusUpdateEmailContent } from 'src/utils/mail/templates/shipping-status-update.template';

@Injectable()
export class PedidosService {
    private readonly logger = new Logger(PedidosService.name);
    private readonly frontendBaseUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://tribaltrend.com.ar').replace(/\/$/, '');

    constructor(
        
    ) {}

    private buildPedidoInclude() {
        return [
            {
                model: DetallePedidos,
                as: 'detallePedidos',
                attributes: ['id', 'id_producto', 'subtotal', 'unidades'],
                include: [
                    {
                        model: Productos,
                        as: 'producto',
                        attributes: ['id', 'nombre', 'precio', 'id_categoria', 'id_subcategoria', 'ancho', 'alto', 'profundo'],
                        include: [
                            {
                                model: Categorias,
                                as: 'categoria',
                                attributes: ['id', 'nombre'],
                            },
                            {
                                model: Subcategorias,
                                as: 'subcategoria',
                                attributes: ['id', 'nombre'],
                            },
                        ],
                    },
                ],
            },
            {
                model: Envios,
                as: 'envio',
                attributes: ['id', 'id_estado_envio', 'ancho_paquete', 'alto_paquete', 'profundo_paquete', 'costo_envio', 'id_direccion'],
                include: [
                    {
                        model: EstadoEnvios,
                        as: 'estado_envio',
                        attributes: ['id', 'nombre'],
                    },
                    {
                        model: Direcciones,
                        as: 'direccion',
                        attributes: ['id', 'calle', 'altura', 'cod_postal_destino'],
                        include: [
                            {
                                model: Ciudades,
                                as: 'ciudad',
                                attributes: ['id', 'nombre'],
                            },
                            {
                                model: Provincias,
                                as: 'provincia',
                                attributes: ['id', 'nombre'],
                            },
                        ],
                    },
                ],
            },
            {
                model: Usuarios,
                as: 'usuario',
                attributes: ['id', 'nombre', 'email', 'telefono'],
            },
            {
                model: Pagos,
                as: 'pago',
                attributes: ['id', 'monto_total', 'fecha_pago', 'aprobado'],
            },
            {
                model: EstadoPedidos,
                as: 'estadoPedido',
                attributes: ['id', 'nombre'],
            },
        ];
    }

    private mapPedidoResponse(pedido: Pedidos, includeDetalles = false): DetallePedidoResponseDto {
        return {
            id: pedido.id,
            fecha_pedido: pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toISOString() : '',
            costo_total_productos: Number(pedido.costo_total_productos),
            costo_envio: Number(pedido.costo_envio),
            costo_ganancia_envio: Number(pedido.costo_ganancia_envio),
            usuario: {
                id: pedido.usuario?.id ?? 0,
                nombre: pedido.usuario?.nombre ?? '',
                email: pedido.usuario?.email ?? '',
                telefono: pedido.usuario?.telefono ?? '',
            },
            pago: {
                id: pedido.pago?.id ?? 0,
                monto_total: Number(pedido.pago?.monto_total ?? 0),
                fecha_pago: pedido.pago?.fecha_pago ? new Date(pedido.pago.fecha_pago).toISOString() : '',
                aprobado: Boolean(pedido.pago?.aprobado),
            },
            envio: {
                id: pedido.envio?.id ?? 0,
                ancho_paquete: Number(pedido.envio?.ancho_paquete ?? 0),
                alto_paquete: Number(pedido.envio?.alto_paquete ?? 0),
                profundo_paquete: Number(pedido.envio?.profundo_paquete ?? 0),
                estado_envio: {
                    id: pedido.envio?.estado_envio?.id ?? 0,
                    nombre: pedido.envio?.estado_envio?.nombre ?? '',
                },
                direccion: {
                    provincia: {
                        nombre: pedido.envio?.direccion?.provincia?.nombre ?? '',
                    },
                    ciudad: {
                        nombre: pedido.envio?.direccion?.ciudad?.nombre ?? '',
                    },
                    calle: pedido.envio?.direccion?.calle ?? '',
                    altura: pedido.envio?.direccion?.altura ?? '',
                    cod_postal_destino: pedido.envio?.direccion?.cod_postal_destino ?? '',
                },
            },
            detalles: includeDetalles
                ? (pedido.detallePedidos ?? []).map((detalle) => {
                    const precioUnitario = Number(detalle.unidades) > 0
                        ? Number(detalle.subtotal) / Number(detalle.unidades)
                        : 0;

                    return {
                        id: detalle.id,
                        id_producto: detalle.id_producto,
                        nombre_producto: detalle.producto?.nombre ?? '',
                        unidades: Number(detalle.unidades),
                        subtotal: Number(detalle.subtotal),
                        precio_unitario: Number(precioUnitario.toFixed(2)),
                        ancho_producto: Number(detalle.producto?.ancho ?? 0),
                        alto_producto: Number(detalle.producto?.alto ?? 0),
                        profundo_producto: Number(detalle.producto?.profundo ?? 0),
                        categoria: detalle.producto?.categoria
                            ? {
                                id: detalle.producto.categoria.id,
                                nombre: detalle.producto.categoria.nombre,
                            }
                            : null,
                        subcategoria: detalle.producto?.subcategoria
                            ? {
                                id: detalle.producto.subcategoria.id,
                                nombre: detalle.producto.subcategoria.nombre,
                            }
                            : null,
                    };
                })
                : undefined,
            estado_pedido: {
                id: pedido.estadoPedido?.id ?? 0,
                nombre: pedido.estadoPedido?.nombre ?? '',
            },
        };
    }

    async createPedido(createPedidoDto: CreatePedidoDto): Promise<string> {
        return this.handlePedidoAction('Error creating pedido', async () => {
            if (!createPedidoDto.detalles?.length) {
                throw new BadRequestException('El pedido debe tener al menos un producto');
            }

            const productoIds = [...new Set(createPedidoDto.detalles.map((detalle) => detalle.id_producto))];

            const [usuario, direccion, productos] = await Promise.all([
                Usuarios.findByPk(createPedidoDto.id_usuario, {
                    attributes: ['id', 'nombre', 'email', 'telefono'],
                }),
                Direcciones.findOne({
                    where: {
                        id: createPedidoDto.id_direccion,
                        id_usuario: createPedidoDto.id_usuario,
                    },
                    attributes: ['id', 'cod_postal_destino', 'calle', 'altura', 'id_provincia', 'id_ciudad'],
                    include: [
                        {
                            model: Ciudades,
                            as: 'ciudad',
                            attributes: ['nombre'],
                        },
                        {
                            model: Provincias,
                            as: 'provincia',
                            attributes: ['nombre'],
                        },
                    ],
                }),
                Productos.findAll({
                    where: {
                        id: {
                            [Op.in]: productoIds,
                        },
                    },
                    attributes: ['id', 'nombre', 'precio', 'id_categoria', 'id_subcategoria', 'ancho', 'alto', 'profundo', 'peso_gramos'],
                    include: [
                        {
                            model: Categorias,
                            as: 'categoria',
                            attributes: ['id', 'nombre'],
                        },
                        {
                            model: Subcategorias,
                            as: 'subcategoria',
                            attributes: ['id', 'nombre'],
                        },
                    ],
                }),
            ]);

            if (!usuario) {
                throw new BadRequestException('Usuario no encontrado');
            }

            if (!direccion) {
                throw new BadRequestException('Dirección no encontrada para el usuario');
            }

            if (productos.length !== productoIds.length) {
                const idsEncontrados = new Set(productos.map((producto) => producto.id));
                const idsFaltantes = productoIds.filter((idProducto) => !idsEncontrados.has(idProducto));
                throw new BadRequestException(`No se encontraron los productos con IDs: ${idsFaltantes.join(', ')}`);
            }

            const productosById = new Map(productos.map((producto) => [producto.id, producto]));

            const unidadesPorProducto = createPedidoDto.detalles.reduce((acumulado, detalle) => {
                const actual = acumulado.get(detalle.id_producto) ?? 0;
                acumulado.set(detalle.id_producto, actual + detalle.unidades);
                return acumulado;
            }, new Map<number, number>());

            const productosSinStock: string[] = [];
            for (const [idProducto, unidadesSolicitadas] of unidadesPorProducto.entries()) {
                const producto = productosById.get(idProducto);
                if (!producto || Number(producto.stock) < unidadesSolicitadas) {
                    const nombre = producto?.nombre ?? `ID ${idProducto}`;
                    const stockDisponible = Number(producto?.stock ?? 0);
                    productosSinStock.push(`${nombre} (solicitado: ${unidadesSolicitadas}, stock: ${stockDisponible})`);
                }
            }

            if (productosSinStock.length) {
                throw new BadRequestException(`Stock insuficiente para: ${productosSinStock.join(' | ')}`);
            }

            const productosMetadata = createPedidoDto.detalles.map((detalle: DetallePedidoCreateDto) => {
                const producto = productosById.get(detalle.id_producto);

                return {
                    id_producto: detalle.id_producto,
                    nombre: producto?.nombre ?? 'Producto Tribal Trend',
                    unidades: detalle.unidades,
                    subtotal: Number(detalle.subtotal),
                    precio_unitario: detalle.unidades > 0 ? Number(detalle.subtotal) / detalle.unidades : 0,
                    medidas: {
                        ancho: Number(detalle.ancho_producto),
                        alto: Number(detalle.alto_producto),
                        profundo: Number(detalle.profundo_producto),
                    },
                    categoria: producto?.categoria
                        ? {
                              id: producto.categoria.id,
                              nombre: producto.categoria.nombre,
                          }
                        : null,
                    subcategoria: producto?.subcategoria
                        ? {
                              id: producto.subcategoria.id,
                              nombre: producto.subcategoria.nombre,
                          }
                        : null,
                };
            });

            // 1. sumar el costo total del pedido
            const costo_total = createPedidoDto.costo_total_productos + createPedidoDto.costo_envio + createPedidoDto.costo_ganancia_envio;
            const costo_total_envio = Number(createPedidoDto.costo_envio) + Number(createPedidoDto.costo_ganancia_envio);

            const preference = await new Preference(client).create({
                body: {
                    items: [
                        ...createPedidoDto.detalles.map((detalle: DetallePedidoCreateDto) => {
                            const nombreProducto = productosById.get(detalle.id_producto)?.nombre ?? 'Producto Tribal Trend';
                            const subtotal = Number(detalle.subtotal);
                            const precioUnitario = detalle.unidades > 0 ? subtotal / detalle.unidades : 0;

                            return {
                                id: detalle.id_producto.toString(),
                                title: nombreProducto,
                                description: `Unidades: ${detalle.unidades} | Subtotal: $${subtotal.toFixed(2)}`,
                                quantity: detalle.unidades,
                                unit_price: precioUnitario,
                            };
                        }),
                        {
                            id: 'envio',
                            title: 'Envío y gestión',
                            description: `Subtotal: $${costo_total_envio.toFixed(2)}`,
                            quantity: 1,
                            unit_price: costo_total_envio,
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
                        integration_mode: mpMode,
                        usuario: {
                            id: usuario.id,
                            nombre: usuario.nombre,
                            username: usuario.username,
                            email: usuario.email,
                            telefono: usuario.telefono,
                            id_rol: usuario.id_rol,
                        },
                        pedido: {
                            id_usuario: createPedidoDto.id_usuario,
                            id_direccion: createPedidoDto.id_direccion,
                            costo_total_productos: Number(createPedidoDto.costo_total_productos),
                            costo_envio: Number(createPedidoDto.costo_envio),
                            costo_ganancia_envio: Number(createPedidoDto.costo_ganancia_envio),
                            costo_total,
                            total_productos_distintos: createPedidoDto.detalles.length,
                            total_unidades: createPedidoDto.detalles.reduce((acumulado, detalle) => acumulado + detalle.unidades, 0),
                        },
                        direccion_envio: {
                            id: direccion.id,
                            calle: direccion.calle,
                            altura: direccion.altura,
                            cod_postal_destino: direccion.cod_postal_destino,
                            ciudad: direccion.ciudad
                                ? {
                                      id: direccion.ciudad.id,
                                      nombre: direccion.ciudad.nombre,
                                  }
                                : null,
                            provincia: direccion.provincia
                                ? {
                                      id: direccion.provincia.id,
                                      nombre: direccion.provincia.nombre,
                                  }
                                : null,
                        },
                        productos: productosMetadata,
                        costo_total,
                    },
                },
            });

            return preference.init_point!;
        });
    }

    async getAllPedidosForAdmin(): Promise<DetallePedidoResponseDto[]> {
        const pedidos = await Pedidos.findAll({
            include: this.buildPedidoInclude(),
        });

        return pedidos.map((pedido) => this.mapPedidoResponse(pedido));
    }

    async getPedidoById(id: number): Promise<DetallePedidoResponseDto> {
        const pedido = await Pedidos.findByPk(id, {
            include: this.buildPedidoInclude(),
        });

        if (!pedido) {
            throw new NotFoundException('Pedido no encontrado');
        }

        return this.mapPedidoResponse(pedido, true);
    }

    async getAllPedidosForUser(id_usuario: number): Promise<DetallePedidoResponseDto[]> {
        const pedidos = await Pedidos.findAll({
            where: {
                id_usuario,
            },
            include: this.buildPedidoInclude(),
        });

        return pedidos.map((pedido) => this.mapPedidoResponse(pedido));
    }

    async updateEstadoPedido(id_pedido: number, id_estado_pedido: number): Promise<DetallePedidoResponseDto> {
        return this.handlePedidoAction('Error actualizando estado del pedido', async () => {
            const [pedido, estadoPedido] = await Promise.all([
                Pedidos.findByPk(id_pedido),
                EstadoPedidos.findByPk(id_estado_pedido),
            ]);

            if (!pedido) {
                throw new NotFoundException('Pedido no encontrado');
            }

            if (!estadoPedido) {
                throw new NotFoundException('Estado de pedido no encontrado');
            }

            await pedido.update({ id_estado_pedido });
            return this.getPedidoById(id_pedido);
        });
    }

    async updateEstadoEnvio(id_pedido: number, id_estado_envio: number): Promise<DetallePedidoResponseDto> {
        return this.handlePedidoAction('Error actualizando estado del envío', async () => {
            const [pedido, estadoEnvio] = await Promise.all([
                Pedidos.findByPk(id_pedido),
                EstadoEnvios.findByPk(id_estado_envio),
            ]);

            if (!pedido) {
                throw new NotFoundException('Pedido no encontrado');
            }

            if (!estadoEnvio) {
                throw new NotFoundException('Estado de envío no encontrado');
            }

            const cliente = await Usuarios.findByPk(pedido.id_usuario, {
                attributes: ['id', 'nombre', 'email'],
            });

            const envio = await Envios.findOne({ where: { id_pedido } });
            if (!envio) {
                throw new NotFoundException('Envío no encontrado para el pedido');
            }

            await envio.update({ id_estado_envio });
            await this.sendShippingStatusUpdateToClient({
                pedidoId: id_pedido,
                estadoEnvioNombre: estadoEnvio.nombre,
                clienteNombre: cliente?.nombre ?? `Cliente #${pedido.id_usuario}`,
                clienteEmail: cliente?.email,
            });

            return this.getPedidoById(id_pedido);
        });
    }

    private async sendShippingStatusUpdateToClient(params: {
        pedidoId: number;
        estadoEnvioNombre: string;
        clienteNombre: string;
        clienteEmail?: string;
    }): Promise<void> {
        const { pedidoId, estadoEnvioNombre, clienteNombre, clienteEmail } = params;

        if (!clienteEmail) {
            this.logger.warn(`No se envió email de estado de envío: cliente sin email. pedidoId=${pedidoId}`);
            return;
        }

        try {
            const { text, html } = buildShippingStatusUpdateEmailContent(
                {
                    pedidoId,
                    nombreCliente: clienteNombre,
                    estadoEnvio: estadoEnvioNombre,
                },
                this.frontendBaseUrl,
            );

            await sendEmail({
                to: clienteEmail,
                subject: `Actualización de envío de tu pedido #${pedidoId}`,
                text,
                html,
            });
        } catch (error) {
            this.logger.error(
                `Error enviando email de actualización de envío para pedidoId=${pedidoId}: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    private async handlePedidoAction<T>(fallbackMessage: string, action: () => Promise<T>): Promise<T> {
        try {
            return await action();
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(fallbackMessage);
        }
    }
}