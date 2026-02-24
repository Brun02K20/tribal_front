
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { EstadoPedidos } from './models/EstadoPedidos';
import type { EstadoPedidoListResponse } from './types/estadopedidos.types';
import { CreateEstadoPedidoDto, SuccessDeleteEstadoPedidoDto } from './DTOs/estadopedidos.dto';

@Injectable()
export class EstadoPedidosService {
    async findAll(): Promise<EstadoPedidoListResponse> {
        try {
            const estadoPedidos = await EstadoPedidos.findAll({
                order: [['id', 'ASC']],
            });

            return estadoPedidos.map((estadoPedido) => ({
                id: estadoPedido.id,
                nombre: estadoPedido.nombre,
                esActivo: estadoPedido.esActivo,
            }));
        } catch (error) {
            console.error('Error fetching estadoPedidos:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching estadoPedidos');
        }
    }
    
    async findById(id: number): Promise<EstadoPedidoListResponse[0]> {
        try {
            const estadoPedido = await EstadoPedidos.findByPk(id);

            if (!estadoPedido) {
                throw new NotFoundException(`EstadoPedido with id ${id} not found`);
            }

            return {
                id: estadoPedido.id,
                nombre: estadoPedido.nombre,
                esActivo: estadoPedido.esActivo,
            };
        } catch (error) {
            console.error(`Error fetching estadoPedido with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching estadoPedido with id ${id}`);
        }
    }

    async createEstadoPedido (body: CreateEstadoPedidoDto): Promise<EstadoPedidoListResponse[0]> {
        try {
            const estadoPedido = await EstadoPedidos.create({
                nombre: body.nombre,
                esActivo: true,
            });

            return {
                id: estadoPedido.id,
                nombre: estadoPedido.nombre,
                esActivo: estadoPedido.esActivo,
            };
        }

        catch (error) {
            console.error('Error creating estadoPedido:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error creating estadoPedido');
        }
     }

    async updateEstadoPedido (id: number, body: CreateEstadoPedidoDto): Promise<EstadoPedidoListResponse[0]> {
        try {
            const estadoPedido = await EstadoPedidos.findByPk(id);
            if (!estadoPedido) {
                throw new NotFoundException(`EstadoPedido with id ${id} not found`);
            }
            await estadoPedido.update({
                nombre: body.nombre,
            });
            return {
                id: estadoPedido.id,
                nombre: estadoPedido.nombre,
                esActivo: estadoPedido.esActivo,
            };
        } catch (error) {
            console.error(`Error updating estadoPedido with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error updating estadoPedido with id ${id}`);
        }
    }

    async toggleActivateEstadoPedido (id: number): Promise<EstadoPedidoListResponse[0]> {
        try {
            const estadoPedido = await EstadoPedidos.findByPk(id);
            if (!estadoPedido) {
                throw new NotFoundException(`EstadoPedido with id ${id} not found`);
            }
            await estadoPedido.update({
                esActivo: !estadoPedido.esActivo,
            });
            return {
                id: estadoPedido.id,
                nombre: estadoPedido.nombre,
                esActivo: estadoPedido.esActivo,
            };
        } catch (error) {
            console.error(`Error toggling activation for estadoPedido with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error toggling activation for estadoPedido with id ${id}`);
        }
    }

    async deleteEstadoPedidos (id: number): Promise<SuccessDeleteEstadoPedidoDto> {
        try {
            const estadoPedidos = await EstadoPedidos.findByPk(id);
            if (!estadoPedidos) {
                throw new NotFoundException(`EstadoPedido with id ${id} not found`);
            }
            await estadoPedidos.update({ esActivo: false });
            return {
                id: estadoPedidos.id,
                message: 'EstadoPedido deleted successfully',
            };
        }
        catch (error) {
            console.error(`Error deleting estadoPedido with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error deleting estadoPedido with id ${id}`);
        }
    }
}
