import { BadRequestException } from '@nestjs/common';
import { OrderCreationRequestDto } from '../DTOs/order.dto';

export function truncateTo3(value?: string | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return value.slice(0, 3);
}

export function normalizeOrderRequest(dto: OrderCreationRequestDto): OrderCreationRequestDto {
  const shipping = dto.shipping;
  const deliveryType = shipping.deliveryType;

  if (deliveryType === 'S' && !shipping.agency) {
    throw new BadRequestException('shipping.agency es obligatorio cuando shipping.deliveryType es S');
  }

  if (deliveryType !== 'S' && !shipping.address) {
    throw new BadRequestException('shipping.address es obligatorio cuando shipping.deliveryType no es S');
  }

  const normalizedAddress = shipping.address
    ? {
        ...shipping.address,
        floor: truncateTo3(shipping.address.floor),
        apartment: truncateTo3(shipping.address.apartment),
      }
    : shipping.address;

  const normalizedSender = dto.sender?.originAddress
    ? {
        ...dto.sender,
        originAddress: {
          ...dto.sender.originAddress,
          floor: truncateTo3(dto.sender.originAddress.floor),
          apartment: truncateTo3(dto.sender.originAddress.apartment),
        },
      }
    : dto.sender;

  return {
    ...dto,
    sender: normalizedSender,
    shipping: {
      ...shipping,
      address: normalizedAddress,
    },
  };
}