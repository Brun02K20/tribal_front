import { Body, Controller, Get, Param, Query, Put, UseGuards, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import { AccountConfigDto, AccountConfigGetDto, SuccessConfigUpdateDto } from '../DTOs/user.dto';
import { AuthGuard } from '../utils/auth.guard';
import { Role2Guard } from '../utils/role2.guard';

@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @UseGuards(AuthGuard, Role2Guard)
    @ApiBearerAuth('bearer')
    @Put('update-config')
    @ApiBody({ type: AccountConfigDto })
    @ApiOkResponse({ type: SuccessConfigUpdateDto })
    async updateAccountConfig(
        @Query('userId', ParseIntPipe) userId: number,
        @Req() req: Request & { user?: { sub?: number } },
        @Body() data: AccountConfigDto,
    ): Promise<SuccessConfigUpdateDto> {
        if (req.user?.sub !== userId) {
            throw new ForbiddenException('No puedes actualizar la configuración de otro usuario');
        }

        return this.usuariosService.updateAccountConfig(userId, data);
    }

    @UseGuards(AuthGuard, Role2Guard)
    @ApiBearerAuth('bearer')
    @Get('get-config/:userId')
    @ApiParam({ name: 'userId', type: Number, description: 'ID of the user to get config for', example: 1 })
    @ApiOkResponse({ type: AccountConfigGetDto })
    async getAccountConfig(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() req: Request & { user?: { sub?: number } },
    ): Promise<AccountConfigGetDto> {
        if (req.user?.sub !== userId) {
            throw new ForbiddenException('No puedes ver la configuración de otro usuario');
        }
        return this.usuariosService.getAccountConfig(userId);
    }
}