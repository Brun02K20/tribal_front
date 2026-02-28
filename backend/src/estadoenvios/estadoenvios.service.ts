
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { EstadoEnvios } from './models/EstadoEnvios';
import type { EstadoEnvioListResponse } from './types/estadoenvios.types';
import { CreateEstadoEnvioDto, SuccessDeleteEstadoEnvioDto } from './DTOs/estadoenvios.dto';

@Injectable()
export class EstadoEnviosService {
    async findAll(): Promise<EstadoEnvioListResponse> {
        try {
            const estadoEnvios = await EstadoEnvios.findAll({
                order: [['id', 'ASC']],
            });

            return estadoEnvios.map((estadoEnvio) => ({
                id: estadoEnvio.id,
                nombre: estadoEnvio.nombre,
                esActivo: estadoEnvio.esActivo,
            }));
        } catch (error) {
            console.error('Error fetching estadoEnvios:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching estadoEnvios');
        }
    }
    
    async findById(id: number): Promise<EstadoEnvioListResponse[0]> {
        try {
            const estadoEnvio = await EstadoEnvios.findByPk(id);

            if (!estadoEnvio) {
                throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
            }

            return {
                id: estadoEnvio.id,
                nombre: estadoEnvio.nombre,
                esActivo: estadoEnvio.esActivo,
            };
        } catch (error) {
            console.error(`Error fetching estadoEnvio with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching estadoEnvio with id ${id}`);
        }
    }

    async createEstadoEnvio (body: CreateEstadoEnvioDto): Promise<EstadoEnvioListResponse[0]> {
        try {
            const estadoEnvio = await EstadoEnvios.create({
                nombre: body.nombre,
                esActivo: true,
            });

            return {
                id: estadoEnvio.id,
                nombre: estadoEnvio.nombre,
                esActivo: estadoEnvio.esActivo,
            };
        }

        catch (error) {
            console.error('Error creating estadoEnvio:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error creating estadoEnvio');
        }
     }

    async updateEstadoEnvio (id: number, body: CreateEstadoEnvioDto): Promise<EstadoEnvioListResponse[0]> {
        try {
            const estadoEnvio = await EstadoEnvios.findByPk(id);
            if (!estadoEnvio) {
                throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
            }
            await estadoEnvio.update({
                nombre: body.nombre,
            });
            return {
                id: estadoEnvio.id,
                nombre: estadoEnvio.nombre,
                esActivo: estadoEnvio.esActivo,
            };
        } catch (error) {
            console.error(`Error updating estadoEnvio with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error updating estadoEnvio with id ${id}`);
        }
    }

    async toggleActivateEstadoEnvio (id: number): Promise<EstadoEnvioListResponse[0]> {
        try {
            const estadoEnvio = await EstadoEnvios.findByPk(id);
            if (!estadoEnvio) {
                throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
            }
            await estadoEnvio.update({
                esActivo: !estadoEnvio.esActivo,
            });
            return {
                id: estadoEnvio.id,
                nombre: estadoEnvio.nombre,
                esActivo: estadoEnvio.esActivo,
            };
        } catch (error) {
            console.error(`Error toggling activation for estadoEnvio with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error toggling activation for estadoEnvio with id ${id}`);
        }
    }

    async deleteEstadoEnvios (id: number): Promise<SuccessDeleteEstadoEnvioDto> {
        try {
            const estadoEnvios = await EstadoEnvios.findByPk(id);
            if (!estadoEnvios) {
                throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
            }
            await estadoEnvios.update({ esActivo: false });
            return {
                id: estadoEnvios.id,
                message: 'EstadoEnvio deleted successfully',
            };
        }
        catch (error) {
            console.error(`Error deleting estadoEnvio with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error deleting estadoEnvio with id ${id}`);
        }
    }
}
