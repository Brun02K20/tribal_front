import { BadRequestException, Body, Controller, Logger, Post, Query } from '@nestjs/common';
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
        @Body() mercadoPagoDto: any,
        @Query() queryParams: Record<string, unknown>,
    ){
        this.logger.log(`Webhook MercadoPago recibido`);
        this.logger.debug(`Webhook raw payload=${JSON.stringify(mercadoPagoDto)}`);
        this.logger.debug(`Webhook query params=${JSON.stringify(queryParams)}`);

        const topic =
            mercadoPagoDto?.type ??
            mercadoPagoDto?.topic ??
            (typeof queryParams?.type === 'string' ? queryParams.type : undefined) ??
            (typeof queryParams?.topic === 'string' ? queryParams.topic : undefined) ??
            'N/A';
        const action = mercadoPagoDto?.action ?? 'N/A';
        this.logger.debug(`Webhook metadata topic=${topic} action=${action}`);

        if (topic !== 'payment') {
            this.logger.warn(`Webhook ignorado por topic no soportado: ${topic}`);
            return { message: 'Notificación ignorada (topic no payment)' };
        }

        const paymentId =
            mercadoPagoDto?.data?.id ??
            (typeof queryParams?.['data.id'] === 'string' ? queryParams['data.id'] : undefined) ??
            (typeof queryParams?.id === 'string' ? queryParams.id : undefined);

        if (!paymentId) {
            this.logger.error(
                `Webhook sin paymentId. payload=${JSON.stringify(mercadoPagoDto)} query=${JSON.stringify(queryParams)}`,
            );
            throw new BadRequestException('Webhook inválido: falta data.id');
        }

        this.logger.debug(`paymentId=${paymentId}`,'POST /mercadopago/impact');
        await this.pagosService.receivePaymentNotification(paymentId);
        this.logger.log(`Webhook procesado para paymentId=${paymentId}`);
        return { message: 'Notificación de pago recibida correctamente' };
    }
}
