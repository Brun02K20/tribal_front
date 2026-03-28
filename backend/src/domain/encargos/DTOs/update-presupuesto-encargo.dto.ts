import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdatePresupuestoEncargoDto {
    @ApiProperty({ example: 22.5 })
    @IsNumber()
    @Min(0.01)
    ancho!: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    @Min(0.01)
    alto!: number;

    @ApiProperty({ example: 4.5 })
    @IsNumber()
    @Min(0.01)
    profundo!: number;

    @ApiProperty({ example: 850 })
    @IsNumber()
    @Min(0.01)
    peso_en_gramos!: number;

    @ApiProperty({ example: 25000.5 })
    @IsNumber()
    @Min(0.01)
    presupuesto!: number;
}
