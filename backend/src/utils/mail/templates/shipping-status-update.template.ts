export interface ShippingStatusEmailContext {
	pedidoId: number;
	nombreCliente: string;
	estadoEnvio: string;
}

export interface ShippingStatusEmailContent {
	text: string;
	html: string;
	orderUrl: string;
}

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

const buildText = (context: ShippingStatusEmailContext, orderUrl: string): string => {
	return [
		`Hola ${context.nombreCliente},`,
		'',
		`Se modificó el estado de envío de tu pedido #${context.pedidoId}.`,
		`Nuevo estado: ${context.estadoEnvio}.`,
		'',
		`Podés ver el detalle del pedido en: ${orderUrl}`,
	].join('\n');
};

const buildHtml = (context: ShippingStatusEmailContext, orderUrl: string): string => {
	return `
		<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
			<h2 style="margin:0 0 12px;">Actualización de envío</h2>
			<p style="margin:0 0 12px;">Hola ${escapeHtml(context.nombreCliente)},</p>
			<p style="margin:0 0 8px;">Se modificó el estado de envío de tu pedido <strong>#${context.pedidoId}</strong>.</p>
			<p style="margin:0 0 16px;">Nuevo estado: <strong>${escapeHtml(context.estadoEnvio)}</strong>.</p>
			<p style="margin:0;">
				<a href="${orderUrl}" style="display:inline-block;padding:10px 14px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Ver pedido</a>
			</p>
			<p style="margin-top:10px;color:#6b7280;font-size:12px;">Si el botón no funciona, copiá este enlace: ${orderUrl}</p>
		</div>
	`;
};

export const buildShippingStatusUpdateEmailContent = (
	context: ShippingStatusEmailContext,
	frontendBaseUrl: string,
): ShippingStatusEmailContent => {
	const orderUrl = buildOrderUrl(frontendBaseUrl, context.pedidoId);

	return {
		text: buildText(context, orderUrl),
		html: buildHtml(context, orderUrl),
		orderUrl,
	};
};
