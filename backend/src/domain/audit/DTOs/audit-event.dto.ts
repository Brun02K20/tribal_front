import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import type { AuditEventType } from '../models/AuditLogs';

export const AUDIT_EVENT_TYPES: AuditEventType[] = [
  'USER_REGISTERED',
  'USER_LOGIN',
  'PAGE_VISITED',
  'PRODUCT_VIEWED',
  'PRODUCT_SEARCHED',
  'CHECKOUT_STARTED',
  'PAYMENT_STARTED',
  'PAYMENT_APPROVED',
  'ADDRESS_CREATED',
  'ACCOUNT_UPDATED',
];

export class CreateAuditEventDto {
  @ApiProperty({ example: 'PRODUCT_VIEWED', enum: AUDIT_EVENT_TYPES })
  @IsIn(AUDIT_EVENT_TYPES)
  event_type!: AuditEventType;

  @ApiPropertyOptional({ example: 'PRODUCT', nullable: true })
  @IsOptional()
  @IsString()
  entity_type?: string | null;

  @ApiPropertyOptional({ example: 15, nullable: true })
  @IsOptional()
  @IsInt()
  entity_id?: number | null;

  @ApiPropertyOptional({
    example: { product_name: 'Pulsera artesanal', source: 'product-detail' },
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;
}
