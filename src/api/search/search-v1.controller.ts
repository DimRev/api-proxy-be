import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppConfigService } from 'src/shared/service/app-config.service';
import { SearchResult } from './search-v1.interface';
import { ApiError } from 'src/shared/utils/api-error';
import { SearchV1Service } from './search-v1.service';
import { CustomLogger } from 'src/shared/utils/custom-logger';
import { z } from 'zod';
import { QueryHistoryEntry } from 'src/shared/service/query-history.service';

@Controller('')
export class SearchV1Controller {
  private readonly logger = new CustomLogger(SearchV1Controller.name);

  constructor(
    private readonly apiConfigService: AppConfigService,
    private readonly searchV1Service: SearchV1Service,
  ) {}

  @Get()
  async getSearch(
    @Query('q') query: string,
  ): Promise<SearchResult[] | undefined> {
    if (!query) {
      this.logger.error(
        'Bad request: Query parameter is required',
        'search-v1.controller.getSearch',
      );
      throw ApiError.badRequest(
        'Query parameter is required',
        'query is required',
      );
    }

    return await this.searchV1Service.getSearchResults(query);
  }

  @Post()
  async postSearch(@Body() bodyDto: any): Promise<SearchResult[] | undefined> {
    const bodySchema = z.object({
      query: z.string().min(1, 'Query parameter is required'),
    });

    const parsedBody = bodySchema.safeParse(bodyDto);

    if (!parsedBody.success) {
      const errorMessage = parsedBody.error.errors
        .map((err) => err.message)
        .join(', ');
      this.logger.error(
        `Bad request: ${errorMessage}`,
        'search-v1.controller.postSearch',
      );
      throw ApiError.badRequest('Invalid request body', errorMessage);
    }

    const { query } = parsedBody.data;

    return await this.searchV1Service.getSearchResults(query);
  }

  @Get('history')
  async getHistory(): Promise<QueryHistoryEntry[] | undefined> {
    return await this.searchV1Service.getHistory();
  }
}
