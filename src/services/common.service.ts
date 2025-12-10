import { CLEANING_REGEXP } from '../constants/cleaning-regexp.constant';
import { logger } from './logger.service';

export class CommonService {
  private loggerContext = 'CommonService';

  cleanText(text: string): string {
    let res = text;
    logger.info(`Cleaning raw text`, this.loggerContext);
    CLEANING_REGEXP.forEach((symbol, i) => {
      res = i < 1 ? text.replace(symbol.regexp, symbol.converted) : res.replace(symbol.regexp, symbol.converted);
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

  capitalizeFirstLetter(text: string): string {
    return String(text).charAt(0).toUpperCase() + String(text?.toLowerCase()).slice(1) || '';
  }
}

export const commonService = new CommonService();
