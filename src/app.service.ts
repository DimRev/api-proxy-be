import { Injectable } from '@nestjs/common';
import { AppConfigService } from './shared/service/app-config.service';

@Injectable()
export class AppService {
  constructor(private readonly appConfigService: AppConfigService) {}

  getHello(): string {
    const port = this.appConfigService.port;
    const env = this.appConfigService.env;

    return `Hello, this is the API proxy server running on port ${port} in ${env} mode`;
  }
}
