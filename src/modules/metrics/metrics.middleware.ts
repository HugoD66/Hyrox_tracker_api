import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';

type RoutePath = string | RegExp | Array<string | RegExp>;
type ExpressRoute = {
  path?: RoutePath;
};

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (this.isMetricsEndpoint(req)) {
      next();
      return;
    }

    const startedAt = process.hrtime.bigint();
    const method = req.method;

    this.metricsService.incrementHttpRequestsInFlight(method);

    res.once('finish', () => {
      const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

      this.metricsService.decrementHttpRequestsInFlight(method);
      this.metricsService.recordHttpRequest(
        method,
        this.resolveRoute(req),
        res.statusCode,
        durationSeconds,
      );
    });

    next();
  }

  private isMetricsEndpoint(req: Request): boolean {
    const path = this.originalPath(req);

    return path === '/metrics' || path === '/api/metrics';
  }

  private resolveRoute(req: Request): string {
    const route = req.route as ExpressRoute | undefined;
    const routePath = this.stringifyRoutePath(route?.path);

    if (routePath) {
      const baseUrl = req.baseUrl || '';
      const fullRoute = routePath.startsWith(baseUrl)
        ? routePath
        : `${baseUrl}${this.ensureLeadingSlash(routePath)}`;

      return this.ensureLeadingSlash(fullRoute);
    }

    return this.normalizeUnknownRoute(this.requestPath(req));
  }

  private stringifyRoutePath(path?: RoutePath): string | null {
    if (!path) {
      return null;
    }

    if (Array.isArray(path)) {
      return path
        .map((item) => this.stringifyRoutePath(item))
        .filter(Boolean)
        .join('|');
    }

    if (path instanceof RegExp) {
      return path.toString();
    }

    return path;
  }

  private requestPath(req: Request): string {
    return req.path || this.originalPath(req);
  }

  private originalPath(req: Request): string {
    return (req.originalUrl || req.url || '/').split('?')[0] || '/';
  }

  private normalizeUnknownRoute(path: string): string {
    return this.ensureLeadingSlash(path)
      .replace(
        /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=\/|$)/g,
        '/:id',
      )
      .replace(/\/\d+(?=\/|$)/g, '/:id');
  }

  private ensureLeadingSlash(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
  }
}
