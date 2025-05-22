import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { promises as fsp } from 'fs';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../utils/custom-logger';
import { SearchResult } from 'src/api/search/search-v1.interface';

export interface QueryHistoryEntry {
  query: string;
  timestamp: string;
  data: SearchResult[];
}

@Injectable()
export class QueryHistoryService {
  private readonly FILE_PATH = path.join(
    process.cwd(),
    'data',
    'query-history.jsonl',
  );

  private readonly logger = new CustomLogger(QueryHistoryService.name);

  constructor() {
    void this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dirName = path.dirname(this.FILE_PATH);
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

  async getHistory(): Promise<QueryHistoryEntry[]> {
    const history: QueryHistoryEntry[] = [];

    try {
      const fileStream = fs.createReadStream(this.FILE_PATH, 'utf-8');
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        if (line) {
          try {
            const entry = JSON.parse(line) as QueryHistoryEntry;
            history.push(entry);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      this.logger.warn(
        `History file not found or error reading. Returning empty history.`,
        undefined,
        QueryHistoryService.name,
      );
      return [];
    }

    return history;
  }

  async addQuery(query: string, data: SearchResult[]): Promise<void> {
    const newEntry: QueryHistoryEntry = {
      query: query,
      timestamp: new Date().toISOString(),
      data: data,
    };
    const line = JSON.stringify(newEntry) + '\n';

    try {
      await fsp.appendFile(this.FILE_PATH, line, 'utf-8');
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
}
