import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { promises as fsp } from 'fs';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../utils/custom-logger';
import {
  PaginatedQueryHistoryResponse,
  QueryHistoryEntry,
  SearchResultResponse,
} from '@repo/interfaces';

@Injectable()
export class QueryHistoryService {
  private readonly QUERY_HISTORY_FILE_PATH = path.join(
    process.cwd(),
    'data',
    'query-history.jsonl',
  );

  private readonly logger = new CustomLogger(QueryHistoryService.name);
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly DEFAULT_PAGE = 1;

  constructor() {
    void this.__ensureDirectoryExists();
  }

  async getHistory(
    page: number = this.DEFAULT_PAGE,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedQueryHistoryResponse> {
    page = Math.max(1, page);
    pageSize = Math.max(1, pageSize);

    try {
      const allEntries = await this.__readAllHistoryEntries();

      const totalCount = allEntries.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      if (page > totalPages && totalPages > 0) {
        page = totalPages;
      }

      const skip = (page - 1) * pageSize;

      allEntries.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      const paginatedEntries = allEntries.slice(skip, skip + pageSize);

      return {
        entries: paginatedEntries,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      let errMsg = 'unknown error';
      if (error instanceof Error) {
        errMsg = error.message;
      }
      this.logger.error(
        `Error retrieving paginated history: ${errMsg}`,
        undefined,
        QueryHistoryService.name,
      );
      return {
        entries: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize,
      };
    }
  }

  private async __getTotalHistoryCount(): Promise<number> {
    try {
      const entries = await this.__readAllHistoryEntries();
      return entries.length;
    } catch (error) {
      let errMsg = 'unknown error';
      if (error instanceof Error) {
        errMsg = error.message;
      }
      this.logger.error(
        `Error counting history entries: ${errMsg}`,
        undefined,
        QueryHistoryService.name,
      );
      return 0;
    }
  }

  async getTotalPages(
    pageSize: number = this.DEFAULT_PAGE_SIZE,
  ): Promise<number> {
    pageSize = Math.max(1, pageSize);
    const totalCount = await this.__getTotalHistoryCount();
    return Math.ceil(totalCount / pageSize);
  }

  async addQuery(query: string, data: SearchResultResponse[]): Promise<void> {
    const newEntry: QueryHistoryEntry = {
      query: query,
      timestamp: new Date().toISOString(),
      data: data,
    };
    const line = JSON.stringify(newEntry) + '\n';

    try {
      await fsp.appendFile(this.QUERY_HISTORY_FILE_PATH, line, 'utf-8');
      this.logger.log(
        `Query "${query}" added to history with ${data.length} results.`,
        QueryHistoryService.name,
      );
    } catch (err) {
      let errMsg = 'unknown error';
      if (err instanceof Error) {
        errMsg = err.message;
      }

      this.logger.error(
        `Error appending query "${query}" to history file: ${errMsg}`,
        undefined,
        QueryHistoryService.name,
      );
      throw new Error(`Failed to add query to history: ${query}`);
    }
  }

  private async __readAllHistoryEntries(): Promise<QueryHistoryEntry[]> {
    const entries: QueryHistoryEntry[] = [];

    try {
      try {
        await fsp.access(this.QUERY_HISTORY_FILE_PATH, fs.constants.F_OK);
      } catch {
        return [];
      }

      const fileStream = fs.createReadStream(
        this.QUERY_HISTORY_FILE_PATH,
        'utf-8',
      );
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        if (line) {
          try {
            const entry = JSON.parse(line) as QueryHistoryEntry;
            entries.push(entry);
          } catch (err) {
            let errMsg = 'unknown error';
            if (err instanceof Error) {
              errMsg = err.message;
            }
            this.logger.error(
              `Error parsing history line: ${line} - ${errMsg}`,
              undefined,
              QueryHistoryService.name,
            );
          }
        }
      }

      return entries;
    } catch (error) {
      let errMsg = 'unknown error';
      if (error instanceof Error) {
        errMsg = error.message;
      }
      this.logger.error(
        `Error reading history entries: ${errMsg}`,
        undefined,
        QueryHistoryService.name,
      );
      return [];
    }
  }

  private async __ensureDirectoryExists(): Promise<void> {
    const dirName = path.dirname(this.QUERY_HISTORY_FILE_PATH);
    try {
      await fsp.mkdir(dirName, { recursive: true });
      this.logger.log(`Directory ${dirName} created.`);
    } catch (error) {
      let errMsg = 'unknown error';
      if (error instanceof Error) {
        errMsg = error.message;
      }
      this.logger.error(
        `Error creating directory ${dirName}: ${errMsg}`,
        undefined,
        QueryHistoryService.name,
      );
    }
  }
}
