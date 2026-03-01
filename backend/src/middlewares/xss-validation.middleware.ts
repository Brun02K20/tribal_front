import { BadRequestException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { findSuspiciousInputPaths } from 'src/utils/security/xss-detector';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH']);

export const xssValidationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
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
