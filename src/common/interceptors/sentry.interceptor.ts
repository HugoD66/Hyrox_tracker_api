import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as Sentry from '@sentry/nestjs';

interface AuthenticatedUser {
  email?: string;
  id?: string;
}

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    const user = request.user as AuthenticatedUser | undefined;

    if (user?.id || user?.email) {
      Sentry.setUser({
        userId: user.id,
        email: user.email,
      });
    }

    Sentry.setTag('method', request.method);
    Sentry.setTag('route', request.route?.path ?? request.url);

    return next.handle();
  }
}
