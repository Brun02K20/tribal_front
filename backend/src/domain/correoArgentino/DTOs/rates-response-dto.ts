import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CorreoArgentinoRateItemDto {
  @ApiProperty({ example: 'D', description: 'Tipo de entrega: D (domicilio) | S (sucursal)' })
  @IsString()
  deliveredType!: string;

  @ApiProperty({ example: 'CP', description: 'Código de producto' })
  @IsString()
  productType!: string;

  @ApiProperty({ example: 'Correo Argentino Clasico', description: 'Nombre del producto' })
  @IsString()
  productName!: string;

  @ApiProperty({ example: 498.06 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: '2' })
  @IsString()
  deliveryTimeMin!: string;

  @ApiProperty({ example: '5' })
  @IsString()
  deliveryTimeMax!: string;
}

export class CorreoArgentinoRatesResponseDto {
  @ApiProperty({ example: '0000550997' })
  @IsString()
  customerId!: string;

  @ApiProperty({ example: '2022-06-07T10:31:27.881-03:00' })
  @IsString()
  validTo!: string;

  @ApiProperty({ type: [CorreoArgentinoRateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorreoArgentinoRateItemDto)
  rates!: CorreoArgentinoRateItemDto[];
}
