export const CLEANING_REGEXP = [
  {
    regexp: new RegExp(/&lt;/, 'gi'),
    converted: '<',
  },
  {
    regexp: new RegExp(/&gt;/, 'gi'),
    converted: '>',
  },
  {
    regexp: new RegExp(/&?(nbsp|amp);/, 'gi'),
    converted: ' ',
  },
  {
    regexp: new RegExp(/<\s*br\s*\/?\s*>/, 'gi'),
    converted: ' ',
  },
  {
    regexp: new RegExp(/<\/?poem>/, 'gi'),
    converted: '',
  },
  {
    regexp: new RegExp(/{{e}}/, 'gi'),
    converted: '',
  },
  {
    regexp: new RegExp(/{{(exp|ère|exp\|ère)}}/, 'gi'),
    converted: '',
  },
  {
    regexp: new RegExp(/{{(personnage|" ")\|([^}]+)}}/, 'gi'),
    converted: '$1',
  },
  {
    regexp: new RegExp(/{{formatnum:(\d+)}}/, 'gi'),
    converted: '$1',
  },
  {
    regexp: new RegExp(/(\r\n|\r|\n|\\r|\\n)/, 'gi'),
    converted: '',
  },
  {
    regexp: new RegExp(/(''|\\)/, 'g'),
    converted: '',
  },
  {
    regexp: new RegExp(/æ/, 'g'),
    converted: 'ae',
  },
  {
    regexp: new RegExp(/œ/, 'g'),
    converted: 'oe',
  },
  {
    regexp: new RegExp(/’/, 'g'),
    converted: "'",
  },
  {
    regexp: new RegExp(/\s{2,}/, 'gi'),
    converted: ' ',
  },
];
