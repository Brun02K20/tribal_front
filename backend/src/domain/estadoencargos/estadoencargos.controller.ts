import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiCookieAuth } from '@nestjs/swagger';
import { EstadoEncargosService } from './estadoencargos.service';
import { CreateEstadoEncargoDto, EstadoEncargoResponseDto, SuccessDeleteEstadoEncargoDto } from './DTOs/estadoencargos.dto';
import type { EstadoEncargoListResponse } from './types/estadoencargos.types';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@ApiTags('Estados de Encargos')
@Controller('estados-encargos')
export class EstadosEncargosController {
  constructor(private readonly estadosEncargosService: EstadoEncargosService) {}

    @Get()
    @ApiOkResponse({ type: EstadoEncargoResponseDto, isArray: true })
    async findAll(): Promise<EstadoEncargoListResponse> {
        return this.estadosEncargosService.findAll();
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Get(':id')
    @ApiOkResponse({ type: EstadoEncargoResponseDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEncargo', example: 1 })
    async findById(@Param('id') id: number): Promise<EstadoEncargoListResponse[0]> {
        return this.estadosEncargosService.findById(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Post()
    @ApiBody({ type: CreateEstadoEncargoDto })
    @ApiCreatedResponse({ type: EstadoEncargoResponseDto })
    async create(@Body() createEstadoEncargoDto: CreateEstadoEncargoDto): Promise<EstadoEncargoListResponse[0]> {
        return this.estadosEncargosService.createEstadoEncargo(createEstadoEncargoDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEncargo to update', example: 1 })
    @ApiBody({ type: CreateEstadoEncargoDto })
    @ApiOkResponse({ type: EstadoEncargoResponseDto })
    async update(@Param('id') id: number, @Body() updateEstadoEncargoDto: CreateEstadoEncargoDto): Promise<EstadoEncargoListResponse[0]> {
        return this.estadosEncargosService.updateEstadoEncargo(id, updateEstadoEncargoDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEncargo to toggle', example: 1 })
    @ApiOkResponse({ type: EstadoEncargoResponseDto })
    async toggle(@Param('id') id: number): Promise<EstadoEncargoListResponse[0]> {
        return this.estadosEncargosService.toggleActivateEstadoEncargo(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the estadoEncargo to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteEstadoEncargoDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteEstadoEncargoDto> {
        return this.estadosEncargosService.deleteEstadoEncargos(id);
    }
}
