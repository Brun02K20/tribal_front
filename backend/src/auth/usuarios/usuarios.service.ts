import {
	BadRequestException,
	HttpException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Usuarios } from '../models/Usuarios';
import {
    DireccionDto,
    AccountConfigDto,
    SuccessConfigUpdateDto,
    AccountConfigGetDto,
    CreateDireccionDto,
    UserDireccionDto,
} from '../DTOs/user.dto';
import { Direcciones } from './direcciones/models/Direcciones';
import { Ciudades } from 'src/domain/ciudades/models/Ciudades';
import { Provincias } from 'src/domain/provincias/models/Provincias';

@Injectable()
export class UsuariosService {
    constructor() { }

    async updateAccountConfig(userId: number, data: AccountConfigDto): Promise<SuccessConfigUpdateDto> {
        return this.handleUserConfigAction(
            userId,
            'updating account config',
            'Error al actualizar la configuración de la cuenta',
            async () => {
                const user = await this.findUserOrThrow(userId);

                if (user.password_hash && data.password) {
                    const isSamePassword = await bcrypt.compare(data.password, user.password_hash);
                    if (isSamePassword) {
                        throw new BadRequestException('El nuevo password no puede ser el mismo que el actual');
                    }
                }

                if (data.username !== undefined) user.username = data.username;
                if (data.telefono !== undefined) user.telefono = data.telefono;
                if (data.password) {
                    user.password_hash = await bcrypt.hash(data.password, 10);
                }

                await this.replaceUserAddresses(userId, data);
                await user.save();

                return {
                    id: user.id,
                    message: 'Configuración de cuenta actualizada exitosamente',
                };
            },
        );
    }

    async getAccountConfig(userId: number): Promise<AccountConfigGetDto> {
        return this.handleUserConfigAction(
            userId,
            'fetching account config',
            'Error al obtener la configuración de la cuenta',
            async () => {
                const user = await Usuarios.findByPk(userId, {
                    include: [{
                        model: Direcciones,
                        as: 'direcciones',
                        attributes: ['calle', 'altura', 'id_ciudad', 'id_provincia', 'cod_postal_destino'],
                    }],
                });

                if (!user) {
                    throw new NotFoundException('Usuario no encontrado');
                }

                const direccionesDto: DireccionDto[] = (user.direcciones ?? []).map((dir) => ({
                    calle: dir.calle,
                    altura: dir.altura,
                    id_ciudad: dir.id_ciudad,
                    id_provincia: dir.id_provincia,
                    cod_postal_destino: dir.cod_postal_destino,
                    id_usuario: userId,
                }));

                return {
                    nombre: user.nombre,
                    email: user.email,
                    username: user.username,
                    telefono: user.telefono,
                    direcciones: direccionesDto,
                };
            },
        );
    }

    async getUserAddresses(userId: number): Promise<UserDireccionDto[]> {
        return this.handleUserConfigAction(
            userId,
            'fetching user addresses',
            'Error al obtener direcciones del usuario',
            async () => {
                await this.findUserOrThrow(userId);

                const direcciones = await Direcciones.findAll({
                    where: { id_usuario: userId, es_activo: true },
                    include: [
                        {
                            model: Provincias,
                            as: 'provincia',
                            attributes: ['id', 'nombre'],
                        },
                        {
                            model: Ciudades,
                            as: 'ciudad',
                            attributes: ['id', 'nombre'],
                        },
                    ],
                    order: [['id', 'DESC']],
                });

                return direcciones.map((direccion) => this.mapUserAddress(direccion));
            },
        );
    }

    async createUserAddress(userId: number, data: CreateDireccionDto): Promise<UserDireccionDto> {
        return this.handleUserConfigAction(
            userId,
            'creating user address',
            'Error al crear dirección del usuario',
            async () => {
                await this.findUserOrThrow(userId);

                const ciudad = await Ciudades.findByPk(data.id_ciudad);
                if (!ciudad) {
                    throw new NotFoundException('Ciudad no encontrada');
                }

                const provincia = await Provincias.findByPk(data.id_provincia);
                if (!provincia) {
                    throw new NotFoundException('Provincia no encontrada');
                }

                if (Number(ciudad.id_provincia) !== Number(data.id_provincia)) {
                    throw new BadRequestException('La ciudad no pertenece a la provincia seleccionada');
                }

                const created = await Direcciones.create({
                    cod_postal_destino: data.cod_postal_destino,
                    calle: data.calle,
                    altura: data.altura,
                    id_provincia: data.id_provincia,
                    id_ciudad: data.id_ciudad,
                    id_usuario: userId,
                    es_activo: true,
                });

                const direccion = await Direcciones.findByPk(created.id, {
                    include: [
                        {
                            model: Provincias,
                            as: 'provincia',
                            attributes: ['id', 'nombre'],
                        },
                        {
                            model: Ciudades,
                            as: 'ciudad',
                            attributes: ['id', 'nombre'],
                        },
                    ],
                });

                if (!direccion) {
                    throw new NotFoundException('No se pudo recuperar la dirección creada');
                }

                return this.mapUserAddress(direccion);
            },
        );
    }

    private async findUserOrThrow(userId: number) {
        const user = await Usuarios.findByPk(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return user;
    }

    private async replaceUserAddresses(userId: number, data: AccountConfigDto): Promise<void> {
        const direccionesToDelete = await Direcciones.findAll({ where: { id_usuario: userId } });
        await Promise.all(direccionesToDelete.map((dir) => dir.destroy()));

        if (!data.direcciones?.length) {
            return;
        }

        await Direcciones.bulkCreate(
            data.direcciones.map((dir) => ({
                id_usuario: userId,
                calle: dir.calle,
                id_ciudad: dir.id_ciudad,
                id_provincia: dir.id_provincia,
                cod_postal_destino: dir.cod_postal_destino,
                altura: dir.altura,
                es_activo: true,
            })),
        );
    }

    private async handleUserConfigAction<T>(
        userId: number,
        actionName: string,
        fallbackMessage: string,
        action: () => Promise<T>,
    ): Promise<T> {
        try {
            return await action();
        } catch (error) {
            console.error(`Error ${actionName} for user ${userId}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(fallbackMessage);
        }
    }

    private mapUserAddress(direccion: Direcciones): UserDireccionDto {
        return {
            id: direccion.id,
            cod_postal_destino: direccion.cod_postal_destino,
            calle: direccion.calle,
            altura: direccion.altura,
            id_provincia: direccion.id_provincia,
            provincia: direccion.provincia?.nombre ?? '',
            id_ciudad: direccion.id_ciudad,
            ciudad: direccion.ciudad?.nombre ?? '',
            id_usuario: direccion.id_usuario,
        };
    }
}