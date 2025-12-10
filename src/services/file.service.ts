import * as fs from 'fs';
import * as path from 'path';
import { CitationModel } from '../models/citation.model';
import { commonService } from './common.service';
import { logger } from './logger.service';

export class FileService {
  private baseDir = path.join(__dirname, '../');
  private loggerContext = 'FileService';

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Directory created: ${dirPath}`, this.loggerContext);
    }
  }

  private readJson<T>(filePath: string): T | undefined {
    const raw = commonService.safeExecute(
      () => fs.readFileSync(filePath, 'utf-8'),
      `Could not read file: ${filePath}`,
      this.loggerContext
    );
    if (typeof raw !== 'string') return;
    return commonService.safeExecute(
      () => JSON.parse(raw) as T,
      `Invalid JSON in file: ${filePath}`,
      this.loggerContext
    );
  }

  private writeFile(filePath: string, data: any): void {
    commonService.safeExecute(
      () => fs.writeFileSync(filePath, data, 'utf-8'),
      `Could not write to file: ${filePath}`,
      this.loggerContext
    );
    logger.info(`File updated: ${filePath}`, this.loggerContext);
  }

  deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      commonService.safeExecute(() => fs.unlinkSync(filePath), `Unable to delete: ${filePath}`, this.loggerContext);
      logger.info(`File deleted: ${filePath}`, this.loggerContext);
    }
  }

  checkDirValidity(dirToCheck: string): string {
    const dir = path.join(this.baseDir, dirToCheck);
    commonService.safeExecute(
      () => this.ensureDirectory(dir),
      `Invalid or inaccessible path: ${dir}`,
      this.loggerContext
    );
    return dir;
  }

  fileCreation(filePath: string, content: any) {
    this.createFileIfMissing(filePath, () => fs.writeFileSync(filePath, content, { encoding: 'utf8' }));
    logger.info(`Created: ${filePath}`, this.loggerContext);
  }

  private createFileIfMissing(filePath: string, initializer: () => void): void {
    if (!fs.existsSync(filePath)) {
      commonService.safeExecute(initializer, `Could not create file: ${filePath}`, this.loggerContext);
    }
  }

  appendToDataJson(filePath: string, items: CitationModel[], fileName: string): void {
    const existing = this.readJson<CitationModel[]>(filePath) ?? [];
    let added = 0;
    for (const item of items) {
      const isDuplicate = existing.some(e => JSON.stringify(e) === JSON.stringify(item));
      if (isDuplicate) {
        logger.warn(
          `Duplicate skipped: ${JSON.stringify({
            ...item,
            _description: '...',
          })}`,
          this.loggerContext
        );
        continue;
      }
      existing.push(item);
      added++;
      logger.info(`Added ${added} item(s) to ${fileName}.json`, this.loggerContext, true);
    }

    this.writeFile(filePath, JSON.stringify(existing, null, 2));
  }
}

export const fileService = new FileService();
