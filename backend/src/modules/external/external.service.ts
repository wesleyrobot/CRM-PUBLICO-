import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LoggerService } from '../../common/logger/logger.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  async fetchExternalData(url: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Chamando API externa: ${url}`, 'ExternalService');
      
      const response = await firstValueFrom(
        this.httpService.get(url)
      );
      
      const duration = Date.now() - startTime;
      
      this.logger.logExternalAPI(
        'External API',
        'GET',
        url,
        response.status,
        duration,
      );
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(
        `Erro ao chamar API externa: ${error.message}`,
        error.stack,
        'ExternalService',
      );
      
      throw error;
    }
  }
}
