import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

class DimensionsDto {
    @ApiProperty({ example: 10 })
    @IsNumber()
    weight!: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    height!: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    width!: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    length!: number;
}

export class CorreoArgentinoRatesRequestDto {
    @ApiProperty({ example: "0900000234" })
    @IsString()
    customerId!: string;

    @ApiProperty({ example: "2000" })
    @IsString()
    postalCodeOrigin!: string;

    @ApiProperty({ example: "2000" })
    @IsString()
    postalCodeDestination!: string;

    @ApiProperty({type: DimensionsDto})
    dimensions!: DimensionsDto;
}

