import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUpdateBlogDto {
    @ApiProperty({ example: 'Cómo elegir tu anillo artesanal' })
    @IsString()
    titulo!: string;

    @ApiProperty({ example: '<p>El cuerpo del artículo en HTML...</p>' })
    @IsString()
    cuerpo!: string;
}

export class GetBlogDto {
    id!: number;
    titulo!: string;
    cuerpo!: string;
    es_activo!: number;
    created_at!: string;
    fotos!: { id: number; url: string }[];
}

export class GetBlogListItemDto {
    id!: number;
    titulo!: string;
    es_activo!: number;
    created_at!: string;
    portada_url!: string | null;
}