import * as fs from 'fs';
import * as path from 'path';
import { CITATIONS, GLOBAL, PARSED_EXTRACT, VARIATIONS } from '../constants/filenames.constant';
import { FILE_EXTENSION } from '../constants/file-extension.enum';
import { logger } from '../services/logger.service';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type FlatObject = { [key: string]: JsonValue };

const loggerContext = 'CitationVariationExtractor';

function flatten(obj: JsonObject, prefix = ''): FlatObject {
  return Object.entries(obj).reduce<FlatObject>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(acc, flatten(v as JsonObject, key));
    } else {
      acc[key] = v;
    }
    return acc;
  }, {});
}

function fieldToEnumName(field: string): string {
  return field.replace(/\./g, '_').toUpperCase();
}

function valueToEnumMember(value: string): string {
  let result =
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toUpperCase() || 'EMPTY';

  if (/^\d/.test(result)) {
    result = '_' + result;
  }

  return result;
}

const citationsPath = path.join(process.cwd(), 'dist', PARSED_EXTRACT, GLOBAL, `${CITATIONS}${FILE_EXTENSION.JSON}`);

if (!fs.existsSync(citationsPath)) {
  logger.error('❌ Erreur : citations.json introuvable', loggerContext);
  logger.error(`Veuillez d'abord lancer un build prod/local pour générer le fichier.`, loggerContext);
  logger.error(`Chemins vérifiés :`, loggerContext);
  logger.error(`- ${citationsPath}`, loggerContext);
  process.exit(1);
}

const raw = fs.readFileSync(citationsPath, 'utf-8');
const data: JsonObject[] = JSON.parse(raw);

const flatData = data.map(item => flatten(item));
const allFields = Array.from(new Set(flatData.flatMap(item => Object.keys(item))));

const valuesByField: Record<string, Set<string>> = {};
allFields.forEach(f => (valuesByField[f] = new Set<string>()));

function cleanValue(item: string | number | boolean | null | JsonObject | JsonArray): string {
  return String(item)
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

flatData.forEach(item => {
  allFields.forEach(f => {
    if (Array.isArray(item[f]) && item[f].length > 1) {
      item[f].forEach(subItem => {
        if (subItem !== null) {
          const v = cleanValue(subItem);
          if (v) {
            valuesByField[f].add(v);
          }
        }
      });
    } else {
      if (item[f] !== null) {
        const v = cleanValue(item[f]);
        if (v) {
          valuesByField[f].add(v);
        }
      }
    }
  });
});

const sortedValuesByField: Record<string, string[]> = {};
allFields.forEach(f => {
  sortedValuesByField[f] = Array.from(valuesByField[f]).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'variant' })
  );
});

let enumsContent = '// Auto-generated file - Do not edit manually\n\n';

const enumValueMaps: Record<string, Record<string, string>> = {};

allFields.forEach(field => {
  const enumName = fieldToEnumName(field);
  enumValueMaps[field] = {};

  enumsContent += `export enum ${enumName} {\n`;

  sortedValuesByField[field].forEach(value => {
    const enumMember = valueToEnumMember(value);

    let finalEnumMember = enumMember;
    let counter = 1;
    while (Object.values(enumValueMaps[field]).includes(finalEnumMember)) {
      finalEnumMember = `${enumMember}_${counter}`;
      counter++;
    }

    enumValueMaps[field][value] = finalEnumMember;
    enumsContent += `  ${finalEnumMember} = '${value.replace(/'/g, "\\'")}',\n`;
  });

  enumsContent += '}\n\n';
});

const outPath = path.join(process.cwd(), 'dist', PARSED_EXTRACT, VARIATIONS);
const outFilePath = path.join(outPath, `${CITATIONS}.${VARIATIONS}.enum.ts`);

if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath, { recursive: true });
}
fs.writeFileSync(outFilePath, enumsContent, 'utf-8');
logger.info(`✅ citations.variations.enum.ts généré : ${outFilePath}`, loggerContext);
