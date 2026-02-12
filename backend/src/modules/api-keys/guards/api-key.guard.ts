import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key não fornecida');
    }

    const keyRecord = await this.apiKeyRepository.findOne({
      where: { chave: apiKey, ativo: true, deletado_em: null },
      relations: ['usuario'],
    });

    if (!keyRecord) {
      throw new UnauthorizedException('API Key inválida ou inativa');
    }

    // Verificar se a chave expirou
    if (keyRecord.expira_em && new Date() > keyRecord.expira_em) {
      throw new UnauthorizedException('API Key expirada');
    }

    // Atualizar último uso
    await this.apiKeyRepository.update(keyRecord.id, {
      ultimo_uso: new Date(),
    });

    // Adicionar informações ao request
    request.apiKey = keyRecord;
    request.user = keyRecord.usuario;

    return true;
  }

  private extractApiKey(request: any): string | undefined {
    // Procura a API Key em diferentes lugares:
    // 1. Header X-API-Key
    const headerKey = request.headers['x-api-key'];
    if (headerKey) return headerKey;

    // 2. Header Authorization: Bearer <key>
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 3. Query parameter
    return request.query.api_key;
  }
}
