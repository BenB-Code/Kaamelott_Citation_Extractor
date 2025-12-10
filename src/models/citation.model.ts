import { Episode } from './episode.model';
export interface CitationModel {
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
}

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

  get character_name() {
    return this._character_name;
  }
  get author() {
    return this._author;
  }
  get actor() {
    return this._actor;
  }
  get description() {
    return this._description;
  }
  get media() {
    return this._media;
  }
  get season() {
    return this._season;
  }
  get episode() {
    return this._episode;
  }
  get title() {
    return this._title;
  }
  get show() {
    return this._show;
  }
  get date() {
    return this._date;
  }

  set character_name(value: string) {
    this._character_name = value;
  }
  set author(value: string[]) {
    this._author = value;
  }
  set actor(value: string[]) {
    this._actor = value;
  }
  set description(value: string) {
    this._description = value;
  }
  set media(value: string) {
    this._media = value;
  }
  set season(value: string) {
    this._season = value;
  }
  set episode(value: Episode) {
    this._episode = value;
  }
  set title(value: string) {
    this._title = value;
  }
  set show(value: string) {
    this._show = value;
  }
  set date(value: string) {
    this._date = value;
  }
}

export class CitationBuilder {
  private _character_name: string = '';
  private _author: string[] = [];
  private _actor: string[] = [];
  private _description: string = '';
  private _media: string = '';
  private _season: string = '';
  private _episode: Episode = {
    name: '',
    number: '',
  };
  private _title: string = '';
  private _show: string = '';
  private _date: string = '';

  character_name(value: string): this {
    this._character_name = value;
    return this;
  }

  author(value: string[]): this {
    this._author = value;
    return this;
  }

  actor(value: string[]): this {
    this._actor = value;
    return this;
  }

  description(value: string): this {
    this._description = value;
    return this;
  }

  media(value: string): this {
    this._media = value;
    return this;
  }

  season(value: string): this {
    this._season = value;
    return this;
  }

  episode(value: Episode): this {
    this._episode = value;
    return this;
  }

  title(value: string): this {
    this._title = value;
    return this;
  }

  show(value: string): this {
    this._show = value;
    return this;
  }

  date(value: string): this {
    this._date = value;
    return this;
  }

  build(): CitationMetadata {
    const citation: CitationModel = {
      character_name: this._character_name,
      author: this._author,
      actor: this._actor,
      description: this._description,
      media: this._media,
      title: this._title,
      date: this._date,
      show: this._show,
      season: this._season,
      episode: this._episode,
    };

    return new CitationMetadata(citation);
  }
}
