import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import { DuckDuckGoResponse } from 'src/shared/interface/duckduckgo-response';
import { catchAndFormatInternalError } from 'src/shared/utils/api-error';
import { SearchResult } from './search-v1.interface';

@Injectable()
export class SearchV1Service {
  constructor(private readonly httpService: HttpService) {}

  async getSearchResults(query: string): Promise<SearchResult[] | undefined> {
    const API_URL = `http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

    try {
      const SearchResults = await firstValueFrom(
        this.httpService.get(API_URL).pipe(
          map((res) =>
            this.__mapDuckDuckGoResponse(res.data as DuckDuckGoResponse),
          ),
          catchError((err: unknown) => {
            throw catchAndFormatInternalError(err);
          }),
        ),
      );
      return SearchResults;
    } catch (err: unknown) {
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
