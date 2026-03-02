import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './DTOs/createpedido.dto';
import { DetallePedidoResponseDto } from './DTOs/getpedido.dto';
import { UpdateEstadoEnvioDto, UpdateEstadoPedidoDto } from './DTOs/update-estados.dto';
import { FindPedidosFiltersDto, PaginatedPedidosListResponseDto, PaginatedPedidosResponseDto } from './DTOs/find-pedidos-filters.dto';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { Role1OrOwnerPedidoGuard } from './guards/role1-or-owner-pedido.guard';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
	constructor(private readonly pedidosService: PedidosService) {}

	@UseGuards(AuthGuard, Role2Guard)
	@ApiBearerAuth('bearer')
	@Post()
	@ApiOperation({
		summary: 'Crear referencia de pago para un pedido',
		description:
			'Genera la preferencia de Mercado Pago para el pedido y devuelve el init_point de checkout.',
	})
	@ApiBody({ type: CreatePedidoDto })
	@ApiCreatedResponse({
		description: 'URL de checkout de Mercado Pago (init_point).',
		schema: {
			type: 'object',
			properties: {
				init_point: {
					type: 'string',
					example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123',
				},
			},
		},
	})
	async createPedido(@Body() createPedidoDto: CreatePedidoDto): Promise<{ init_point: string }> {
		const init_point = await this.pedidosService.createPedido(createPedidoDto);
		return { init_point };
	}

	@UseGuards(AuthGuard, Role1Guard)
	@ApiBearerAuth('bearer')
	@Get('admin/all')
	@ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
	@ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Tamaño de página' })
	@ApiOperation({
		summary: 'Obtener todos los pedidos (admin)',
		description: 'Permite al administrador visualizar todos los pedidos del sistema.',
	})
	@ApiOkResponse({
		description: 'Listado completo de pedidos.',
		type: PaginatedPedidosListResponseDto,
	})
		async getAllPedidosForAdmin(
			@Query('page') page?: string,
			@Query('pageSize') pageSize?: string,
		): Promise<PaginatedPedidosResponseDto<DetallePedidoResponseDto>> {
			return this.pedidosService.getAllPedidosForAdmin(
				this.parseOptionalNumber(page),
				this.parseOptionalNumber(pageSize),
			);
	}

	@UseGuards(AuthGuard, Role1OrOwnerPedidoGuard)
	@ApiBearerAuth('bearer')
	@Get('usuario/:id_usuario')
	@ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
	@ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Tamaño de página' })
	@ApiOperation({
		summary: 'Obtener pedidos por usuario (admin o dueño)',
		description:
			'Permite obtener todos los pedidos de un usuario. Acceden administradores o el propio usuario.',
	})
	@ApiParam({ name: 'id_usuario', type: Number, description: 'ID del usuario', example: 13 })
	@ApiOkResponse({
		description: 'Listado de pedidos del usuario.',
		type: PaginatedPedidosListResponseDto,
	})
	async getAllPedidosForUser(
		@Param('id_usuario', ParseIntPipe) id_usuario: number,
		@Query('page') page?: string,
		@Query('pageSize') pageSize?: string,
	): Promise<PaginatedPedidosResponseDto<DetallePedidoResponseDto>> {
		return this.pedidosService.getAllPedidosForUser(
			id_usuario,
			this.parseOptionalNumber(page),
			this.parseOptionalNumber(pageSize),
		);
	}

	@UseGuards(AuthGuard, Role1OrOwnerPedidoGuard)
	@ApiBearerAuth('bearer')
	@Get('filters')
	@ApiQuery({ name: 'id_usuario', type: Number, required: false, description: 'ID del usuario' })
	@ApiQuery({ name: 'nombre_usuario', type: String, required: false, description: 'Nombre del usuario' })
	@ApiQuery({ name: 'email_usuario', type: String, required: false, description: 'Email del usuario' })
	@ApiQuery({ name: 'fecha_pedido_min', type: String, required: false, description: 'Fecha mínima (YYYY-MM-DD)' })
	@ApiQuery({ name: 'fecha_pedido_max', type: String, required: false, description: 'Fecha máxima (YYYY-MM-DD)' })
	@ApiQuery({ name: 'id_estado_pedido', type: Number, required: false, description: 'ID estado de pedido' })
	@ApiQuery({ name: 'id_estado_envio', type: Number, required: false, description: 'ID estado de envío' })
	@ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
	@ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Tamaño de página' })
	@ApiOperation({
		summary: 'Buscar pedidos por filtros (admin o dueño)',
		description:
			'Permite filtrar pedidos por usuario, mail, fechas y estados. Acceden administradores o el propio usuario dueño (en ese caso debe enviar id_usuario propio).',
	})
	@ApiOkResponse({
		description: 'Listado paginado de pedidos filtrados.',
		type: PaginatedPedidosListResponseDto,
	})
	async findPedidosByFilters(
		@Query('id_usuario') id_usuario?: string,
		@Query('nombre_usuario') nombre_usuario?: string,
		@Query('email_usuario') email_usuario?: string,
		@Query('fecha_pedido_min') fecha_pedido_min?: string,
		@Query('fecha_pedido_max') fecha_pedido_max?: string,
		@Query('id_estado_pedido') id_estado_pedido?: string,
		@Query('id_estado_envio') id_estado_envio?: string,
		@Query('page') page?: string,
		@Query('pageSize') pageSize?: string,
	): Promise<PaginatedPedidosResponseDto<DetallePedidoResponseDto>> {
		const filters: FindPedidosFiltersDto = {
			id_usuario: this.parseOptionalNumber(id_usuario),
			nombre_usuario: this.parseOptionalString(nombre_usuario),
			email_usuario: this.parseOptionalString(email_usuario),
			fecha_pedido_min: this.parseOptionalString(fecha_pedido_min),
			fecha_pedido_max: this.parseOptionalString(fecha_pedido_max),
			id_estado_pedido: this.parseOptionalNumber(id_estado_pedido),
			id_estado_envio: this.parseOptionalNumber(id_estado_envio),
		};

		return this.pedidosService.findPedidosByFilters(
			filters,
			this.parseOptionalNumber(page),
			this.parseOptionalNumber(pageSize),
		);
	}

	@UseGuards(AuthGuard, Role1OrOwnerPedidoGuard)
	@ApiBearerAuth('bearer')
	@Get(':id')
	@ApiOperation({
		summary: 'Obtener pedido por ID (admin o dueño)',
		description:
			'Permite obtener un pedido por su ID. Acceden administradores o el usuario dueño del pedido.',
	})
	@ApiParam({ name: 'id', type: Number, description: 'ID del pedido', example: 1 })
	@ApiOkResponse({
		description: 'Detalle del pedido.',
		type: DetallePedidoResponseDto,
	})
	async getPedidoById(
		@Param('id', ParseIntPipe) id: number,
	): Promise<DetallePedidoResponseDto> {
		return this.pedidosService.getPedidoById(id);
	}

	@UseGuards(AuthGuard, Role1Guard)
	@ApiBearerAuth('bearer')
	@Put(':id/estado-pedido')
	@ApiOperation({
		summary: 'Modificar estado de pedido (admin)',
		description: 'Actualiza únicamente el id_estado_pedido del pedido indicado.',
	})
	@ApiParam({ name: 'id', type: Number, description: 'ID del pedido', example: 1 })
	@ApiBody({ type: UpdateEstadoPedidoDto })
	@ApiOkResponse({
		description: 'Pedido actualizado con su nuevo estado.',
		type: DetallePedidoResponseDto,
	})
	async updateEstadoPedido(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: UpdateEstadoPedidoDto,
	): Promise<DetallePedidoResponseDto> {
		return this.pedidosService.updateEstadoPedido(id, body.id_estado_pedido);
	}

	@UseGuards(AuthGuard, Role1Guard)
	@ApiBearerAuth('bearer')
	@Put(':id/estado-envio')
	@ApiOperation({
		summary: 'Modificar estado de envío (admin)',
		description: 'Actualiza únicamente el id_estado_envio del envío asociado al pedido indicado.',
	})
	@ApiParam({ name: 'id', type: Number, description: 'ID del pedido', example: 1 })
	@ApiBody({ type: UpdateEstadoEnvioDto })
	@ApiOkResponse({
		description: 'Pedido actualizado con su nuevo estado de envío.',
		type: DetallePedidoResponseDto,
	})
	async updateEstadoEnvio(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: UpdateEstadoEnvioDto,
	): Promise<DetallePedidoResponseDto> {
		return this.pedidosService.updateEstadoEnvio(id, body.id_estado_envio);
	}

	private parseOptionalNumber(value?: string): number | undefined {
		if (value === undefined || value === null || value === '') {
			return undefined;
		}

		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			throw new BadRequestException(`Valor numérico inválido: ${value}`);
		}

		return parsed;
	}

	private parseOptionalString(value?: string): string | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}

		const trimmed = value.trim();
		return trimmed.length ? trimmed : undefined;
	}

    
}
