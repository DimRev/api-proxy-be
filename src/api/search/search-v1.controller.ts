import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppConfigService } from 'src/shared/service/app-config.service';
import { ApiError } from 'src/shared/utils/api-error';
import { CustomLogger } from 'src/shared/utils/custom-logger';
import { z } from 'zod';
import { SearchV1Service } from './search-v1.service';
import {
  SearchResultResponse,
  PaginatedQueryHistoryResponse,
  GetSearchRequestParams,
  PostSearchRequestBody,
  GetHistoryRequestParams,
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
    @Query() unparsedParams: GetSearchRequestParams,
  ): Promise<SearchResultResponse[] | undefined> {
    const startTS = Date.now();
    try {
      const paramsSchema = z.object({
        q: z.string().min(1, 'Search query is required'),
      });

      const parsedParams = paramsSchema.safeParse(unparsedParams);

      if (!parsedParams.success) {
        const errMsg = parsedParams.error.errors
          .map((error) => {
            const path = error.path.join('.');
            return `[${path}] ${error.message}`;
          })
          .join(', ');

        throw ApiError.badRequest(
          'Bad request: Malformed params',
          errMsg,
          undefined,
          'search-v1.controller.getSearch',
          this.logger,
        );
      }

      const resp = await this.searchV1Service.getSearchResults(
        parsedParams.data.q,
      );
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
    @Body() unparsedBody: PostSearchRequestBody,
  ): Promise<SearchResultResponse[] | undefined> {
    const startTS = Date.now();
    try {
      const bodySchema = z.object({
        query: z.string().min(1, 'Query parameter is required'),
      });

      const parsedBody = bodySchema.safeParse(unparsedBody);

      if (!parsedBody.success) {
        const errMsg = parsedBody.error.errors
          .map((error) => {
            const path = error.path.join('.');
            return `[${path}] ${error.message}`;
          })
          .join(', ');

        throw ApiError.badRequest(
          'Bad request: Malformed body',
          errMsg,
          undefined,
          'search-v1.controller.postSearch',
          this.logger,
        );
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
    @Query()
    unparsedParams: GetHistoryRequestParams,
  ): Promise<PaginatedQueryHistoryResponse | undefined> {
    const startTS = Date.now();
    try {
      const paramsSchema = z.object({
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

      const parsedQueryParams = paramsSchema.safeParse(unparsedParams);

      if (!parsedQueryParams.success) {
        const errMsg = parsedQueryParams.error.errors
          .map((error) => {
            const path = error.path.join('.');
            return `[${path}] ${error.message}`;
          })
          .join(', ');

        throw ApiError.badRequest(
          'Bad request: Malformed params',
          errMsg,
          undefined,
          'search-v1.controller.getHistory',
          this.logger,
        );
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
