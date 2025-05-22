import { Module } from '@nestjs/common';
import { SearchV1Controller } from './search-v1.controller';
import { AppConfigService } from 'src/shared/service/app-config.service';
import { SearchV1Service } from './search-v1.service';
import { HttpModule } from '@nestjs/axios';
import { QueryHistoryService } from 'src/shared/service/query-history.service';

@Module({
  imports: [HttpModule],
  controllers: [SearchV1Controller],
  providers: [AppConfigService, SearchV1Service, QueryHistoryService],
})
export class SearchModule {}
