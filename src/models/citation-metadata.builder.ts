import { Episode } from './episode.model';
import { CitationModel } from './citation.model';
import { CitationMetadata } from './citation-metadata.model';

export class CitationBuilder {
  private _character_name = '';
  private _author: string[] = [];
  private _actor: string[] = [];
  private _description = '';
  private _media = '';
  private _season = '';
  private _episode: Episode = {
    name: '',
    number: '',
  };
  private _title = '';
  private _show = '';
  private _date = '';

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
