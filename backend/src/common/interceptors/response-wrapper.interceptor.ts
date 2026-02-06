import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Injectable()
export class ResponseWrapperInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Skip wrapping if already wrapped or if it's a streaming response
        if (data && data.success !== undefined && data.data !== undefined) {
          return data;
        }

        return {
          success: response.statusCode < 400,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request['requestId'],
        };
      }),
    );
  }
}
