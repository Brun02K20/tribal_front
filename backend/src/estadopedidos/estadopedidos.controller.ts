
import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EstadoPedidosService } from './estadopedido.service';
import { CreateEstadoPedidoDto, EstadoPedidoResponseDto, SuccessDeleteEstadoPedidoDto } from './DTOs/estadopedidos.dto';
import type { EstadoPedidoListResponse } from './types/estadopedidos.types';

@ApiTags('Estados de Pedidos')
@Controller('estados-pedidos')
export class EstadosPedidosController {
  constructor(private readonly estadosPedidosService: EstadoPedidosService) {}

    @Get()
    @ApiOkResponse({ type: EstadoPedidoResponseDto, isArray: true })
    async findAll(): Promise<EstadoPedidoListResponse> {
        return this.estadosPedidosService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: EstadoPedidoResponseDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoPedido', example: 1 })
    async findById(@Param('id') id: number): Promise<EstadoPedidoListResponse[0]> {
        return this.estadosPedidosService.findById(id);
    }

    @Post()
    @ApiBody({ type: CreateEstadoPedidoDto })
    @ApiOkResponse({ type: EstadoPedidoResponseDto })
    async create(@Body() createEstadoPedidoDto: CreateEstadoPedidoDto): Promise<EstadoPedidoListResponse[0]> {
        return this.estadosPedidosService.createEstadoPedido(createEstadoPedidoDto);
    }

    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoPedido to update', example: 1 })
    @ApiBody({ type: CreateEstadoPedidoDto })
    @ApiOkResponse({ type: EstadoPedidoResponseDto })
    async update(@Param('id') id: number, @Body() updateEstadoPedidoDto: CreateEstadoPedidoDto): Promise<EstadoPedidoListResponse[0]> {
        return this.estadosPedidosService.updateEstadoPedido(id, updateEstadoPedidoDto);
    }

    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoPedido to toggle', example: 1 })
    @ApiOkResponse({ type: EstadoPedidoResponseDto })
    async toggle(@Param('id') id: number): Promise<EstadoPedidoListResponse[0]> {
        return this.estadosPedidosService.toggleActivateEstadoPedido(id);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoPedido to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteEstadoPedidoDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteEstadoPedidoDto> {
        return this.estadosPedidosService.deleteEstadoPedidos(id);
    }

}
