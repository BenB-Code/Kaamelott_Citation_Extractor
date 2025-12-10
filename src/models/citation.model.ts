import { Episode } from './episode.model';

export type CitationModel = {
  character_name: string;
  author: string[];
  actor: string[];
  description: string;
  media: string;
  title: string;
  date: string;
  show: string;
  season: string;
  episode: Episode;
};
