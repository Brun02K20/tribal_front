import { ApiProperty } from '@nestjs/swagger';
// hola
export class MercadoPagoPreferenceResponseDto {
	@ApiProperty({
		example:
			'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890-abcde',
		description: 'URL de checkout de Mercado Pago (init_point).',
	})
	init_point!: string;
}

export class BadRequestResponseDto {
	@ApiProperty({
		example: 400,
		description: 'Código de estado HTTP.',
	})
	statusCode!: number;

	@ApiProperty({
		example: ['guest_id must be an integer number'],
		description: 'Detalle del error de validación.',
		isArray: true,
	})
	message!: string[];

	@ApiProperty({
		example: 'Bad Request',
		description: 'Resumen del error.',
	})
	error!: string;
}

export class InternalServerErrorResponseDto {
	@ApiProperty({
		example: 500,
		description: 'Código de estado HTTP.',
	})
	statusCode!: number;

	@ApiProperty({
		example: 'Internal Server Error',
		description: 'Mensaje de error interno.',
	})
	message!: string;
}
