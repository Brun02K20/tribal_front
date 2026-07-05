import { Body, Controller, Get, Param, Query, Put, Post, UseGuards, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBody, ApiParam, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import {
    AccountConfigDto,
    AccountConfigGetDto,
    SuccessConfigUpdateDto,
    CreateDireccionDto,
    UserDireccionDto,
} from '../DTOs/user.dto';
import { AuthGuard } from '../utils/auth.guard';
import { Role2Guard } from '../utils/role2.guard';
import { AuditService } from 'src/domain/audit/audit.service';

@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly auditService: AuditService,
    ) { }

    @UseGuards(AuthGuard, Role2Guard)
    @ApiCookieAuth('cookieAuth')
    @Put('update-config')
    @ApiQuery({ name: 'userId', type: Number, required: true, description: 'ID del usuario a actualizar', example: 1 })
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

        const result = await this.usuariosService.updateAccountConfig(userId, data);
        await this.auditService.log({
            userId,
            eventType: 'ACCOUNT_UPDATED',
            entityType: 'USER',
            entityId: userId,
            metadata: {
                updatedFields: {
                    username: data.username !== undefined,
                    telefono: data.telefono !== undefined,
                    password: Boolean(data.password),
                    direcciones: data.direcciones !== undefined,
                },
            },
            request: req,
        });
        return result;
    }

    @UseGuards(AuthGuard, Role2Guard)
    @ApiCookieAuth('cookieAuth')
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

    @UseGuards(AuthGuard, Role2Guard)
    @ApiCookieAuth('cookieAuth')
    @Get(':userId/direcciones')
    @ApiParam({ name: 'userId', type: Number, description: 'ID del usuario', example: 1 })
    @ApiOkResponse({ type: UserDireccionDto, isArray: true })
    async getUserAddresses(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() req: Request & { user?: { sub?: number } },
    ): Promise<UserDireccionDto[]> {
        if (req.user?.sub !== userId) {
            throw new ForbiddenException('No puedes ver direcciones de otro usuario');
        }

        return this.usuariosService.getUserAddresses(userId);
    }

    @UseGuards(AuthGuard, Role2Guard)
    @ApiCookieAuth('cookieAuth')
    @Post(':userId/direcciones')
    @ApiParam({ name: 'userId', type: Number, description: 'ID del usuario', example: 1 })
    @ApiBody({ type: CreateDireccionDto })
    @ApiCreatedResponse({ type: UserDireccionDto })
    async createUserAddress(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() req: Request & { user?: { sub?: number } },
        @Body() data: CreateDireccionDto,
    ): Promise<UserDireccionDto> {
        if (req.user?.sub !== userId) {
            throw new ForbiddenException('No puedes crear direcciones para otro usuario');
        }

        const result = await this.usuariosService.createUserAddress(userId, data);
        await this.auditService.log({
            userId,
            eventType: 'ADDRESS_CREATED',
            entityType: 'ADDRESS',
            entityId: result.id,
            metadata: {
                id_ciudad: result.id_ciudad,
                id_provincia: result.id_provincia,
                cod_postal_destino: result.cod_postal_destino,
            },
            request: req,
        });
        return result;
    }
}

