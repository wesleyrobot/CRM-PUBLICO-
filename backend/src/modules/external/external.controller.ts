import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExternalService } from './external.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('external')
@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Public()
  @Get('fetch')
  @ApiOperation({ summary: 'Buscar dados de API externa (exemplo de logs)' })
  @ApiQuery({ name: 'url', required: false, example: 'https://jsonplaceholder.typicode.com/posts/1' })
  async fetchData(@Query('url') url?: string) {
    const defaultUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    return this.externalService.fetchExternalData(url || defaultUrl);
  }
}
