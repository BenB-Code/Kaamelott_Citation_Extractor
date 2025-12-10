import { CITATIONS_EXTRACT } from '../constants/citations-extract.constant';
import { EPISODES_NAMES } from '../constants/episodes-names.constant';
import { MEDIA_TYPE } from '../constants/media.enum';
import { commonService } from './common.service';
import { CitationMetadata } from '../models/citation-metadata.model';
import { CitationModel } from '../models/citation.model';
import { CitationBuilder } from '../models/citation-metadata.builder';
import { MOVIES_NAMES } from '../constants/movies-names.constant';

export class ParserService {
  isolateCharactersFromGlobal(list: RegExpExecArray[]): string[] {
    return [...list[0].input.matchAll(CITATIONS_EXTRACT.global_character_isolation)].map(e => e[0]);
  }

  extractCharacterName(rawData: string, isGlobalFile: boolean): string {
    return isGlobalFile
      ? [...rawData.matchAll(CITATIONS_EXTRACT.global_character_name)].map(e => e[2])[0] || ''
      : [...rawData.matchAll(CITATIONS_EXTRACT.specific_character_name)].map(e => e[1])[0] || '';
  }

  extractEpisodeContent(
    rawData: string,
    regexp: RegExp
  ): {
    name: string;
    number: number | string;
  } {
    let episodeName = '';
    const result = [...rawData.matchAll(regexp)][0] || '';

    let cleanedResult = '';
    if (result[1]) {
      cleanedResult = result[1][0] === '0' ? result[1].substring(1) : result[1];
    }

    const key = commonService.capitalizeFirstLetter(result[2]);

    if (key in EPISODES_NAMES) {
      episodeName = EPISODES_NAMES[key as keyof typeof EPISODES_NAMES];
    }
    return {
      name: episodeName || '',
      number: cleanedResult,
    };
  }

  extractMultipleNames(rawData: string, regexp: RegExp): string[] {
    const result = this.extractContent(rawData, regexp);
    const cleanedResult: string[] = result
      .split(CITATIONS_EXTRACT.names_divider)
      .filter(item => item !== '-' && item !== 'et');
    return cleanedResult;
  }

  extractMovieTitleContent(rawData: string, regexp: RegExp): string {
    let movieName = [...rawData.matchAll(regexp)].map(e => e[1])[0] || '';
    if (movieName in MOVIES_NAMES) {
      movieName = MOVIES_NAMES[movieName as keyof typeof MOVIES_NAMES];
    }
    return movieName;
  }

  extractContent(rawData: string, regexp: RegExp): string {
    return [...rawData.matchAll(regexp)].map(e => e[1])[0] || '';
  }

  completeCitationData(rawData: string, citation: CitationMetadata): CitationMetadata {
    citation.actor = this.extractMultipleNames(rawData, CITATIONS_EXTRACT.actor);
    citation.author = this.extractMultipleNames(rawData, CITATIONS_EXTRACT.author);
    citation.description = this.extractContent(rawData, CITATIONS_EXTRACT.description);
    citation.media = this.extractContent(commonService.capitalizeFirstLetter(rawData), CITATIONS_EXTRACT.media);

    if (citation.media === MEDIA_TYPE.movie) {
      citation.title = this.extractMovieTitleContent(
        commonService.capitalizeFirstLetter(rawData),
        CITATIONS_EXTRACT.title
      );
      if (citation.title === MOVIES_NAMES['w:dies irae (court métrage)']) {
        citation.media = MEDIA_TYPE.court_metrage;
      }
      citation.date = this.extractContent(rawData, CITATIONS_EXTRACT.date);
    } else {
      citation.season = this.extractContent(rawData, CITATIONS_EXTRACT.season);
      citation.show = this.extractContent(commonService.capitalizeFirstLetter(rawData), CITATIONS_EXTRACT.show);
      citation.episode = this.extractEpisodeContent(rawData, CITATIONS_EXTRACT.episode);
    }

    return citation;
  }

  extractInfosFromRawData(rawData: string, isGlobalFile = false): CitationModel[] {
    const completedCitationsList: CitationModel[] = [];
    const isALinkToSpecific = CITATIONS_EXTRACT.linkToSpecific.test(rawData);
    if (!isALinkToSpecific) {
      const list = [...rawData.matchAll(CITATIONS_EXTRACT.citations_divider)].map(e => e[0]);

      const characterName = this.extractCharacterName(rawData, isGlobalFile);
      list.forEach(el => {
        let citation = new CitationBuilder().build();
        citation.character_name = characterName;
        citation = this.completeCitationData(el, citation);
        completedCitationsList.push(citation);
      });
    }
    return completedCitationsList;
  }
}

export const parserService = new ParserService();
