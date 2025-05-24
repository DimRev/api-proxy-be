import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppConfigService } from 'src/shared/service/app-config.service';
import { ApiError } from 'src/shared/utils/api-error';
import { CustomLogger } from 'src/shared/utils/custom-logger';
import { z } from 'zod';
import { SearchV1Service } from './search-v1.service';
import {
  SearchResultResponse,
  PaginatedQueryHistoryResponse,
} from '@repo/interfaces';

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
  ): Promise<SearchResultResponse[] | undefined> {
    const startTS = Date.now();
    try {
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
      const endTS = Date.now();
      this.logger.log(
        `OK took: ${endTS - startTS}ms`,
        'search-v1.controller.getSearch',
      );
      return resp;
    } catch (err) {
      this.logger.error(
        `FAILED took: ${Date.now() - startTS}ms`,
        'search-v1.controller.getSearch',
      );
      throw err;
    }
  }

  @Post()
  async postSearch(
    @Body() bodyDto: any,
  ): Promise<SearchResultResponse[] | undefined> {
    const startTS = Date.now();
    try {
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
      const endTS = Date.now();
      this.logger.log(
        `OK took: ${endTS - startTS}ms`,
        'search-v1.controller.getSearch',
      );
      return resp;
    } catch (err) {
      const endTS = Date.now();
      this.logger.error(
        `FAILED took: ${endTS - startTS}ms`,
        'search-v1.controller.postSearch',
      );
      throw err;
    }
  }

  @Get('history')
  async getHistory(
    @Query('page') pageParam: string,
    @Query('pageSize') pageSizeParam: string,
  ): Promise<PaginatedQueryHistoryResponse | undefined> {
    const startTS = Date.now();
    try {
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
      const endTS = Date.now();
      this.logger.log(
        `OK took: ${endTS - startTS}ms`,
        'search-v1.controller.getHistory',
      );
      return resp;
    } catch (err) {
      const endTS = Date.now();
      this.logger.error(
        `FAILED took: ${endTS - startTS}ms`,
        'search-v1.controller.getHistory',
      );
      throw err;
    }
  }
}
