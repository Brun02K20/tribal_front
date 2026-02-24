import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { client, Preference, mpMode } from '../mercadopago/mercadopago';
import { Payment as MPayment } from 'mercadopago'

@Injectable()
export class PagosService {
	async buyProductWithMercadoPago(
		guest_id: number,
		product_id: number,
	): Promise<string> {
		const preference = await new Preference(client).create({
			body: {
				items: [
					{
						id: product_id.toString(),
						title: 'Producto Tribal Trend',
						quantity: 1,
						unit_price: 50,
					},
				],
				back_urls: {
					success: 'https://tribaltrend.com.ar/login',
					failure: 'https://tribaltrend.com.ar/',
					pending: 'https://tribaltrend.com.ar/',
				},
				auto_return: 'approved',
				metadata: {
					status: 'pending',
					guest_id,
					product_id,
					integration_mode: mpMode,
				},
			},
		});

		return preference.init_point!;
	}

    async receivePaymentNotification(paymentId: string) {
        try {
            const res = await new MPayment(client).get({id: paymentId});
            
            const payment = JSON.parse(JSON.stringify(res));
            
            if(payment.status === 'approved'){
                // aca hago toda la logica de descontar stock de producto, crear el pago en la bd, etc
                // Primero, busco la metadata
                const metadata = payment.metadata;
                console.log("Metadata: ", metadata);

            }else {

            }
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new BadRequestException('Error processing payment notification');
        }
    }
}
