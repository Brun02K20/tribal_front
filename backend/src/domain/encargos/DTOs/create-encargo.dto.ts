import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateEncargoDto {
    @ApiProperty({ example: 12 })
    @IsInt()
    @Min(1)
    id_direccion!: number;

    @ApiProperty({
        example: 'Quiero un set artesanal personalizado con colores tierra y detalles en cobre.',
    })
    @IsString()
    descripcion!: string;
}
