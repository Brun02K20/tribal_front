import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateAuditEventDto } from './DTOs/audit-event.dto';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('events')
  @HttpCode(204)
  @ApiOperation({ summary: 'Registrar evento de auditoria desde frontend' })
  @ApiBody({ type: CreateAuditEventDto })
  @ApiResponse({ status: 204, description: 'Evento registrado' })
  async trackEvent(@Body() body: CreateAuditEventDto, @Req() request: Request): Promise<void> {
    await this.auditService.log({
      eventType: body.event_type,
      entityType: body.entity_type,
      entityId: body.entity_id,
      metadata: body.metadata,
      request,
    });
  }
}
