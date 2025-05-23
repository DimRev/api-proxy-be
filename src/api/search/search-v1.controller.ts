import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppConfigService } from 'src/shared/service/app-config.service';
import { PaginatedQueryHistory } from 'src/shared/service/query-history.service';
import { ApiError } from 'src/shared/utils/api-error';
import { CustomLogger } from 'src/shared/utils/custom-logger';
import { z } from 'zod';
import { SearchResult } from './search-v1.interface';
import { SearchV1Service } from './search-v1.service';

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
    if (!query || query.length < 1) {
      this.logger.error(
        'Bad request: Query parameter is required',
        'search-v1.controller.getSearch',
      );
      throw ApiError.badRequest(
        'Query parameter is required',
        'query is required',
      );
    }

    const resp = await this.searchV1Service.getSearchResults(query);

    return resp;
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

    const resp = await this.searchV1Service.getSearchResults(query);
    return resp;
  }

  @Get('history')
  async getHistory(
    @Query('page') pageParam: string,
    @Query('pageSize') pageSizeParam: string,
  ): Promise<PaginatedQueryHistory | undefined> {
    const queryParamsSchema = z.object({
      page: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val), {
          message: 'page must be a valid number',
        })
        .refine((val) => val >= 1, {
          message: 'page must be greater than or equal to 1',
        }),
      pageSize: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val), {
          message: 'page must be a valid number',
        })
        .refine((val) => val >= 1, {
          message: 'page must be greater than or equal to 1',
        }),
    });

    const parsedQueryParams = queryParamsSchema.safeParse({
      page: pageParam,
      pageSize: pageSizeParam,
    });

    if (!parsedQueryParams.success) {
      const errorMessage = parsedQueryParams.error.errors
        .map((err) => err.message)
        .join(', ');
      this.logger.error(
        `Bad request: ${errorMessage}`,
        'search-v1.controller.getHistory',
      );
      throw ApiError.badRequest('Invalid request body', errorMessage);
    }

    const { page, pageSize } = parsedQueryParams.data;

    const resp = await this.searchV1Service.getHistory(page, pageSize);
    return resp;
  }
}
