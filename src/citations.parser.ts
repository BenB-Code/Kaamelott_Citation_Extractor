import path from 'path';
import { LOCAL_MODE } from '.';
import { CITATIONS_EXTRACT } from './constants/citations-extract.constant';
import { FILE_EXTENSION } from './constants/file-extension.enum';
import { CITATIONS, FETCHED_EXTRACT, GLOBAL, PARSED_EXTRACT } from './constants/filenames.constant';
import { CITATIONS_XML_URLS } from './constants/xml-urls.constant';
import { CitationModel } from './models/citation.model';
import { CitationUrlXmlInterface } from './models/citations-url-xml.model';
import { commonService } from './services/common.service';
import { fetchingService } from './services/fetching.service';
import { fileService } from './services/file.service';
import { logger } from './services/logger.service';
import { parserService } from './services/parser.service';

export class CitationsParser {
  private loggerContext = 'CitationsParser';

  async extractCitations(): Promise<void> {
    logger.info('Start extracting citations', this.loggerContext);
    CITATIONS_XML_URLS.forEach(async url => {
      logger.info(`Processing file: ${url.fileName}`, this.loggerContext);

      if (!LOCAL_MODE) {
        await this.fetchedFilesCreation(url);
      }

      let data = fetchingService.localFetch(url.filePath);
      if (data) {
        data = commonService.cleanText(data);

        const citationsList: CitationModel[] = [];
        const globalCitations = [...data.matchAll(CITATIONS_EXTRACT.global)];

        if (globalCitations.length > 0) {
          const globalCharactersList = parserService.isolateCharactersFromGlobal(globalCitations);

          globalCharactersList.forEach(e => {
            const results = parserService.extractInfosFromRawData(e, true);
            citationsList.push(...results);
          });
        } else {
          const results = parserService.extractInfosFromRawData(data);
          citationsList.push(...results);
        }

        this.generateParsedFile(CITATIONS, citationsList, GLOBAL);
        this.generateParsedFile(url.fileName, citationsList, CITATIONS);
      } else {
        logger.warn(
          'Citations parsing ended on an unsuspected event. File is unreachable. Look at the logs.\n',
          this.loggerContext
        );
      }
    });
    logger.info('Citations parsing finished\n', this.loggerContext);
  }

  private generateParsedFile(fileName: string, data: CitationModel[], dirName: string): void {
    const dirPath = fileService.checkDirValidity(path.join(PARSED_EXTRACT, dirName));
    const filePath = path.join(dirPath, `${fileName}${FILE_EXTENSION.JSON}`);

    fileService.fileCreation(filePath, JSON.stringify([], null, 2));
    fileService.appendToDataJson(filePath, data, fileName);
    logger.info(`Citations of ${fileName} extracted`, this.loggerContext);
  }

  private async fetchedFilesCreation(url: CitationUrlXmlInterface): Promise<void> {
    const dirPath = fileService.checkDirValidity(path.join(FETCHED_EXTRACT, CITATIONS));
    const filePath = path.join(dirPath, `${url.fileName}${FILE_EXTENSION.XML}`);
    fileService.deleteFile(filePath);
    const data = await fetchingService.fetch(url.url);
    fileService.fileCreation(filePath, data);
  }
}

export const citationsParser = new CitationsParser();
