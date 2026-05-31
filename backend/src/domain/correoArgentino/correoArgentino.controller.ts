import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { CorreoArgentinoService } from './correoArgentino.service';
import { CorreoArgentinoRatesResponseDto } from './DTOs/rates-response-dto';

@ApiTags('Correo Argentino')
@Controller('correo-argentino')
export class CorreoArgentinoController {
  constructor(private readonly correoArgentinoService: CorreoArgentinoService) {}

  @Get('rates')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener cotizaciones de envío de Correo Argentino' })
  @ApiQuery({ name: 'postalCodeDestination', required: true, example: '5016' })
  @ApiQuery({ name: 'weight', required: true, example: 500, description: 'Peso en gramos' })
  @ApiQuery({ name: 'height', required: true, example: 10 })
  @ApiQuery({ name: 'width', required: true, example: 20 })
  @ApiQuery({ name: 'length', required: true, example: 30 })
  async getRates(
    @Query('postalCodeDestination') postalCodeDestination: string,
    @Query('weight') weight: string,
    @Query('height') height: string,
    @Query('width') width: string,
    @Query('length') length: string,
  ): Promise<CorreoArgentinoRatesResponseDto> {
    if (!postalCodeDestination) {
      throw new BadRequestException('postalCodeDestination es obligatorio');
    }

    console.log("lo lee?: ", process.env.CA_POSTAL_CODE_ORIGIN )

    const postalCodeOrigin = process.env.CA_POSTAL_CODE_ORIGIN ?? 'X5016';

    return this.correoArgentinoService.get_rates({
      customerId: '', // se resuelve internamente en el service
      postalCodeOrigin,
      postalCodeDestination,
      dimensions: {
        weight: Number(weight) || 500,
        height: Number(height) || 10,
        width: Number(width) || 20,
        length: Number(length) || 30,
      },
    });
  }
}