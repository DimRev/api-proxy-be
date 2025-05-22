import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    const port = this.configService.get<number>('PORT');
    if (!port) {
      throw new Error('PORT environment variable is not set');
    }
    return port;
  }

  get env(): string {
    const env = this.configService.get<string>('NODE_ENV');
    if (!env) {
      throw new Error('NODE_ENV environment variable is not set');
    }
    return env;
  }
}
