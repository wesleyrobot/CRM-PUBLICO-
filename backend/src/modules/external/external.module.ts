import { Module } from '@nestjs/common';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';
import { HttpModule } from '../../common/http/http.module';
import { LoggerService } from '../../common/logger/logger.service';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [HttpModule, WinstonModule],
  controllers: [ExternalController],
  providers: [ExternalService, LoggerService],
  exports: [ExternalService],
})
export class ExternalModule {}
