
import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoPedidos } from './models/EstadoPedidos';
import type { EstadoPedidoListResponse } from './types/estadopedidos.types';
import { CreateEstadoPedidoDto, SuccessDeleteEstadoPedidoDto } from './DTOs/estadopedidos.dto';
import { mapNamedActiveEntity } from 'src/utils/mappers/named-active.mapper';

@Injectable()
export class EstadoPedidosService {
    async findAll(): Promise<EstadoPedidoListResponse> {
        const estadoPedidos = await EstadoPedidos.findAll({
            order: [['id', 'ASC']],
        });

        return estadoPedidos.map(mapNamedActiveEntity);
    }
    
    async findById(id: number): Promise<EstadoPedidoListResponse[0]> {
        const estadoPedido = await EstadoPedidos.findByPk(id);

        if (!estadoPedido) {
            throw new NotFoundException(`EstadoPedido with id ${id} not found`);
        }

        return mapNamedActiveEntity(estadoPedido);
    }

    async createEstadoPedido (body: CreateEstadoPedidoDto): Promise<EstadoPedidoListResponse[0]> {
        const estadoPedido = await EstadoPedidos.create({
            nombre: body.nombre,
            esActivo: true,
        });

        return mapNamedActiveEntity(estadoPedido);
     }

    async updateEstadoPedido (id: number, body: CreateEstadoPedidoDto): Promise<EstadoPedidoListResponse[0]> {
        const estadoPedido = await EstadoPedidos.findByPk(id);
        if (!estadoPedido) {
            throw new NotFoundException(`EstadoPedido with id ${id} not found`);
        }
        await estadoPedido.update({
            nombre: body.nombre,
        });
        return mapNamedActiveEntity(estadoPedido);
    }

    async toggleActivateEstadoPedido (id: number): Promise<EstadoPedidoListResponse[0]> {
        const estadoPedido = await EstadoPedidos.findByPk(id);
        if (!estadoPedido) {
            throw new NotFoundException(`EstadoPedido with id ${id} not found`);
        }
        await estadoPedido.update({
            esActivo: !estadoPedido.esActivo,
        });
        return mapNamedActiveEntity(estadoPedido);
    }

    async deleteEstadoPedidos (id: number): Promise<SuccessDeleteEstadoPedidoDto> {
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
}
