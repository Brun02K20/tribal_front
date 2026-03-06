import type { Response, CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';

const jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 604800);

const resolveCookieOptions = (): CookieOptions => {
  const explicitSecure = process.env.AUTH_COOKIE_SECURE;
  const secure =
    explicitSecure === 'true'
      ? true
      : explicitSecure === 'false'
        ? false
        : process.env.NODE_ENV === 'production';

  const sameSite = secure ? 'none' : 'lax';

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: jwtExpiresInSeconds * 1000,
    path: '/',
    domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
  };
};

export const setAuthCookie = (response: Response, token: string) => {
  response.cookie(AUTH_COOKIE_NAME, token, resolveCookieOptions());
};

export const clearAuthCookie = (response: Response) => {
  response.clearCookie(AUTH_COOKIE_NAME, {
    ...resolveCookieOptions(),
    maxAge: undefined,
  });
};
