import { readFileSync } from 'fs';
import { logger } from './logger.service';

export class FetchingService {
  private loggerContext = 'FetchingService';

  constructor() {}

  async fetch(url: string): Promise<string> {
    logger.info(`Fetching URL: ${url}`, this.loggerContext);
    try {
      const response = await fetch(url);
      return response.text() || '';
    } catch (err: any) {
      logger.error(`Failed to fetch ${url}: ${err.message ?? err}`, this.loggerContext);
      return '';
    }
  }

  localFetch(filePath: string): string | null {
    logger.info(`Reading local file: ${filePath}`, this.loggerContext);
    try {
      const data = readFileSync(filePath, 'utf8');
      return data || '';
    } catch (err: any) {
      logger.error(`Failed to read file ${filePath}: ${err.message ?? err}`, this.loggerContext);
      return null;
    }
  }
}

export const fetchingService = new FetchingService();
