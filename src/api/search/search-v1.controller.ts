import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from 'src/shared/service/app-config.service';

@Controller('')
export class SearchV1Controller {
  constructor(private readonly apiConfigService: AppConfigService) {}

  @Get()
  getSearch(): string {
    const env = this.apiConfigService.env;
    const port = this.apiConfigService.port;
    return `This is the search endpoint running in ${env} mode on port ${port}!`;
  }
}
