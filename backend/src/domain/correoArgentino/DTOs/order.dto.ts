import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

export class OrderCreationAddressDto {
	@ApiPropertyOptional({ example: 'San Martin' })
	@IsOptional()
	@IsString()
	streetName?: string;

	@ApiPropertyOptional({ example: '1234' })
	@IsOptional()
	@IsString()
	streetNumber?: string;

	@ApiPropertyOptional({ example: '2' })
	@IsOptional()
	@IsString()
	floor?: string;

	@ApiPropertyOptional({ example: 'B' })
	@IsOptional()
	@IsString()
	apartment?: string;

	@ApiPropertyOptional({ example: 'Rosario' })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ example: 'AR-S' })
	@IsOptional()
	@IsString()
	provinceCode?: string;

	@ApiPropertyOptional({ example: '2000' })
	@IsOptional()
	@IsString()
	postalCode?: string;
}

export class OrderCreationSenderDto {
	@ApiPropertyOptional({ example: 'Juan Perez' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ example: '3415551234' })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiPropertyOptional({ example: '3415551234' })
	@IsOptional()
	@IsString()
	cellPhone?: string;

	@ApiPropertyOptional({ example: 'juan@correo.com' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ type: OrderCreationAddressDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => OrderCreationAddressDto)
	originAddress?: OrderCreationAddressDto;
}

export class OrderCreationRecipientDto {
	@ApiProperty({ example: 'Maria Lopez' })
	@IsString()
	name!: string;

	@ApiPropertyOptional({ example: '3415559876' })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiPropertyOptional({ example: '3415559876' })
	@IsOptional()
	@IsString()
	cellPhone?: string;

	@ApiProperty({ example: 'maria@correo.com' })
	@IsEmail()
	email!: string;
}

export class OrderCreationShippingAddressDto {
	@ApiPropertyOptional({ example: 'San Martin' })
	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	streetName?: string;

	@ApiPropertyOptional({ example: '1234' })
	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	streetNumber?: string;

	@ApiPropertyOptional({ example: '2', description: 'Se trunca a 3 caracteres' })
	@IsOptional()
	@IsString()
	floor?: string;

	@ApiPropertyOptional({ example: 'B', description: 'Se trunca a 3 caracteres' })
	@IsOptional()
	@IsString()
	apartment?: string;

	@ApiPropertyOptional({ example: 'Rosario' })
	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	city?: string;

	@ApiPropertyOptional({ example: 'AR-S' })
	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	provinceCode?: string;

	@ApiPropertyOptional({ example: '2000' })
	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	postalCode?: string;
}

export class OrderCreationShippingDto {
	@ApiProperty({ example: 'D', description: 'D = domicilio, S = sucursal' })
	@IsString()
	deliveryType!: string;

	@ApiProperty({ example: 'CP' })
	@IsString()
	productType!: string;

	@ApiPropertyOptional({ example: 'AG12345', description: 'Obligatorio solo para envio a sucursal' })
	@ValidateIf((dto) => dto.deliveryType === 'S')
	@IsString()
	agency?: string;

	@ApiPropertyOptional({ type: OrderCreationShippingAddressDto })
	@ValidateIf((dto) => dto.deliveryType !== 'S')
	@ValidateNested()
	@Type(() => OrderCreationShippingAddressDto)
	address?: OrderCreationShippingAddressDto;

	@ApiProperty({ example: 1000 })
	@IsNumber()
	weight!: number;

	@ApiProperty({ example: 2500 })
	@IsNumber()
	declaredValue!: number;

	@ApiProperty({ example: 20 })
	@IsNumber()
	height!: number;

	@ApiProperty({ example: 30 })
	@IsNumber()
	length!: number;

	@ApiProperty({ example: 15 })
	@IsNumber()
	width!: number;
}

export class OrderCreationRequestDto {
	@ApiProperty({ example: '0000550997' })
	@IsString()
	customerId!: string;

	@ApiProperty({ example: 'EXT-123456' })
	@IsString()
	extOrderId!: string;

	@ApiPropertyOptional({ example: 'ORDER-0001' })
	@IsOptional()
	@IsString()
	orderNumber?: string;

	@ApiPropertyOptional({ type: OrderCreationSenderDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => OrderCreationSenderDto)
	sender?: OrderCreationSenderDto;

	@ApiProperty({ type: OrderCreationRecipientDto })
	@ValidateNested()
	@Type(() => OrderCreationRecipientDto)
	recipient!: OrderCreationRecipientDto;

	@ApiProperty({ type: OrderCreationShippingDto })
	@ValidateNested()
	@Type(() => OrderCreationShippingDto)
	shipping!: OrderCreationShippingDto;
}

