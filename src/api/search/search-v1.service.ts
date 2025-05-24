import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import { QueryHistoryService } from 'src/shared/service/query-history.service';
import {
  ApiError,
  catchAndFormatInternalError,
} from 'src/shared/utils/api-error';
import { CustomLogger } from 'src/shared/utils/custom-logger';
import {
  SearchResult,
  DuckDuckGoResponse,
  PaginatedQueryHistory,
} from '@repo/interfaces';

@Injectable()
export class SearchV1Service {
  private readonly logger = new CustomLogger(SearchV1Service.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly queryHistoryService: QueryHistoryService,
  ) {}

  public async getSearchResults(
    query: string,
  ): Promise<SearchResult[] | undefined> {
    const API_URL = `http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

    try {
      const SearchResults = await firstValueFrom(
        this.httpService.get(API_URL).pipe(
          map((res) =>
            this.__mapDuckDuckGoResponse(res.data as DuckDuckGoResponse),
          ),
          catchError((err: unknown) => {
            this.logger.error(
              'Internal Error: Problem getting data from external service',
              'search-v1.service.getSearchResults',
            );
            throw catchAndFormatInternalError(err);
          }),
        ),
      );
      await this.queryHistoryService.addQuery(query, SearchResults);
      return SearchResults;
    } catch (err: unknown) {
      let errMsg = 'unknown error';
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (err instanceof ApiError) {
        errMsg = err.responseMessage;
      }

      this.logger.error(
        `Internal Error: Problem getting data from external service: ${errMsg}`,
        'search-v1.service.getSearchResults',
      );

      if (err instanceof ApiError) {
        throw err;
      }

      catchAndFormatInternalError(err);
    }
  }

  public async getHistory(
    page: number,
    pageSize: number,
  ): Promise<PaginatedQueryHistory | undefined> {
    try {
      return await this.queryHistoryService.getHistory(page, pageSize);
    } catch (err) {
      let errMsg = 'unknown error';
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (err instanceof ApiError) {
        errMsg = err.responseMessage;
      }

      this.logger.error(
        `Internal Error: Problem getting data from external service: ${errMsg}`,
        'search-v1.service.getHistory',
      );

      if (err instanceof ApiError) {
        throw err;
      }

      catchAndFormatInternalError(err);
    }
  }

  private __mapDuckDuckGoResponse(
    response: DuckDuckGoResponse,
  ): SearchResult[] {
    return response.RelatedTopics.reduce<SearchResult[]>((acc, topic) => {
      if (
        typeof topic.Text === 'string' &&
        topic.Text.length > 0 &&
        typeof topic.FirstURL === 'string' &&
        topic.FirstURL.length > 0
      ) {
        acc.push({
          title: topic.Text,
          url: topic.FirstURL,
        });
      }
      return acc;
    }, []);
  }
}
