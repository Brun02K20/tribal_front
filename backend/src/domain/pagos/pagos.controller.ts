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

    private resolveTopic(
        payload: Record<string, unknown> | undefined,
        queryParams: Record<string, unknown>,
    ): string {
        const queryTopic =
            (typeof queryParams?.type === 'string' ? queryParams.type : undefined) ??
            (typeof queryParams?.topic === 'string' ? queryParams.topic : undefined);

        if (queryTopic) {
            return queryTopic;
        }

        const payloadTopic =
            (typeof payload?.type === 'string' ? payload.type : undefined) ??
            (typeof payload?.topic === 'string' ? payload.topic : undefined);

        if (payloadTopic) {
            return payloadTopic;
        }

        const action = typeof payload?.action === 'string' ? payload.action : '';
        if (action.startsWith('payment.')) {
            return 'payment';
        }

        return 'N/A';
    }

    private resolveResourceId(
        payload: Record<string, unknown> | undefined,
        queryParams: Record<string, unknown>,
    ): string | undefined {
        const idFromQueryData = typeof queryParams?.['data.id'] === 'string' ? queryParams['data.id'] : undefined;
        const idFromQueryDirect = typeof queryParams?.id === 'string' ? queryParams.id : undefined;

        const payloadData = payload?.data as { id?: string | number } | undefined;
        const payloadObjectId = payload?.id;

        const idFromPayloadData =
            typeof payloadData?.id === 'string'
                ? payloadData.id
                : typeof payloadData?.id === 'number'
                    ? String(payloadData.id)
                    : undefined;

        const idFromPayloadDirect =
            typeof payloadObjectId === 'string'
                ? payloadObjectId
                : typeof payloadObjectId === 'number'
                    ? String(payloadObjectId)
                    : undefined;

        return idFromQueryData ?? idFromQueryDirect ?? idFromPayloadData ?? idFromPayloadDirect;
    }

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

        const topic = this.resolveTopic(mercadoPagoDto, queryParams);
        const action =
            (typeof queryParams?.action === 'string' ? queryParams.action : undefined) ??
            (typeof mercadoPagoDto?.action === 'string' ? mercadoPagoDto.action : undefined) ??
            'N/A';
        const resourceId = this.resolveResourceId(mercadoPagoDto, queryParams);
        this.logger.debug(`Webhook metadata topic=${topic} action=${action}`);
        this.logger.debug(`Webhook resolved resourceId=${resourceId ?? 'N/A'} topic=${topic} action=${action}`);

        if (topic !== 'payment' && topic !== 'merchant_order') {
            this.logger.warn(`Webhook ignorado por topic no soportado: ${topic}`);
            return { message: 'Notificación ignorada (topic no soportado)' };
        }

        if (!resourceId) {
            this.logger.warn(
                `Webhook ignorado por formato no soportado (falta resource id). payload=${JSON.stringify(mercadoPagoDto)} query=${JSON.stringify(queryParams)}`,
            );
            return { message: 'Notificación ignorada (falta resource id)' };
        }

        if (topic === 'merchant_order') {
            this.logger.log(`Webhook branch=merchant_order resourceId=${resourceId}`);
            this.logger.debug(`merchantOrderId=${resourceId}`,'POST /mercadopago/impact');
            await this.pagosService.receiveMerchantOrderNotification(resourceId);
            this.logger.log(`Webhook merchant_order procesado. merchantOrderId=${resourceId}`);
            return { message: 'Notificación merchant_order recibida correctamente' };
        }

        this.logger.log(`Webhook branch=payment resourceId=${resourceId}`);
        this.logger.debug(`paymentId=${resourceId}`,'POST /mercadopago/impact');
        await this.pagosService.receivePaymentNotification(resourceId);
        this.logger.log(`Webhook procesado para paymentId=${resourceId}`);
        return { message: 'Notificación de pago recibida correctamente' };
    }
}
