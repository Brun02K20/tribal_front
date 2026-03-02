
import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto, SuccessDeleteSubcategoriaDto, SubcategoriaResponseDto } from './DTOs/subcategorias.dto';
import type { SubcategoriaListResponse } from './types/subcategorias.types';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@ApiTags('Subcategorias')
@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

    @Get()
    @ApiOkResponse({ type: SubcategoriaResponseDto, isArray: true })
    async findAll(): Promise<SubcategoriaListResponse> {
        return this.subcategoriasService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: SubcategoriaResponseDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria', example: 1 })
    async findById(@Param('id') id: number): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.findById(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Get('categoria/:id_categoria')
    @ApiOkResponse({ type: SubcategoriaResponseDto, isArray: true })
    @ApiParam({ name: 'id_categoria', type: Number, description: 'ID of the categoria', example: 1 })
    async findByCategoriaId(@Param('id_categoria') id_categoria: number): Promise<SubcategoriaListResponse> {
        return this.subcategoriasService.findByCategoriaId(id_categoria);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Post()
    @ApiBody({ type: CreateSubcategoriaDto })
    @ApiCreatedResponse({ type: SubcategoriaResponseDto })
    async create(@Body() createSubcategoriaDto: CreateSubcategoriaDto): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.create(createSubcategoriaDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria to update', example: 1 })
    @ApiBody({ type: CreateSubcategoriaDto })
    @ApiOkResponse({ type: SubcategoriaResponseDto })
    async update(@Param('id') id: number, @Body() updateSubcategoriaDto: CreateSubcategoriaDto): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.update(id, updateSubcategoriaDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria to toggle', example: 1 })
    @ApiOkResponse({ type: SubcategoriaResponseDto })
    async toggle(@Param('id') id: number): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.toggle(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteSubcategoriaDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteSubcategoriaDto> {
        return this.subcategoriasService.delete(id);
    }
}
