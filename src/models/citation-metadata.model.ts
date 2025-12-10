import { Episode } from './episode.model';
import { CitationModel } from './citation.model';

export class CitationMetadata {
  private _character_name: string;
  private _author: string[];
  private _actor: string[];
  private _description: string;
  private _media: string;
  private _season: string;
  private _episode: Episode;
  private _title: string;
  private _show: string;
  private _date: string;

  constructor(data: CitationModel) {
    this._character_name = data.character_name;
    this._author = data.author;
    this._actor = data.actor;
    this._description = data.description;
    this._media = data.media;
    this._title = data.title;
    this._date = data.date;
    this._show = data.show;
    this._season = data.season;
    this._episode = data.episode;
  }

  get character_name(): string {
    return this._character_name;
  }

  set character_name(value: string) {
    this._character_name = value;
  }

  get author(): string[] {
    return this._author;
  }

  set author(value: string[]) {
    this._author = value;
  }

  get actor(): string[] {
    return this._actor;
  }

  set actor(value: string[]) {
    this._actor = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get media(): string {
    return this._media;
  }

  set media(value: string) {
    this._media = value;
  }

  get season(): string {
    return this._season;
  }

  set season(value: string) {
    this._season = value;
  }

  get episode(): Episode {
    return this._episode;
  }

  set episode(value: Episode) {
    this._episode = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get show(): string {
    return this._show;
  }

  set show(value: string) {
    this._show = value;
  }

  get date(): string {
    return this._date;
  }

  set date(value: string) {
    this._date = value;
  }
}
