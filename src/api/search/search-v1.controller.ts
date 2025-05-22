import { Controller, Get, Query } from '@nestjs/common';
import { AppConfigService } from 'src/shared/service/app-config.service';
import { SearchResult } from './search-v1.interface';
import { ApiError } from 'src/shared/utils/api-error';
import { SearchV1Service } from './search-v1.service';

@Controller('')
export class SearchV1Controller {
  constructor(
    private readonly apiConfigService: AppConfigService,
    private readonly searchV1Service: SearchV1Service,
  ) {}

  @Get()
  async getSearch(
    @Query('q') query: string,
  ): Promise<SearchResult[] | undefined> {
    if (!query) {
      throw ApiError.badRequest(
        'Query parameter is required',
        'query is required',
      );
    }

    return await this.searchV1Service.getSearchResults(query);
  }
}
