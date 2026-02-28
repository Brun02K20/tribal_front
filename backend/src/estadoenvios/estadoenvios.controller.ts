
import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { EstadoEnviosService } from './estadoenvios.service';
import { CreateEstadoEnvioDto, EstadoEnvioResponseDto, SuccessDeleteEstadoEnvioDto } from './DTOs/estadoenvios.dto';
import type { EstadoEnvioListResponse } from './types/estadoenvios.types';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@ApiTags('Estados de Envíos')
@Controller('estados-envios')
export class EstadosEnviosController {
  constructor(private readonly estadosEnviosService: EstadoEnviosService) {}

    @Get()
    @ApiOkResponse({ type: EstadoEnvioResponseDto, isArray: true })
    async findAll(): Promise<EstadoEnvioListResponse> {
        return this.estadosEnviosService.findAll();
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Get(':id')
    @ApiOkResponse({ type: EstadoEnvioResponseDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEnvio', example: 1 })
    async findById(@Param('id') id: number): Promise<EstadoEnvioListResponse[0]> {
        return this.estadosEnviosService.findById(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Post()
    @ApiBody({ type: CreateEstadoEnvioDto })
    @ApiOkResponse({ type: EstadoEnvioResponseDto })
    async create(@Body() createEstadoEnvioDto: CreateEstadoEnvioDto): Promise<EstadoEnvioListResponse[0]> {
        return this.estadosEnviosService.createEstadoEnvio(createEstadoEnvioDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEnvio to update', example: 1 })
    @ApiBody({ type: CreateEstadoEnvioDto })
    @ApiOkResponse({ type: EstadoEnvioResponseDto })
    async update(@Param('id') id: number, @Body() updateEstadoEnvioDto: CreateEstadoEnvioDto): Promise<EstadoEnvioListResponse[0]> {
        return this.estadosEnviosService.updateEstadoEnvio(id, updateEstadoEnvioDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEnvio to toggle', example: 1 })
    @ApiOkResponse({ type: EstadoEnvioResponseDto })
    async toggle(@Param('id') id: number): Promise<EstadoEnvioListResponse[0]> {
        return this.estadosEnviosService.toggleActivateEstadoEnvio(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEnvio to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteEstadoEnvioDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteEstadoEnvioDto> {
        return this.estadosEnviosService.deleteEstadoEnvios(id);
    }

}
