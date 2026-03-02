import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import {
    ApiBody,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { PagosService } from './pagos.service';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
    private readonly logger = new Logger(PagosController.name);

	constructor(private readonly pagosService: PagosService) {}

    @Post('mercadopago/impact')
        @ApiBody({
            schema: {
                type: 'object',
                properties: {
                    type: { type: 'string', example: 'payment' },
                    topic: { type: 'string', example: 'payment' },
                    action: { type: 'string', example: 'payment.created' },
                    data: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '123456789' },
                        },
                    },
                },
            },
        })
    @ApiOkResponse({
      description: 'Notificación de pago recibida correctamente',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Notificación de pago recibida correctamente',
                    },
                },
            },
    })
    async receiveMercadoPagoNotification(
        @Body() mercadoPagoDto: any
    ){
        this.logger.log(`Webhook MercadoPago recibido`);
        this.logger.debug(`Webhook raw payload=${JSON.stringify(mercadoPagoDto)}`);

        const topic = mercadoPagoDto?.type ?? mercadoPagoDto?.topic ?? 'N/A';
        const action = mercadoPagoDto?.action ?? 'N/A';
        this.logger.debug(`Webhook metadata topic=${topic} action=${action}`);

        const paymentId = mercadoPagoDto?.data?.id;
        if (!paymentId) {
            this.logger.error(`Webhook sin data.id. payload=${JSON.stringify(mercadoPagoDto)}`);
            throw new BadRequestException('Webhook inválido: falta data.id');
        }

        this.logger.debug(`paymentId=${paymentId}`,'POST /mercadopago/impact');
        await this.pagosService.receivePaymentNotification(paymentId);
        this.logger.log(`Webhook procesado para paymentId=${paymentId}`);
        return { message: 'Notificación de pago recibida correctamente' };
    }
}
