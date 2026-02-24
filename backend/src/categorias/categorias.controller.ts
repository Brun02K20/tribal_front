
import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, SuccessDeleteCategoriaDto, CategoriaResponseDto } from './DTOs/categorias.dto';
import type { CategoriaListResponse } from './types/categorias.types';

@ApiTags('Categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

    @Get()
    @ApiOkResponse({ type: CategoriaResponseDto, isArray: true })
    async findAll(): Promise<CategoriaListResponse> {
        return this.categoriasService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ type: CategoriaResponseDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria', example: 1 })
    async findById(@Param('id') id: number): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.findById(id);
    }

    @Post()
    @ApiBody({ type: CreateCategoriaDto })
    @ApiOkResponse({ type: CategoriaResponseDto })
    async create(@Body() createCategoriaDto: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.createCategoria(createCategoriaDto);
    }

    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria to update', example: 1 })
    @ApiBody({ type: CreateCategoriaDto })
    @ApiOkResponse({ type: CategoriaResponseDto })
    async update(@Param('id') id: number, @Body() updateCategoriaDto: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.updateCategoria(id, updateCategoriaDto);
    }

    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria to toggle', example: 1 })
    @ApiOkResponse({ type: CategoriaResponseDto })
    async toggle(@Param('id') id: number): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.toggleActivateCategoria(id);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteCategoriaDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteCategoriaDto> {
        return this.categoriasService.deleteCategoria(id);
    }

}
