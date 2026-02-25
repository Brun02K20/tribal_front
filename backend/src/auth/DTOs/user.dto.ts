import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class DireccionDto {
    @ApiProperty({ example: 'X5016' })
    @IsString()
    cod_postal_destino!: string;

    @ApiProperty({ example: 'Calle Falsa' })
    @IsString()
    calle!: string;

    @ApiProperty({ example: '123' })
    @IsString()
    altura!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_provincia!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_ciudad!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_usuario!: number;
}

export class AccountConfigDto {
    @ApiProperty({ example: 'Macramé' })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ example: '+543513576662' })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiProperty({ example: 'Pene123' })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({ example: [
        {
            cod_postal_destino: 'X5016',
            calle: 'Calle Falsa',
            altura: '123',
            id_provincia: 1,
            id_ciudad: 1,
            id_usuario: 1,
        }
    ]})
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DireccionDto)
    direcciones?: DireccionDto[];
}

export class AccountConfigGetDto {
    @ApiProperty({ example: 'Bruno Virinni' })
    @IsOptional()
    @IsString()
    nombre: string | null = null;

    @ApiProperty({ example: 'bvirinni@gmaill.com' })
    @IsOptional()
    @IsString()
    email: string | null = null;


    @ApiProperty({ example: 'BrunoV' })
    @IsOptional()
    @IsString()
    username: string | null = null;

    @ApiProperty({ example: '+543513576662', nullable: true })
    @IsOptional()
    @IsString()
    telefono: string | null = null;

    @ApiProperty({ example: [
        {
            cod_postal_destino: 'X5016',
            calle: 'Calle Falsa',
            altura: '123',
            id_provincia: 1,
            id_ciudad: 1,
            id_usuario: 1,
        }
    ]})
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DireccionDto)
    direcciones: DireccionDto[] = [];
}

export class DireccionListDto {
    @ApiProperty({ example: [
        {
            cod_postal_destino: 'X5016',
            calle: 'Calle Falsa',
            altura: '123',
            id_provincia: 1,
            id_ciudad: 1,
            id_usuario: 1,
        }
    ]})
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DireccionDto)
    direcciones: DireccionDto[] = [];
}

export class SuccessConfigUpdateDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 'Configuración de cuenta actualizada exitosamente' })
    @IsString()
    message!: string;
}