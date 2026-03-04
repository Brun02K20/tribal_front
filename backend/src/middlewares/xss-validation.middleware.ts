import { BadRequestException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { findSuspiciousInputPaths } from 'src/utils/security/xss-detector';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH']);

export const xssValidationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const suspiciousQueryPaths = findSuspiciousInputPaths(req.query, 'query');
  if (suspiciousQueryPaths.length) {
    throw new BadRequestException(
      `Entrada rechazada por seguridad. Query params sospechosos: ${suspiciousQueryPaths.join(', ')}`,
    );
  }

  const suspiciousParamsPaths = findSuspiciousInputPaths(req.params, 'params');
  if (suspiciousParamsPaths.length) {
    throw new BadRequestException(
      `Entrada rechazada por seguridad. Params sospechosos: ${suspiciousParamsPaths.join(', ')}`,
    );
  }

  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const suspiciousPaths = findSuspiciousInputPaths(req.body);
  if (suspiciousPaths.length) {
    throw new BadRequestException(
      `Entrada rechazada por seguridad. Campos sospechosos: ${suspiciousPaths.join(', ')}`,
    );
  }

  next();
};
