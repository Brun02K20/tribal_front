import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  CorreoArgentinoValidateUserResponseDto,
} from './DTOs/auth-dto';
import { OrderCreationRequestDto } from './DTOs/order.dto';
import { CorreoArgentinoRatesRequestDto } from './DTOs/rates-dto';
import { CorreoArgentinoRatesResponseDto } from './DTOs/rates-response-dto';
import { normalizeOrderRequest } from './utils/order-normalizer';

@Injectable()
export class CorreoArgentinoService {
  private readonly logger = new Logger(CorreoArgentinoService.name);

  private readonly url = process.env.CA_API_URL
    ?? 'https://api.correoargentino.com.ar/micorreo/v1';
  private readonly apiUser = process.env.CA_API_USER ?? '';
  private readonly apiPassword = process.env.CA_API_PASSWORD ?? '';
  private readonly caEmail = process.env.CA_MICORREO_EMAIL ?? '';
  private readonly caPassword = process.env.CA_MICORREO_PASSWORD ?? '';

  async validate_user(): Promise<CorreoArgentinoValidateUserResponseDto> {
    const start = Date.now();
    this.logger.log(`validate_user: iniciando autenticación`);

    const basicAuth = 'Basic ' + btoa(`${this.apiUser}:${this.apiPassword}`);

    let loginResponse;
    try {
      loginResponse = await fetch(`${this.url}/token`, {
        method: 'POST',
        headers: { Authorization: basicAuth },
      });
    } catch (err) {
      this.logger.error('validate_user: error de red /token', err as any);
      throw new BadRequestException('Error de red al autenticar con CorreoArgentino');
    }

    const loginData = await loginResponse.json().catch(() => null);
    if (!loginResponse.ok) {
      this.logger.error(`validate_user: /token status=${loginResponse.status}`);
      throw new BadRequestException('Invalid credentials');
    }

    const token: string = loginData?.token ?? loginData?.access_token ?? '';

    let validateResponse;
    try {
      validateResponse = await fetch(`${this.url}/users/validate`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: this.caEmail, password: this.caPassword }),
      });
    } catch (err) {
      this.logger.error('validate_user: error de red /users/validate', err as any);
      throw new BadRequestException('Error de red al validar usuario en CorreoArgentino');
    }

    const validateData = await validateResponse.json().catch(() => null);
    if (!validateResponse.ok) {
      this.logger.error(`validate_user: /users/validate status=${validateResponse.status}`);
      throw new BadRequestException('No se pudo validar el usuario en CorreoArgentino');
    }

    this.logger.log(`validate_user: completado en ${Date.now() - start}ms`);

    return {
      customerId: validateData.customerId,
      createdAt: validateData.createdAt,
      token,
    };
  }

  async get_rates(
    ratesRequestDto: CorreoArgentinoRatesRequestDto,
  ): Promise<CorreoArgentinoRatesResponseDto> {
    const start = Date.now();
    this.logger.log(`get_rates: from=${ratesRequestDto.postalCodeOrigin} to=${ratesRequestDto.postalCodeDestination}`);

    const auth = await this.validate_user();
    const token = auth.token;

    // Si no viene customerId, usar el obtenido en validate_user
    const payload = {
      ...ratesRequestDto,
      customerId: ratesRequestDto.customerId || auth.customerId,
    };

    let response;
    try {
      response = await fetch(`${this.url}/rates`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      this.logger.error('get_rates: error de red /rates', err as any);
      throw new BadRequestException('Error de red al obtener cotizaciones');
    }

    const responseData = await response.json().catch(() => null);
    if (!response.ok) {
      const msg = responseData?.message ?? JSON.stringify(responseData);
      this.logger.error(`get_rates: /rates status=${response.status} msg=${msg}`);
      throw new BadRequestException(`Error fetching rates: ${msg}`);
    }

    this.logger.log(`get_rates: completado en ${Date.now() - start}ms`);

    return {
      customerId: responseData.customerId,
      validTo: responseData.validTo,
      rates: (responseData.rates || []).map((rate: any) => ({
        deliveredType: rate.deliveredType,
        productType: rate.productType,
        productName: rate.productName,
        price: rate.price,
        deliveryTimeMin: rate.deliveryTimeMin,
        deliveryTimeMax: rate.deliveryTimeMax,
      })),
    };
  }

  async import_order_to_CA(
    orderRequest: OrderCreationRequestDto,
  ): Promise<{ createdAt: string }> {
    const start = Date.now();
    const normalizedOrder = normalizeOrderRequest(orderRequest);
    this.logger.log(`import_order_to_CA: extOrderId=${normalizedOrder.extOrderId}`);

    const auth = await this.validate_user();
    const token = auth.token;

    // Usar el customerId del validate_user si no viene en el request
    if (!normalizedOrder.customerId) {
        normalizedOrder.customerId = auth.customerId;
    }

    let response;
    try {
      response = await fetch(`${this.url}/shipping/import`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedOrder),
      });
    } catch (err) {
      this.logger.error('import_order_to_CA: error de red', err as any);
      throw new BadRequestException('Error de red al importar la orden en CorreoArgentino');
    }

    const responseData = await response.json().catch(() => null);
    if (!response.ok) {
      const msg = responseData?.message ?? JSON.stringify(responseData);
      this.logger.error(`import_order_to_CA: status=${response.status} msg=${msg}`);
      throw new BadRequestException(`Error importing order: ${msg}`);
    }

    this.logger.log(`import_order_to_CA: completado en ${Date.now() - start}ms`);
    return { createdAt: responseData?.createdAt };
  }
}