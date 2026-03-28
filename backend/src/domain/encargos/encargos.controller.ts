import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { EncargosService } from './encargos.service';
import { CreateEncargoDto } from './DTOs/create-encargo.dto';
import { UpdatePresupuestoEncargoDto } from './DTOs/update-presupuesto-encargo.dto';

type RequestWithUser = Request & {
    user?: {
        sub?: number;
        id_rol?: number;
    };
};

@ApiTags('Encargos')
@Controller('encargos')
export class EncargosController {
    constructor(private readonly encargosService: EncargosService) {}

    @UseGuards(AuthGuard, Role2Guard)
    @ApiCookieAuth('cookieAuth')
    @Post()
    @ApiOperation({ summary: 'Crear encargo (cliente logueado)' })
    @ApiBody({ type: CreateEncargoDto })
    @ApiCreatedResponse({ description: 'Encargo creado correctamente' })
    async createEncargo(
        @Req() req: RequestWithUser,
        @Body() dto: CreateEncargoDto,
    ) {
        const userId = Number(req.user?.sub);
        return this.encargosService.createEncargo(userId, dto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Put(':id/presupuesto')
    @ApiOperation({ summary: 'Editar presupuesto de un encargo (admin)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdatePresupuestoEncargoDto })
    @ApiOkResponse({ description: 'Presupuesto actualizado correctamente' })
    async updatePresupuesto(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePresupuestoEncargoDto,
    ) {
        const adminUserId = Number(req.user?.sub);
        return this.encargosService.updatePresupuesto(id, adminUserId, dto);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Post(':id/generar-link-pago')
    @ApiOperation({ summary: 'Generar link de pago para un encargo y enviarlo por email (admin)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({
        description: 'URL de checkout de Mercado Pago y email destinatario.',
        schema: {
            type: 'object',
            properties: {
                init_point: { type: 'string' },
                email_sent_to: { type: 'string' },
            },
        },
    })
    async generatePaymentLink(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ init_point: string; email_sent_to: string }> {
        return this.encargosService.generatePaymentLink(
            id,
            {
                userId: Number(req.user?.sub),
                role: Number(req.user?.id_rol),
            },
        );
    }

    @UseGuards(AuthGuard, Role2Guard)
    @ApiCookieAuth('cookieAuth')
    @Get('mis')
    @ApiOperation({ summary: 'Listar encargos del usuario logueado' })
    @ApiOkResponse({ description: 'Listado de encargos del usuario' })
    async getMyEncargos(@Req() req: RequestWithUser) {
        const userId = Number(req.user?.sub);
        return this.encargosService.getEncargosByUser(userId);
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Get('admin/all')
    @ApiOperation({ summary: 'Listar todos los encargos (admin)' })
    @ApiOkResponse({ description: 'Listado completo de encargos' })
    async getAllEncargosForAdmin() {
        return this.encargosService.getEncargosForAdmin();
    }
}
