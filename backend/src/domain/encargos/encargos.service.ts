import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Preference, client, mpMode } from 'src/domain/mercadopago/mercadopago';
import { Encargos } from './models/Encargos';
import { EstadoEncargos } from 'src/domain/estadoencargos/models/EstadoEncargos';
import { HistorialEncargos } from 'src/domain/historialencargos/models/HistorialEncargos';
import { Usuarios } from 'src/auth/models/Usuarios';
import { Direcciones } from 'src/auth/usuarios/direcciones/models/Direcciones';
import { CreateEncargoDto } from './DTOs/create-encargo.dto';
import { UpdatePresupuestoEncargoDto } from './DTOs/update-presupuesto-encargo.dto';
import { sendEmail } from 'src/utils/mail/smtp';

@Injectable()
export class EncargosService {
    private readonly backendBaseUrl = (
        process.env.BACKEND_PUBLIC_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3001'
    ).replace(/\/$/, '');
    private readonly mercadoPagoWebhookUrl = `${this.backendBaseUrl}/pagos/mercadopago/impact`;

    async createEncargo(userId: number, dto: CreateEncargoDto): Promise<Encargos> {
        const descripcion = dto.descripcion?.trim();
        if (!descripcion) {
            throw new BadRequestException('La descripción del encargo es obligatoria');
        }

        const direccion = await Direcciones.findOne({
            where: {
                id: dto.id_direccion,
                id_usuario: userId,
            },
            attributes: ['id'],
        });

        if (!direccion) {
            throw new BadRequestException('La dirección seleccionada no es válida para este usuario');
        }

        const estadoInicial = await this.findEstadoEncargoByPriority([
            'Solicitado',
        ]);

        if (!estadoInicial) {
            throw new BadRequestException('No se encontró un estado inicial para encargos');
        }

        const encargo = await Encargos.create({
            id_usuario: userId,
            id_direccion: direccion.id,
            descripcion,
            presupuesto: null,
            ancho: null,
            alto: null,
            profundo: null,
            peso_en_gramos: null,
            id_estado: estadoInicial.id,
        });

        await HistorialEncargos.create({
            id_encargo: encargo.id,
            id_estado: encargo.id_estado,
            id_usuario: userId,
        });

        return this.getEncargoById(encargo.id);
    }

    async updatePresupuesto(idEncargo: number, adminUserId: number, dto: UpdatePresupuestoEncargoDto): Promise<Encargos> {
        const encargo = await Encargos.findByPk(idEncargo);
        if (!encargo) {
            throw new NotFoundException('Encargo no encontrado');
        }

        const presupuesto = Number(dto.presupuesto);
        const ancho = Number(dto.ancho);
        const alto = Number(dto.alto);
        const profundo = Number(dto.profundo);
        const pesoEnGramos = Number(dto.peso_en_gramos);
        if (!Number.isFinite(presupuesto) || presupuesto <= 0) {
            throw new BadRequestException('El presupuesto debe ser un número mayor a 0');
        }
        if (!Number.isFinite(ancho) || ancho <= 0) {
            throw new BadRequestException('El ancho debe ser un número mayor a 0');
        }
        if (!Number.isFinite(alto) || alto <= 0) {
            throw new BadRequestException('El alto debe ser un número mayor a 0');
        }
        if (!Number.isFinite(profundo) || profundo <= 0) {
            throw new BadRequestException('El profundo debe ser un número mayor a 0');
        }
        if (!Number.isFinite(pesoEnGramos) || pesoEnGramos <= 0) {
            throw new BadRequestException('El peso en gramos debe ser un número mayor a 0');
        }

        const estadoPresupuestado = await this.findEstadoEncargoByPriority([
            'Presupuestado',
        ]);

        if (!estadoPresupuestado) {
            throw new BadRequestException('No se encontró el estado Presupuestado activo');
        }

        await encargo.update({
            presupuesto,
            ancho,
            alto,
            profundo,
            peso_en_gramos: pesoEnGramos,
            id_estado: estadoPresupuestado.id,
        });

        await HistorialEncargos.create({
            id_encargo: encargo.id,
            id_estado: encargo.id_estado,
            id_usuario: adminUserId,
        });

        return this.getEncargoById(encargo.id);
    }

    async generatePaymentLink(
        idEncargo: number,
        requester: { userId: number; role: number },
    ): Promise<{ init_point: string; email_sent_to: string }> {
        const encargo = await Encargos.findByPk(idEncargo, {
            include: [
                {
                    model: Usuarios,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'email'],
                },
                {
                    model: Direcciones,
                    as: 'direccion',
                    attributes: ['id', 'calle', 'altura', 'cod_postal_destino'],
                },
            ],
        });

        if (!encargo) {
            throw new NotFoundException('Encargo no encontrado');
        }

        const isAdmin = requester.role === 1;
        if (!isAdmin) {
            throw new ForbiddenException('Solo administradores pueden generar links de pago para encargos');
        }

        const presupuesto = Number(encargo.presupuesto ?? 0);
        if (!Number.isFinite(presupuesto) || presupuesto <= 0) {
            throw new BadRequestException('El encargo todavía no tiene un presupuesto válido para pagar');
        }

        const ancho = Number(encargo.ancho ?? 0);
        const alto = Number(encargo.alto ?? 0);
        const profundo = Number(encargo.profundo ?? 0);
        const pesoEnGramos = Number(encargo.peso_en_gramos ?? 0);
        if (!Number.isFinite(ancho) || ancho <= 0 || !Number.isFinite(alto) || alto <= 0 || !Number.isFinite(profundo) || profundo <= 0 || !Number.isFinite(pesoEnGramos) || pesoEnGramos <= 0) {
            throw new BadRequestException('El encargo debe tener ancho, alto, profundo y peso en gramos para generar el link');
        }

        if (!encargo.id_direccion) {
            throw new BadRequestException('El encargo no tiene dirección de entrega asociada');
        }

        const direccion = await Direcciones.findOne({
            where: {
                id: encargo.id_direccion,
                id_usuario: encargo.id_usuario,
            },
            attributes: ['id'],
        });

        if (!direccion) {
            throw new BadRequestException('Dirección inválida para este encargo');
        }

        const costoTotal = Number(presupuesto.toFixed(2));

        const preference = await new Preference(client).create({
            body: {
                items: [
                    {
                        id: `encargo-${encargo.id}`,
                        title: `Encargo #${encargo.id}`,
                        description: 'Pago de encargo personalizado',
                        quantity: 1,
                        unit_price: costoTotal,
                    },
                ],
                back_urls: {
                    success: 'https://tribaltrend.com.ar/',
                    failure: 'https://tribaltrend.com.ar/',
                    pending: 'https://tribaltrend.com.ar/',
                },
                notification_url: this.mercadoPagoWebhookUrl,
                auto_return: 'approved',
                metadata: {
                    workflow_type: 'encargo',
                    integration_mode: mpMode,
                    usuario: {
                        id: Number(encargo.id_usuario),
                        nombre: encargo.usuario?.nombre ?? '',
                        email: encargo.usuario?.email ?? '',
                    },
                    encargo: {
                        id_encargo: Number(encargo.id),
                        id_usuario: Number(encargo.id_usuario),
                        id_direccion: Number(encargo.id_direccion),
                        costo_envio: 0,
                        costo_ganancia_envio: 0,
                        costo_total: costoTotal,
                        ancho,
                        alto,
                        profundo,
                        peso_en_gramos: pesoEnGramos,
                    },
                    costo_total: costoTotal,
                },
            },
        });

        const initPoint = preference.init_point;
        if (!initPoint) {
            throw new BadRequestException('No se pudo obtener el link de pago de Mercado Pago');
        }

        const emailCliente = encargo.usuario?.email?.trim();
        if (!emailCliente) {
            throw new BadRequestException('El cliente no tiene email configurado para enviar el link de pago');
        }

        const nombreCliente = encargo.usuario?.nombre?.trim() || `Usuario #${encargo.id_usuario}`;
        const direccionTexto = encargo.direccion
            ? `${encargo.direccion.calle} ${encargo.direccion.altura} (${encargo.direccion.cod_postal_destino})`
            : `Dirección #${encargo.id_direccion}`;

        await sendEmail({
            to: emailCliente,
            subject: `Link de pago de tu encargo #${encargo.id}`,
            text: [
                `Hola ${nombreCliente},`,
                '',
                `Tu encargo #${encargo.id} ya fue presupuestado por un total de ARS ${costoTotal.toFixed(2)}.`,
                `Dirección de entrega: ${direccionTexto}.`,
                '',
                `Completá el pago desde este link: ${initPoint}`,
                '',
                'Gracias por elegir Tribal Trend.',
            ].join('\n'),
            html: `
                <p>Hola ${nombreCliente},</p>
                <p>Tu encargo <strong>#${encargo.id}</strong> ya fue presupuestado por un total de <strong>ARS ${costoTotal.toFixed(2)}</strong>.</p>
                <p>Dirección de entrega: ${direccionTexto}.</p>
                <p>
                    Completá el pago desde este link:<br/>
                    <a href="${initPoint}" target="_blank" rel="noopener noreferrer">Pagar encargo #${encargo.id}</a>
                </p>
                <p>Gracias por elegir Tribal Trend.</p>
            `,
        });

        return {
            init_point: initPoint,
            email_sent_to: emailCliente,
        };
    }

    async getEncargosByUser(userId: number): Promise<Encargos[]> {
        return Encargos.findAll({
            where: { id_usuario: userId },
            include: [
                {
                    model: EstadoEncargos,
                    as: 'estado_encargo',
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Direcciones,
                    as: 'direccion',
                    attributes: ['id', 'calle', 'altura', 'cod_postal_destino'],
                },
            ],
            order: [['fecha_encargo', 'DESC'], ['id', 'DESC']],
        });
    }

    async getEncargosForAdmin(): Promise<Encargos[]> {
        return Encargos.findAll({
            include: [
                {
                    model: EstadoEncargos,
                    as: 'estado_encargo',
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Usuarios,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'email'],
                },
                {
                    model: Direcciones,
                    as: 'direccion',
                    attributes: ['id', 'calle', 'altura', 'cod_postal_destino'],
                },
            ],
            order: [['fecha_encargo', 'DESC'], ['id', 'DESC']],
        });
    }

    async getEncargoById(id: number): Promise<Encargos> {
        const encargo = await Encargos.findByPk(id, {
            include: [
                {
                    model: EstadoEncargos,
                    as: 'estado_encargo',
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Usuarios,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'email'],
                },
                {
                    model: Direcciones,
                    as: 'direccion',
                    attributes: ['id', 'calle', 'altura', 'cod_postal_destino'],
                },
            ],
        });

        if (!encargo) {
            throw new NotFoundException('Encargo no encontrado');
        }

        return encargo;
    }

    private async findEstadoEncargoByPriority(nombres: string[]): Promise<EstadoEncargos | null> {
        for (const nombre of nombres) {
            const estado = await EstadoEncargos.findOne({ where: { nombre, esActivo: true } });
            if (estado) {
                return estado;
            }
        }

        return null;
    }
}
