export const CITATIONS_EXTRACT = {
  global: /<title>Kaamelott<\/title>/g,
  citations_divider:
    /\{\{\s*[Cc]itation\b[\s\S]*?(?=(\{\{\s*[Cc]itation\b|^===|\[\[\s*Catégorie\s*:\s*Kaamelott|$))/gim,
  linkToSpecific: /\{\{\s*[Ll]oupe\b/,
  names_divider: /\s*(-|et)\s+/,

  global_character_isolation: /(===( |)\[\[w:Personnages de Kaamelott#[^\]]+\]\]( |)===[\s\S]*?)(?===)/g,
  global_character_name: /===( |)\[\[w:Personnages de Kaamelott#([\s\S]*?)\|/g,
  specific_character_name: /<title>Kaamelott\/([\s\S]*?)<\/title>/g,

  author: /\|[aA]uteur=\s*(?:\[\[)?\s*([^|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g,
  actor: /\|[aA]cteur=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\||\}\})/g,
  description: /\{\{[cC]itation[\s\S]*?\|[cC]itation\s*=\s*(.*?)(?=\n?\}\}|\r?\n?\}\})/g,

  media: /\{\{[rR][eé]f\s*([^|]+)\|/g,
  title: /\|[tT]itre=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g,
  date: /\|[dD]ate=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\||\}\})/g,

  show: /\|[sS][eé]rie=\s*(?:\[\[w*:*)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g,
  season: /\|[sS]aison=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g,
  episode: /\|\s*(?:[eéE]p(?:isode)?\.?)\s*=\s*(?:(\d+)(?:\/\d+)?\s*[:;\-]?\s*)?(.+?)\s*\}\}/g,
};
