import { Module } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [
    NestHttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [LoggerService],
  exports: [NestHttpModule, LoggerService],
})
export class HttpModule {}
