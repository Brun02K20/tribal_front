import {
	BadRequestException,
	HttpException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuarios } from '../models/Usuarios';
import { DireccionDto, AccountConfigDto, SuccessConfigUpdateDto, AccountConfigGetDto } from '../DTOs/user.dto';
import { Direcciones } from './direcciones/models/Direcciones';

@Injectable()
export class UsuariosService {
    constructor(private readonly jwtService: JwtService) { }

    async updateAccountConfig(userId: number, data: AccountConfigDto): Promise<SuccessConfigUpdateDto> {
        try {
            // 1. Ver si el usuario existe
            const user = await Usuarios.findByPk(userId);
            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }

            // 2. Verificar que el nuevo password no sea el mismo que el actual
            if (user.password_hash && data.password) {
                const isSamePassword = await bcrypt.compare(data.password, user.password_hash);
                if (isSamePassword) {
                    throw new BadRequestException('El nuevo password no puede ser el mismo que el actual');
                }
            }

            // 3. Actualizar los campos base que se hayan enviado (aun no incluye direcciones)
            if (data.username !== undefined) user.username = data.username;
            if (data.telefono !== undefined) user.telefono = data.telefono;
            if (data.password) {
                user.password_hash = await bcrypt.hash(data.password, 10);
            }
            

            // 4. Borrar las direcciones anteriores y crear las nuevas (si se enviaron)
            const direcciones_to_delete = await Direcciones.findAll({ where: { id_usuario: userId } });
            await Promise.all(direcciones_to_delete.map((dir) => dir.destroy()));

            if (data.direcciones && data.direcciones.length > 0) {
                const nuevas_direcciones = data.direcciones.map((dir) => ({
                    id_usuario: userId,
                    calle: dir.calle,
                    id_ciudad: dir.id_ciudad,
                    id_provincia: dir.id_provincia,
                    cod_postal_destino: dir.cod_postal_destino,
                    altura: dir.altura,
                    es_activo: true,
                }));
                await Direcciones.bulkCreate(nuevas_direcciones);
            }

            // 5. Guardar el usuario actualizado
            await user.save();

            // 6. Devolver la respuesta con el usuario actualizado
            return {
                id: user.id,
                message: 'Configuración de cuenta actualizada exitosamente',
            }
        } catch (error) {
            console.error(`Error updating account config for user ${userId}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error al actualizar la configuración de la cuenta');
        }
    }

    async getAccountConfig(userId: number): Promise<AccountConfigGetDto> {
        try {
            const user = await Usuarios.findByPk(userId, {
                include: [{
                    model: Direcciones,
                    as: 'direcciones',
                    attributes: ['calle', 'altura', 'id_ciudad', 'id_provincia', 'cod_postal_destino'],
                },
            ]});

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
        } catch (error) {
            console.error(`Error fetching account config for user ${userId}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error al obtener la configuración de la cuenta');
        }
    }
}