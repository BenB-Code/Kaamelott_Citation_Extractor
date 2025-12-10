import { CLEANING_REGEXP } from '../constants/cleaning-regexp.constant';
import { logger } from './logger.service';

export class CommonService {
  private loggerContext = 'CommonService';
  constructor() {}
  cleanText(text: string): string {
    let res = text;
    logger.info(`Cleaning raw text`, this.loggerContext);
    CLEANING_REGEXP.forEach((symbol, i) => {
      i < 1
        ? (res = text.replace(symbol.regexp, symbol.converted))
        : (res = res.replace(symbol.regexp, symbol.converted));
    });
    return res.trim();
  }

  safeExecute<T>(fn: () => T, errorMsg: string, context: string = this.loggerContext, fallback?: T): T {
    try {
      return fn();
    } catch (err) {
      logger.error(errorMsg, context);
      return fallback as T;
    }
  }

  capitalizeFirstLetter(text: string) {
    return String(text).charAt(0).toUpperCase() + String(text?.toLowerCase()).slice(1) || '';
  }
}

export const commonService = new CommonService();
