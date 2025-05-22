import { Module } from '@nestjs/common';
import { SearchV1Controller } from './search-v1.controller';
import { AppConfigService } from 'src/shared/service/app-config.service';

@Module({
  controllers: [SearchV1Controller],
  providers: [AppConfigService],
})
export class SearchModule {}
