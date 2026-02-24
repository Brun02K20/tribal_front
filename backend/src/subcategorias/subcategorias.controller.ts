
import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto, SuccessDeleteSubcategoriaDto, SubcategoriaResponseDto } from './DTOs/subcategorias.dto';
import type { SubcategoriaListResponse } from './types/subcategorias.types';
import { AuthGuard } from 'src/auth/utils/auth.guard';

@ApiTags('Subcategorias')
@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

    @Get()
    @UseGuards(AuthGuard)
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

    @Get('categoria/:id_categoria')
    @ApiOkResponse({ type: SubcategoriaResponseDto, isArray: true })
    @ApiParam({ name: 'id_categoria', type: Number, description: 'ID of the categoria', example: 1 })
    async findByCategoriaId(@Param('id_categoria') id_categoria: number): Promise<SubcategoriaListResponse> {
        return this.subcategoriasService.findByCategoriaId(id_categoria);
    }

    @Post()
    @ApiBody({ type: CreateSubcategoriaDto })
    @ApiOkResponse({ type: SubcategoriaResponseDto })
    async create(@Body() createSubcategoriaDto: CreateSubcategoriaDto): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.create(createSubcategoriaDto);
    }

    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria to update', example: 1 })
    @ApiBody({ type: CreateSubcategoriaDto })
    @ApiOkResponse({ type: SubcategoriaResponseDto })
    async update(@Param('id') id: number, @Body() updateSubcategoriaDto: CreateSubcategoriaDto): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.update(id, updateSubcategoriaDto);
    }

    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria to toggle', example: 1 })
    @ApiOkResponse({ type: SubcategoriaResponseDto })
    async toggle(@Param('id') id: number): Promise<SubcategoriaListResponse[0]> {
        return this.subcategoriasService.toggle(id);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the subcategoria to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteSubcategoriaDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteSubcategoriaDto> {
        return this.subcategoriasService.delete(id);
    }
}
