export interface NotificacionProducto {
	nombre: string;
	unidades: number;
	subtotal: number;
}

export interface PurchaseNotificationContext {
	pedidoId: number;
	usuarioId: number;
	nombreCliente: string;
	emailCliente: string;
	productos: NotificacionProducto[];
	costoTotalProductos: number;
	costoEnvio: number;
	costoGananciaEnvio: number;
	montoTotalPago: number;
}

export interface PurchaseNotificationContent {
	text: string;
	html: string;
	orderUrl: string;
}

const formatCurrency = (value: number): string => `$${Number(value || 0).toFixed(2)}`;

const escapeHtml = (value: string): string => {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

const buildOrderUrl = (frontendBaseUrl: string, pedidoId: number): string => {
	const normalizedBaseUrl = frontendBaseUrl.replace(/\/$/, '');
	return `${normalizedBaseUrl}/mis-pedidos/${pedidoId}`;
};

const buildPurchaseSummaryText = (context: PurchaseNotificationContext, orderUrl: string): string => {
	const detalleProductos = context.productos
		.map(
			(item, index) =>
				`${index + 1}. ${item.nombre} | Unidades: ${item.unidades} | Subtotal: ${formatCurrency(item.subtotal)}`,
		)
		.join('\n');

	return [
		`Cliente: ${context.nombreCliente} (ID ${context.usuarioId})`,
		'',
		'Detalle de compra:',
		detalleProductos,
		'',
		'Detalle de costos:',
		`- Total productos: ${formatCurrency(context.costoTotalProductos)}`,
		`- Costo envío: ${formatCurrency(context.costoEnvio)}`,
		`- Ganancia envío: ${formatCurrency(context.costoGananciaEnvio)}`,
		`- Costo total: ${formatCurrency(context.montoTotalPago)}`,
		'',
		`Ver pedido: ${orderUrl}`,
	].join('\n');
};

const buildPurchaseSummaryHtml = (context: PurchaseNotificationContext, orderUrl: string): string => {
	const productRows = context.productos
		.map(
			(item) => `
				<tr>
					<td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(item.nombre)}</td>
					<td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${item.unidades}</td>
					<td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.subtotal)}</td>
				</tr>
			`,
		)
		.join('');

	return `
		<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
			<h2 style="margin:0 0 16px;">Nueva compra #${context.pedidoId}</h2>
			<p style="margin:0 0 12px;"><strong>Cliente:</strong> ${escapeHtml(context.nombreCliente)} (ID ${context.usuarioId})</p>

			<h3 style="margin:20px 0 8px;">Detalle de compra</h3>
			<table style="border-collapse:collapse;width:100%;max-width:760px;">
				<thead>
					<tr>
						<th style="padding:8px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Producto</th>
						<th style="padding:8px;border:1px solid #e5e7eb;text-align:center;background:#f9fafb;">Unidades</th>
						<th style="padding:8px;border:1px solid #e5e7eb;text-align:right;background:#f9fafb;">Subtotal</th>
					</tr>
				</thead>
				<tbody>
					${productRows}
				</tbody>
			</table>

			<h3 style="margin:20px 0 8px;">Detalle de costos</h3>
			<ul style="padding-left:20px;margin:0 0 16px;">
				<li>Total productos: ${formatCurrency(context.costoTotalProductos)}</li>
				<li>Costo envío: ${formatCurrency(context.costoEnvio)}</li>
				<li>Ganancia envío: ${formatCurrency(context.costoGananciaEnvio)}</li>
				<li><strong>Costo total: ${formatCurrency(context.montoTotalPago)}</strong></li>
			</ul>

			<p style="margin:0;">
				<a href="${orderUrl}" style="display:inline-block;padding:10px 14px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Ver pedido</a>
			</p>
			<p style="margin-top:10px;color:#6b7280;font-size:12px;">Si el botón no funciona, copiá este enlace: ${orderUrl}</p>
		</div>
	`;
};

export const buildPurchaseNotificationContent = (
	context: PurchaseNotificationContext,
	frontendBaseUrl: string,
): PurchaseNotificationContent => {
	const orderUrl = buildOrderUrl(frontendBaseUrl, context.pedidoId);

	return {
		text: buildPurchaseSummaryText(context, orderUrl),
		html: buildPurchaseSummaryHtml(context, orderUrl),
		orderUrl,
	};
};
