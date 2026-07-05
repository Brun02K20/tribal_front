import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME } from 'src/auth/utils/auth-cookie';
import { AuditEventType, AuditLogs } from './models/AuditLogs';

export type AuditLogInput = {
  userId?: number | null;
  eventType: AuditEventType;
  entityType?: string | null;
  entityId?: number | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  request?: Request;
};

@Injectable()
export class AuditService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuditService.name);

  async onApplicationBootstrap(): Promise<void> {
    await AuditLogs.sync({ force: false });
  }

  async log(input: AuditLogInput): Promise<void> {
    try {
      await AuditLogs.create({
        user_id: input.userId ?? this.getUserIdFromRequest(input.request) ?? null,
        event_type: input.eventType,
        entity_type: this.normalizeNullableString(input.entityType),
        entity_id: input.entityId ?? null,
        metadata: this.sanitizeMetadata(input.metadata),
        ip: this.normalizeNullableString(input.ip ?? this.getIpFromRequest(input.request)),
        created_at: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `No se pudo registrar evento de auditoria ${input.eventType}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  getIpFromRequest(request?: Request): string | null {
    if (!request) {
      return null;
    }

    const cfConnectingIp = request.headers['cf-connecting-ip'];
    if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
      return cfConnectingIp.trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return realIp.trim();
    }

    const forwardedFor = request.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      return forwardedFor.split(',')[0]?.trim() ?? null;
    }

    if (Array.isArray(forwardedFor) && forwardedFor[0]) {
      return forwardedFor[0].split(',')[0]?.trim() ?? null;
    }

    return request.ip || request.socket?.remoteAddress || null;
  }

  getUserIdFromRequest(request?: Request): number | null {
    if (!request) {
      return null;
    }

    const requestUser = (request as Request & { user?: { sub?: number } }).user;
    if (requestUser?.sub) {
      return Number(requestUser.sub);
    }

    const token = this.extractToken(request);
    if (!token || !process.env.JWT_SECRET) {
      return null;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET) as { sub?: number };
      return payload.sub ? Number(payload.sub) : null;
    } catch {
      return null;
    }
  }

  private extractToken(request: Request): string | null {
    const parsedCookies = request['cookies'] as Record<string, string> | undefined;
    const cookieToken = parsedCookies?.[AUTH_COOKIE_NAME];
    if (cookieToken) {
      return cookieToken;
    }

    const cookie = request.headers.cookie;
    const cookieMatch = cookie?.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
    if (cookieMatch?.[1]) {
      return decodeURIComponent(cookieMatch[1]);
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length);
    }

    return null;
  }

  private sanitizeMetadata(value?: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const forbiddenKeys = new Set(['password', 'password_hash', 'token', 'idToken', 'access_token']);
    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, item]) => {
      if (!forbiddenKeys.has(key)) {
        acc[key] = item;
      }
      return acc;
    }, {});
  }

  private normalizeNullableString(value?: string | null): string | null {
    const normalized = typeof value === 'string' ? value.trim() : '';
    return normalized.length ? normalized : null;
  }
}
