
import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoEnvios } from './models/EstadoEnvios';
import type { EstadoEnvioListResponse } from './types/estadoenvios.types';
import { CreateEstadoEnvioDto, SuccessDeleteEstadoEnvioDto } from './DTOs/estadoenvios.dto';
import { mapNamedActiveEntity } from 'src/utils/mappers/named-active.mapper';

@Injectable()
export class EstadoEnviosService {
    async findAll(): Promise<EstadoEnvioListResponse> {
        const estadoEnvios = await EstadoEnvios.findAll({
            order: [['id', 'ASC']],
        });

        return estadoEnvios.map(mapNamedActiveEntity);
    }
    
    async findById(id: number): Promise<EstadoEnvioListResponse[0]> {
        const estadoEnvio = await EstadoEnvios.findByPk(id);

        if (!estadoEnvio) {
            throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
        }

        return mapNamedActiveEntity(estadoEnvio);
    }

    async createEstadoEnvio (body: CreateEstadoEnvioDto): Promise<EstadoEnvioListResponse[0]> {
        const estadoEnvio = await EstadoEnvios.create({
            nombre: body.nombre,
            esActivo: true,
        });

        return mapNamedActiveEntity(estadoEnvio);
     }

    async updateEstadoEnvio (id: number, body: CreateEstadoEnvioDto): Promise<EstadoEnvioListResponse[0]> {
        const estadoEnvio = await EstadoEnvios.findByPk(id);
        if (!estadoEnvio) {
            throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
        }
        await estadoEnvio.update({
            nombre: body.nombre,
        });
        return mapNamedActiveEntity(estadoEnvio);
    }

    async toggleActivateEstadoEnvio (id: number): Promise<EstadoEnvioListResponse[0]> {
        const estadoEnvio = await EstadoEnvios.findByPk(id);
        if (!estadoEnvio) {
            throw new NotFoundException(`EstadoEnvio with id ${id} not found`);
        }
        await estadoEnvio.update({
            esActivo: !estadoEnvio.esActivo,
        });
        return mapNamedActiveEntity(estadoEnvio);
    }

    async deleteEstadoEnvios (id: number): Promise<SuccessDeleteEstadoEnvioDto> {
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
}
