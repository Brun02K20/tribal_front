import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoEncargos } from './models/EstadoEncargos';
import type { EstadoEncargoListResponse } from './types/estadoencargos.types';
import { CreateEstadoEncargoDto, SuccessDeleteEstadoEncargoDto } from './DTOs/estadoencargos.dto';
import { mapNamedActiveEntity } from 'src/utils/mappers/named-active.mapper';

@Injectable()
export class EstadoEncargosService {
    async findAll(): Promise<EstadoEncargoListResponse> {
        const estadoEncargos = await EstadoEncargos.findAll({
            order: [['id', 'ASC']],
        });

        return estadoEncargos.map(mapNamedActiveEntity);
    }

    async findById(id: number): Promise<EstadoEncargoListResponse[0]> {
        const estadoEncargo = await EstadoEncargos.findByPk(id);

        if (!estadoEncargo) {
            throw new NotFoundException(`EstadoEncargo with id ${id} not found`);
        }

        return mapNamedActiveEntity(estadoEncargo);
    }

    async createEstadoEncargo(body: CreateEstadoEncargoDto): Promise<EstadoEncargoListResponse[0]> {
        const estadoEncargo = await EstadoEncargos.create({
            nombre: body.nombre,
            esActivo: true,
        });

        return mapNamedActiveEntity(estadoEncargo);
    }

    async updateEstadoEncargo(id: number, body: CreateEstadoEncargoDto): Promise<EstadoEncargoListResponse[0]> {
        const estadoEncargo = await EstadoEncargos.findByPk(id);
        if (!estadoEncargo) {
            throw new NotFoundException(`EstadoEncargo with id ${id} not found`);
        }

        await estadoEncargo.update({ nombre: body.nombre });

        return mapNamedActiveEntity(estadoEncargo);
    }

    async toggleActivateEstadoEncargo(id: number): Promise<EstadoEncargoListResponse[0]> {
        const estadoEncargo = await EstadoEncargos.findByPk(id);
        if (!estadoEncargo) {
            throw new NotFoundException(`EstadoEncargo with id ${id} not found`);
        }

        await estadoEncargo.update({
            esActivo: !estadoEncargo.esActivo,
        });

        return mapNamedActiveEntity(estadoEncargo);
    }

    async deleteEstadoEncargos(id: number): Promise<SuccessDeleteEstadoEncargoDto> {
        const estadoEncargo = await EstadoEncargos.findByPk(id);
        if (!estadoEncargo) {
            throw new NotFoundException(`EstadoEncargo with id ${id} not found`);
        }

        await estadoEncargo.update({ esActivo: false });
        return {
            id: estadoEncargo.id,
            message: 'EstadoEncargo deleted successfully',
        };
    }
}
