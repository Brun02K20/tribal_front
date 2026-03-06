import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { AiService } from 'src/domain/ai/ai.service';
import { AiAdminSummaryResponseDto } from './DTOs/ai.dto';
import type { AiAdminSummaryResponse } from './types/ai.types';

@ApiTags('AI')
@ApiCookieAuth('cookieAuth')
@UseGuards(AuthGuard, Role1Guard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('admin-summary')
  @ApiOperation({
    summary: 'Resumen administrativo + sugerencias de acción (solo admin, máximo 1 vez por día)',
  })
  @ApiOkResponse({ type: AiAdminSummaryResponseDto })
  async getAdminSummary(): Promise<AiAdminSummaryResponse> {
    return this.aiService.getAdminSummary();
  }
}


