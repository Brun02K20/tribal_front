import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './DTOs/createpedido.dto';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';

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
}
