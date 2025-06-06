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
  SearchResultResponse,
  DuckDuckGoResponse,
  PaginatedQueryHistoryResponse,
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
  ): Promise<SearchResultResponse[] | undefined> {
    const API_URL = `http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

    try {
      const SearchResults = await firstValueFrom(
        this.httpService.get(API_URL).pipe(
          map((res) =>
            this.__mapDuckDuckGoResponse(res.data as DuckDuckGoResponse),
          ),
          catchError((err: unknown) => {
            throw catchAndFormatInternalError(
              err,
              'search-v1.service.getSearchResults',
              this.logger,
            );
          }),
        ),
      );
      await this.queryHistoryService.addQuery(query, SearchResults);
      return SearchResults;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }

      throw catchAndFormatInternalError(
        err,
        'search-v1.service.getSearchResults',
        this.logger,
      );
    }
  }

  public async getHistory(
    page: number,
    pageSize: number,
  ): Promise<PaginatedQueryHistoryResponse | undefined> {
    try {
      return await this.queryHistoryService.getHistory(page, pageSize);
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      throw catchAndFormatInternalError(
        err,
        'search-v1.service.getHistory',
        this.logger,
      );
    }
  }

  private __mapDuckDuckGoResponse(
    response: DuckDuckGoResponse,
  ): SearchResultResponse[] {
    return response.RelatedTopics.reduce<SearchResultResponse[]>(
      (acc, topic) => {
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
      },
      [],
    );
  }
}
