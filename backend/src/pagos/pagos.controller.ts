import { Controller, Logger, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import {
	BadRequestResponseDto,
	InternalServerErrorResponseDto,
	MercadoPagoPreferenceResponseDto,
} from './DTOs/pagos.dto';
import { PagosService } from './pagos.service';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
	constructor(private readonly pagosService: PagosService) {}

	@Post('buywithmp/:guest_id/:product_id')
	@ApiOperation({
		summary: 'Crear preferencia de pago en Mercado Pago',
		description:
			'Genera una preferencia de pago y devuelve la URL de checkout de Mercado Pago.',
	})
	@ApiParam({
		name: 'guest_id',
		required: true,
		type: Number,
		example: 123,
		description: 'Identificador del invitado/usuario comprador.',
	})
	@ApiParam({
		name: 'product_id',
		required: true,
		type: Number,
		example: 456,
		description: 'Identificador del producto a comprar.',
	})
	@ApiOkResponse({
		description: 'URL de checkout de Mercado Pago (init_point).',
		type: MercadoPagoPreferenceResponseDto,
	})
	@ApiBadRequestResponse({
		description:
			'Parámetros inválidos. Ocurre cuando guest_id o product_id no son números enteros.',
		type: BadRequestResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Error al crear la preferencia de pago en Mercado Pago.',
		type: InternalServerErrorResponseDto,
	})
	async buyProductWithMP(
		@Param('guest_id', ParseIntPipe) guest_id: number,
		@Param('product_id', ParseIntPipe) product_id: number,
	): Promise<MercadoPagoPreferenceResponseDto> {
		Logger.debug(
			`guest_id=${guest_id} product_id=${product_id}`,
			'POST buywithmp/:guest_id/:product_id',
		);

		const init_point = await this.pagosService.buyProductWithMercadoPago(
			guest_id,
			product_id,
		);

		return { init_point };
	}

    @Post('mercadopago/impact')
    @ApiOkResponse({
      description: 'Notificación de pago recibida correctamente',
    })
    async receiveMercadoPagoNotification(
        @Body() mercadoPagoDto: any
    ){
        const paymentId = mercadoPagoDto.data.id;
        Logger.debug(`paymentId=${paymentId}`,'POST /mercadopago/impact')
        await this.pagosService.receivePaymentNotification(paymentId);
        return { message: 'Notificación de pago recibida correctamente' };
    }
}
