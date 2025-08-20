# Documentation des expressions régulières

Ce document référence toutes les regex utilisées dans le projet, organisées par catégorie avec leurs explications.

## 📋 Table des matières

- [Regex principales](#regex-principales)
- [Regex de nettoyage](#regex-de-nettoyage)
- [Conventions et bonnes pratiques](#conventions-et-bonnes-pratiques)

---

## Regex principales

### Global : [citations-extract.constant.ts](./src/constants/citations-extract.constant.ts)

#### `global`
```regex
/<title>Kaamelott<\/title>/g
```
**Objectif** : Trouve les balises title contenant "Kaamelott"
- `<title>` : balise d'ouverture littérale
- `Kaamelott` : texte exact recherché
- `<\/title>` : balise de fermeture (échappement du `/`)
- **Flags** : `g` (global - toutes les occurrences)

#### `linkToSpecific`
```regex
/\{\{\s*[Ll]oupe\b/
```
**Objectif** : Détecte les liens "loupe" dans les templates
- `\{\{` : accolades ouvrantes échappées
- `\s*` : zéro ou plusieurs espaces
- `[Ll]oupe` : "loupe" ou "Loupe"
- `\b` : frontière de mot

### Dividers (Séparateurs)

#### `citations_divider`
```regex
/\{\{\s*[Cc]itation\b[\s\S]*?(?=(\{\{\s*[Cc]itation\b|^===|\[\[\s*Catégorie\s*:\s*Kaamelott|$))/gmi
```
**Objectif** : Sépare les blocs de citations
- `\{\{\s*[Cc]itation\b` : début de template citation
- `[\s\S]*?` : tout caractère (lazy matching)
- **Lookahead positif** `(?=...)` : s'arrête avant :
  - Nouvelle citation : `\{\{\s*[Cc]itation\b`
  - Section : `^===`
  - Catégorie : `\[\[\s*Catégorie\s*:\s*Kaamelott`
  - Fin de chaîne : `$`
- **Flags** : `g` (global), `m` (multiline), `i` (insensible à la casse)

#### `names_divider`
```regex
/\s*(-|et)\s+/
```
**Objectif** : Sépare les noms avec "-" ou "et"
- `\s*` : espaces optionnels avant
- `(-|et)` : tiret OU "et"
- `\s+` : un ou plusieurs espaces après

### Characters (Personnages)

#### `global_character_isolation`
```regex
/(===( |)\[\[w:Personnages de Kaamelott#[^\]]+\]\]( |)===[\s\S]*?)(?===)/g
```
**Objectif** : Isole chaque section de personnage
- `===( |)` : trois égales + espace optionnel
- `\[\[w:Personnages de Kaamelott#[^\]]+\]\]` : lien wiki vers personnage
- `[\s\S]*?` : contenu de la section (lazy)
- **Lookahead** `(?===)` : s'arrête avant la prochaine section
- **Flags** : `g` (global)

#### `global_character_name`
```regex
/===( |)\[\[w:Personnages de Kaamelott#([\s\S]*?)\|/g
```
**Objectif** : Extrait le nom du personnage depuis l'en-tête
- Groupe de capture : `([\s\S]*?)` = nom du personnage
- S'arrête au `|` du lien wiki

#### `specific_character_name`
```regex
/<title>Kaamelott\/([\s\S]*?)<\/title>/g
```
**Objectif** : Extrait le nom depuis le titre de page
- Groupe de capture : `([\s\S]*?)` = nom après "Kaamelott/"

### Metadata (Métadonnées)

#### `author`
```regex
/\|[aA]uteur=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```
**Objectif** : Extrait l'auteur d'une citation
- `\|[aA]uteur=` : paramètre auteur
- `(?:\[\[)?` : lien wiki optionnel (non-capturant)
- **Groupe de capture** : `([^\|\]\n\r]+?)` = nom de l'auteur
- **Lookahead** : s'arrête avant le prochain paramètre

#### `actor`
```regex
/\|[aA]cteur=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\||\}\})/g
```
**Objectif** : Extrait l'acteur
- Structure similaire à `author`
- **Lookahead** : s'arrête avant `|` OU `}}`

#### `description`
```regex
/\{\{[cC]itation[\s\S]*?\|[cC]itation\s*=\s*(.*?)(?=\n?\}\}|\r?\n?\}\})/g
```
**Objectif** : Extrait le texte de la citation
- `\{\{[cC]itation` : début du template
- `\|[cC]itation\s*=\s*` : paramètre citation
- **Groupe de capture** : `(.*?)` = texte de la citation
- **Lookahead** : s'arrête avant la fin du template

### Media & References

#### `media`
```regex
/\{\{[rR][eé]f\s*([^|]+)\|/g
```
**Objectif** : Extrait le type de média depuis les références
- `\{\{[rR][eé]f` : template ref/Ref
- **Groupe de capture** : `([^|]+)` = type de média

#### `title`
```regex
/\|[tT]itre=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```
**Objectif** : Extrait le titre
- Structure similaire aux autres métadonnées

#### `date`
```regex
/\|[dD]ate=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\||\}\})/g
```
**Objectif** : Extrait la date

### TV Show Data

#### `show`
```regex
/\|[sS][eé]rie=\s*(?:\[\[w*:*)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```
**Objectif** : Extrait le nom de la série
- `[sS][eé]rie` : paramètre série
- `(?:\[\[w*:*)?` : lien wiki optionnel avec préfixes

#### `season`
```regex
/\|[sS]aison=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```
**Objectif** : Extrait le numéro de saison

#### `episode`
```regex
/\|\s*(?:[eéE]p(?:isode)?\.?)\s*=\s*(?:(\d+)(?:\/\d+)?\s*[:;\-]?\s*)?(.+?)\s*\}\}/g
```
**Objectif** : Extrait les infos d'épisode
- `(?:[eéE]p(?:isode)?\.?)` : variations de "épisode"
- **Groupe 1** : `(\d+)` = numéro d'épisode (optionnel)
- **Groupe 2** : `(.+?)` = titre de l'épisode

---

## Regex de nettoyage : [cleaning-regexp.constant.ts](./src/constants/cleaning-regexp.constant.ts)

### Entités HTML

```regex
/&lt;/gi → "<"
/&gt;/gi → ">"
/&?(nbsp|amp);/gi → " "
```

### Balises HTML

```regex
/<\s*br\s*\/?\s*>/gi → " "
/<\/?poem>/gi → ""
```

### Templates Wiki

```regex
/{{e}}/gi → ""
/{{(exp|ère|exp\|ère)}}/gi → ""
/{{(personnage|" ")\|([^}]+)}}/gi → "$1"
/{{formatnum:(\d+)}}/gi → "$1"
```

### Caractères spéciaux

```regex
/(\r\n|\r|\n|\\r|\\n)/gi → ""
/(''|\\)/g → ""
/æ/g → "ae"
/œ/g → "oe"
/'/g → "'"
/\s{2,}/gi → " "
```

---

## Conventions et bonnes pratiques

### Flags utilisés
- **`g`** : Global (toutes les occurrences)
- **`i`** : Insensible à la casse
- **`m`** : Multiline (^ et $ matchent les débuts/fins de ligne)

### Groupes de capture
- **`()`** : Groupe de capture (résultat accessible)
- **`(?:)`** : Groupe non-capturant (groupage sans capture)
- **`(?=)`** : Lookahead positif (condition sans consommation)

### Classes de caractères
- **`[^\|\]\n\r]+?`** : Tout sauf pipe, crochet fermant, retours ligne (lazy)
- **`[\s\S]*?`** : Tout caractère y compris espaces/nouvelles lignes (lazy)
- **`[aA]`** : 'a' ou 'A'

### Échappements importants
- **`\{\}`** : Accolades littérales
- **`\[\]`** : Crochets littéraux
- **`\/`** : Slash littéral
- **`\|`** : Pipe littéral

### Performance
- **Lazy quantifiers** (`*?`, `+?`) : Évitent le backtracking excessif
- **Lookaheads** : Permettent de s'arrêter sans consommer
- **Classes de caractères négatives** : Plus efficaces que les alternatives