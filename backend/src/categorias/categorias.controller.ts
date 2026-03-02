
import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, SuccessDeleteCategoriaDto, CategoriaResponseDto } from './DTOs/categorias.dto';
import type { CategoriaListResponse } from './types/categorias.types';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';

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

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Post()
    @ApiBody({ type: CreateCategoriaDto })
    @ApiCreatedResponse({ type: CategoriaResponseDto })
    async create(@Body() createCategoriaDto: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.createCategoria(createCategoriaDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria to update', example: 1 })
    @ApiBody({ type: CreateCategoriaDto })
    @ApiOkResponse({ type: CategoriaResponseDto })
    async update(@Param('id') id: number, @Body() updateCategoriaDto: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.updateCategoria(id, updateCategoriaDto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Put('toggle/:id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria to toggle', example: 1 })
    @ApiOkResponse({ type: CategoriaResponseDto })
    async toggle(@Param('id') id: number): Promise<CategoriaListResponse[0]> {
        return this.categoriasService.toggleActivateCategoria(id);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiBearerAuth('bearer')
    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the categoria to delete', example: 1 })
    @ApiOkResponse({ type: SuccessDeleteCategoriaDto })
    async delete(@Param('id') id: number): Promise<SuccessDeleteCategoriaDto> {
        return this.categoriasService.deleteCategoria(id);
    }
}
