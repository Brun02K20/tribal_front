import { ApiProperty } from '@nestjs/swagger';

export class BarMetricItemDto {
  @ApiProperty({ example: '2026-03' })
  label!: string;

  @ApiProperty({ example: 42 })
  value!: number;
}

export class PieMetricItemDto {
  @ApiProperty({ example: 'Aprobado' })
  label!: string;

  @ApiProperty({ example: 120 })
  value!: number;
}

export class ProductSalesMetricItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Mate Imperial' })
  nombre!: string;

  @ApiProperty({ example: 85 })
  unidadesVendidas!: number;
}

export class ProductRatingMetricItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Mate Imperial' })
  nombre!: string;

  @ApiProperty({ example: 4.9 })
  promedioCalificacion!: number;

  @ApiProperty({ example: 135 })
  totalResenas!: number;
}

export class ClientOrdersMetricItemDto {
  @ApiProperty({ example: 14 })
  id!: number;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ example: 'juan@email.com' })
  email!: string;

  @ApiProperty({ example: 24 })
  pedidos!: number;
}

export class MetricasResponseDto {
  @ApiProperty({
    example: {
      topMasVendidos: [{ id: 1, nombre: 'Mate Imperial', unidadesVendidas: 85 }],
      topMenosVendidos: [{ id: 9, nombre: 'Bombilla Clásica', unidadesVendidas: 2 }],
      vendidosPorMes: [{ label: '2026-03', value: 120 }],
      topMejorCalificados: [{ id: 3, nombre: 'Hilo Macramé', promedioCalificacion: 4.95, totalResenas: 80 }],
      topPeorCalificados: [{ id: 11, nombre: 'Aguja X', promedioCalificacion: 2.1, totalResenas: 12 }],
    },
  })
  productos!: unknown;

  @ApiProperty({
    example: {
      promedioGastadoTotal: 23450.5,
      maximaVenta: 82000,
      minimaVenta: 1500,
      ventasPorMesCantidad: [{ label: '2026-03', value: 31 }],
      ventasPorMesMonto: [{ label: '2026-03', value: 420000 }],
    },
  })
  ventasPagos!: unknown;

  @ApiProperty({
    example: {
      cantidadPorEstadoPedido: [{ label: 'Aprobado', value: 54 }],
      cantidadPorEstadoEnvio: [{ label: 'En camino', value: 21 }],
      pedidosPorMes: [{ label: '2026-03', value: 33 }],
    },
  })
  pedidos!: unknown;

  @ApiProperty({
    example: {
      porcentajeConPedido: {
        conPedido: 35,
        sinPedido: 12,
        porcentajeConPedido: 74.47,
        porcentajeSinPedido: 25.53,
        totalClientes: 47,
      },
      usuariosRegistradosPeriodo: 23,
      topConMasPedidos: [{ id: 4, nombre: 'Ana', email: 'ana@mail.com', pedidos: 19 }],
    },
  })
  clientes!: unknown;
}
