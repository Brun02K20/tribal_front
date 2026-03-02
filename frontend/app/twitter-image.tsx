import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribaltrend.com.ar').replace(/\/+$/, '');
const logoUrl = `${siteUrl}/icons/logo_tribal_trnasparente.png`;

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f3e7',
          color: '#2f2f2f',
          fontSize: 54,
          fontWeight: 700,
          gap: 30,
        }}
      >
        <img
          src={logoUrl}
          width={240}
          height={240}
          alt="Tribal Trend"
          style={{ objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Tribal Trend</span>
          <span style={{ fontSize: 34, fontWeight: 500 }}>Artesanías hechas a mano</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
