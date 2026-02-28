import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './DTOs/createpedido.dto';
import { DetallePedidoResponseDto } from './DTOs/getpedido.dto';
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
	@ApiOkResponse({
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
	@ApiOperation({
		summary: 'Obtener todos los pedidos (admin)',
		description: 'Permite al administrador visualizar todos los pedidos del sistema.',
	})
	@ApiOkResponse({
		description: 'Listado completo de pedidos.',
		type: DetallePedidoResponseDto,
		isArray: true,
	})
	async getAllPedidosForAdmin(): Promise<DetallePedidoResponseDto[]> {
		return this.pedidosService.getAllPedidosForAdmin();
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

	@UseGuards(AuthGuard, Role1OrOwnerPedidoGuard)
	@ApiBearerAuth('bearer')
	@Get('usuario/:id_usuario')
	@ApiOperation({
		summary: 'Obtener pedidos por usuario (admin o dueño)',
		description:
			'Permite obtener todos los pedidos de un usuario. Acceden administradores o el propio usuario.',
	})
	@ApiParam({ name: 'id_usuario', type: Number, description: 'ID del usuario', example: 13 })
	@ApiOkResponse({
		description: 'Listado de pedidos del usuario.',
		type: DetallePedidoResponseDto,
		isArray: true,
	})
	async getAllPedidosForUser(
		@Param('id_usuario', ParseIntPipe) id_usuario: number,
	): Promise<DetallePedidoResponseDto[]> {
		return this.pedidosService.getAllPedidosForUser(id_usuario);
	}

    
}
