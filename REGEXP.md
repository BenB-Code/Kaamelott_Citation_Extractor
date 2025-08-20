# Documentation des expressions régulières

Documentation technique complète des expressions régulières utilisées dans le projet d'extraction de citations Kaamelott.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Regex principales](#regex-principales)
  - [Citations](#citations)
  - [Personnages](#personnages)
  - [Métadonnées](#métadonnées)
  - [Médias et références](#médias-et-références)
- [Regex de nettoyage](#regex-de-nettoyage)
- [Guide technique](#guide-technique)
- [Exemples d'utilisation](#exemples-dutilisation)

---

## Vue d'ensemble

Ce projet utilise des expressions régulières pour parser le format wiki de Wikiquote et extraire les citations de Kaamelott. Les regex sont organisées en deux fichiers principaux :
- [`citations-extract.constant.ts`](./src/constants/citations-extract.constant.ts) : Extraction des données
- [`cleaning-regexp.constant.ts`](./src/constants/cleaning-regexp.constant.ts) : Nettoyage et normalisation

---

## Regex principales

### Citations

#### `citations_divider` - Séparateur de blocs de citations
```regex
/\{\{\s*[Cc]itation\b[\s\S]*?(?=(\{\{\s*[Cc]itation\b|^===|\[\[\s*Catégorie\s*:\s*Kaamelott|$))/gmi
```

**Décomposition détaillée :**
```
\{\{                    # Accolades ouvrantes littérales
\s*                     # 0+ espaces blancs (espaces, tabs, retours ligne)
[Cc]itation            # "Citation" ou "citation"
\b                     # Frontière de mot (évite "citationnel")
[\s\S]*?               # Tout caractère (incluant \n), lazy matching
(?=                    # Lookahead positif (ne consomme pas)
  (                    # Groupe de conditions OR
    \{\{\s*[Cc]itation\b     # Prochaine citation
    |                        # OU
    ^===                     # Début de section (3 égales en début de ligne)
    |                        # OU
    \[\[\s*Catégorie\s*:\s*Kaamelott  # Catégorie wiki
    |                        # OU
    $                        # Fin du document
  )
)
```

**Flags :**
- `g` : Global - trouve toutes les occurrences
- `m` : Multiline - `^` et `$` matchent les débuts/fins de ligne
- `i` : Case-insensitive

**Exemple de match :**
```wiki
{{citation|citation=Texte de la citation|auteur=Arthur}}
<!-- S'arrête ici -->
{{citation|citation=Autre citation}}
```

#### `description` - Extraction du texte de citation
```regex
/\{\{[cC]itation[\s\S]*?\|[cC]itation\s*=\s*(.*?)(?=\n?\}\}|\r?\n?\}\})/g
```

**Décomposition :**
```
\{\{[cC]itation        # Début du template
[\s\S]*?               # Contenu jusqu'au paramètre (lazy)
\|                     # Pipe littéral
[cC]itation\s*=\s*     # Paramètre "citation" avec espaces optionnels
(.*?)                  # CAPTURE GROUP 1: texte de la citation
(?=                    # Lookahead pour la fin
  \n?\}\}              # Saut de ligne optionnel + accolades fermantes
  |                    # OU
  \r?\n?\}\}           # Retour chariot/saut de ligne + accolades
)
```

### Personnages

#### `global_character_isolation` - Isolation des sections de personnages
```regex
/(===( |)\[\[w:Personnages de Kaamelott#[^\]]+\]\]( |)===[\s\S]*?)(?===)/g
```

**Décomposition complète :**
```
(                      # CAPTURE GROUP 1: Section complète
  ===                  # Marqueur de section niveau 3
  ( |)                 # CAPTURE GROUP 2: Espace optionnel
  \[\[                 # Début du lien wiki
    w:Personnages de Kaamelott#  # Namespace et ancre
    [^\]]+             # Nom du personnage (tout sauf ])
  \]\]                 # Fin du lien wiki
  ( |)                 # CAPTURE GROUP 3: Espace optionnel
  ===                  # Fin du marqueur de section
  [\s\S]*?             # Contenu de la section (lazy)
)
(?===)                 # Lookahead: s'arrête avant la prochaine section
```

**Cas d'usage :** Extrait chaque section de personnage avec son contenu complet.

#### `global_character_name` - Extraction du nom depuis l'en-tête
```regex
/===( |)\[\[w:Personnages de Kaamelott#([\s\S]*?)\|/g
```

**Analyse :**
- **Capture Group 1** : Espace après `===` (ignoré)
- **Capture Group 2** : Nom du personnage extrait de l'ancre
- S'arrête au pipe `|` qui précède le texte affiché du lien

#### `specific_character_name` - Nom depuis le titre de page
```regex
/<title>Kaamelott\/([\s\S]*?)<\/title>/g
```

**Points clés :**
- Capture le nom après "Kaamelott/"
- Utilisé pour les pages dédiées à un personnage

### Métadonnées

#### `author` - Extraction de l'auteur
```regex
/\|[aA]uteur=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```

**Décomposition technique :**
```
\|                     # Pipe de début de paramètre
[aA]uteur=            # Nom du paramètre (case flexible)
\s*                   # Espaces optionnels
(?:\[\[)?             # Lien wiki optionnel (non-capturant)
\s*                   # Espaces dans le lien
(                     # CAPTURE GROUP 1: Nom de l'auteur
  [^\|\]\n\r]+?       # Tout sauf pipe, crochet, retours ligne
)                     # Fin capture (lazy pour trim)
\s*                   # Espaces de fin
(?:\]\])?             # Fermeture lien wiki optionnelle
(?=\s*\|)             # Lookahead: prochain paramètre
```

**Gestion des cas :**
- `|auteur=Alexandre Astier|` → "Alexandre Astier"
- `|auteur=[[Alexandre Astier]]|` → "Alexandre Astier"
- `|Auteur= Alexandre Astier |` → "Alexandre Astier"

#### `actor` - Extraction de l'acteur
```regex
/\|[aA]cteur=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\||\}\})/g
```

**Différence avec `author` :**
- Lookahead accepte `}}` (fin de template)
- Structure identique sinon

#### `episode` - Extraction complexe des épisodes
```regex
/\|\s*(?:[eéE]p(?:isode)?\.?)\s*=\s*(?:(\d+)(?:\/\d+)?\s*[:;\-]?\s*)?(.+?)\s*\}\}/g
```

**Analyse détaillée :**
```
\|\s*                  # Pipe + espaces
(?:                    # Groupe non-capturant pour le nom
  [eéE]p               # "ep", "ép", "Ep"
  (?:isode)?           # "isode" optionnel
  \.?                  # Point optionnel
)
\s*=\s*                # Assignation avec espaces
(?:                    # Groupe optionnel non-capturant
  (\d+)                # CAPTURE GROUP 1: Numéro d'épisode
  (?:\/\d+)?           # Numéro total optionnel (ex: 5/10)
  \s*[:;\-]?\s*        # Séparateur optionnel
)?
(.+?)                  # CAPTURE GROUP 2: Titre de l'épisode
\s*\}\}                # Fin du template
```

**Exemples de matches :**
- `|ep=5: Le Chevalier mystère}}` → G1: "5", G2: "Le Chevalier mystère"
- `|épisode=Le Chevalier mystère}}` → G1: null, G2: "Le Chevalier mystère"
- `|Ep.=12/20 - Finale}}` → G1: "12", G2: "Finale"

#### `title` - Extraction du titre
```regex
/\|[tT]itre=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```

#### `date` - Extraction de la date
```regex
/\|[dD]ate=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\||\}\})/g
```

#### `show` - Série TV
```regex
/\|[sS][eé]rie=\s*(?:\[\[w*:*)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```

**Particularité :** Gère les préfixes wiki `[[w:` ou `[[w*:`

#### `season` - Saison
```regex
/\|[sS]aison=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```

### Médias et références

#### `media` - Type de média
```regex
/\{\{[rR][eé]f\s*([^|]+)\|/g
```

**Points clés :**
- Gère les variantes : `{{ref`, `{{Ref`, `{{réf`, `{{Réf`
- Capture tout jusqu'au premier pipe
- Utilisé pour identifier le type de source (Livre, Série, etc.)

### Filtres et utilitaires

#### `global` - Détection pages Kaamelott
```regex
/<title>Kaamelott<\/title>/g
```

#### `linkToSpecific` - Liens loupe
```regex
/\{\{\s*[Ll]oupe\b/
```

#### `names_divider` - Séparateur de noms
```regex
/\s*(-|et)\s+/
```
**Usage :** Sépare "Arthur et Perceval" ou "Arthur-Perceval"

---

## Regex de nettoyage

### Entités HTML et caractères spéciaux

```regex
# Entités HTML courantes
/&lt;/gi               → "<"
/&gt;/gi               → ">"
/&?(nbsp|amp);/gi      → " "

# Ligatures et apostrophes
/æ/g                   → "ae"
/œ/g                   → "oe"
/'/g                   → "'"

# Espaces multiples
/\s{2,}/gi             → " "

# Guillemets et apostrophes doubles
/(''|\\)/g             → ""
```

### Templates Wiki complexes

#### Formatage de nombres
```regex
/{{formatnum:(\d+)}}/gi
```
Transforme `{{formatnum:1000}}` en `1000`

#### Templates de personnages
```regex
/{{(personnage|" ")\|([^}]+)}}/gi
```
**Capture :**
- Group 1 : Type de template (ignoré)
- Group 2 : Nom du personnage à conserver

**Exemple :** `{{personnage|Arthur}}` → `Arthur`

#### Exposants et ères
```regex
/{{(exp|ère|exp\|ère)}}/gi  → ""
/{{e}}/gi                    → ""
```
Supprime les templates d'exposant : `{{exp}}`, `{{ère}}`, `{{exp|ère}}`, `{{e}}`

### Balises HTML et retours ligne

```regex
# Balises break (toutes variantes)
/<\s*br\s*\/?\s*>/gi   → " "

# Balises poem
/<\/?poem>/gi          → ""

# Tous types de retours ligne
/(\r\n|\r|\n|\\r|\\n)/gi → ""
```

---

## Guide technique

### Types de groupes

| Type | Syntaxe | Usage | Exemple |
|------|---------|-------|---------|
| **Capture** | `()` | Extrait une valeur | `/(nom: )(.+)/` → G2 = valeur |
| **Non-capturant** | `(?:)` | Groupage logique | `(?:Mr\|Mrs\|Ms)\.?` |
| **Lookahead positif** | `(?=)` | Condition sans consommer | `\d+(?=€)` → nombre avant € |
| **Lookahead négatif** | `(?!)` | Exclusion | `\d+(?!€)` → nombre sans € |
| **Lookbehind positif** | `(?<=)` | Condition avant | `(?<=\$)\d+` → nombre après $ |
| **Lookbehind négatif** | `(?<!)` | Exclusion avant | `(?<!\$)\d+` → nombre sans $ avant |

### Quantificateurs

| Quantifieur | Greedy | Lazy | Description |
|-------------|--------|------|-------------|
| `*` | `.*` | `.*?` | 0 ou plus |
| `+` | `.+` | `.+?` | 1 ou plus |
| `?` | N/A | N/A | 0 ou 1 |
| `{n}` | `.{3}` | N/A | Exactement n |
| `{n,}` | `.{3,}` | `.{3,}?` | n ou plus |
| `{n,m}` | `.{2,5}` | `.{2,5}?` | Entre n et m |

### Classes de caractères communes

| Classe | Description | Équivalent |
|--------|-------------|------------|
| `\s` | Espaces blancs | `[ \t\n\r\f]` |
| `\S` | Non-espaces | `[^ \t\n\r\f]` |
| `\d` | Chiffres | `[0-9]` |
| `\D` | Non-chiffres | `[^0-9]` |
| `\w` | Alphanumériques | `[a-zA-Z0-9_]` |
| `\W` | Non-alphanumériques | `[^a-zA-Z0-9_]` |
| `[\s\S]` | Tout caractère (incluant \n) | Alternative à `.` avec flag `s` |
| `\b` | Frontière de mot | Position entre `\w` et `\W` |

### Optimisations

#### 1. Préférer lazy matching pour éviter le backtracking
```regex
# ❌ Greedy (peut capturer trop)
/{{citation.*}}/

# ✅ Lazy (s'arrête au premier match)
/{{citation.*?}}/
```

#### 2. Classes négatives plus performantes
```regex
# ❌ Moins efficace
/{{(.+?)}}/

# ✅ Plus efficace
/{{([^}]+)}}/
```

#### 3. Lookaheads pour conditions complexes
```regex
# Capture jusqu'à un pattern sans le consommer
/citation=(.*?)(?={{|\[\[|$)/
```

#### 4. Éviter les captures inutiles
```regex
# ❌ Capture inutile
/(https?):\/\//

# ✅ Groupe non-capturant
/(?:https?):\/\//
```

#### 5. Ancres pour limiter la recherche
```regex
# ❌ Cherche dans toute la chaîne
/Kaamelott/

# ✅ Seulement au début
/^Kaamelott/
```

---

## Exemples d'utilisation

### Extraction complète d'une citation

**Input Wiki :**
```wiki
{{citation
|citation=C'est pas faux
|auteur=[[Perceval]]
|acteur=Franck Pitiot
|série=Kaamelott
|saison=2
|épisode=3: Les Exploités
}}
```

**Regex appliquées et résultats :**

| Regex | Résultat extrait |
|-------|------------------|
| `citations_divider` | Bloc complet de la citation |
| `description` | "C'est pas faux" |
| `author` | "Perceval" |
| `actor` | "Franck Pitiot" |
| `show` | "Kaamelott" |
| `season` | "2" |
| `episode` | G1: "3", G2: "Les Exploités" |

### Parsing d'une section de personnage

**Input :**
```wiki
=== [[w:Personnages de Kaamelott#Arthur|Arthur Pendragon]] ===
{{citation|citation=Première citation|auteur=Arthur}}
{{citation|citation=Deuxième citation|auteur=Arthur}}
=== [[w:Personnages de Kaamelott#Perceval|Perceval]] ===
```

**Process :**

1. **`global_character_isolation`** 
   - Match 1 : Section Arthur complète (jusqu'avant Perceval)
   - Match 2 : Section Perceval

2. **`global_character_name`**
   - Match 1 : "Arthur"
   - Match 2 : "Perceval"

3. **`citations_divider`** (sur chaque section)
   - Sépare les citations individuelles

### Nettoyage de texte complexe

**Input :**
```wiki
&lt;poem&gt;
C'est {{exp|ère}} pas&nbsp;faux{{formatnum:100}}
''vraiment''<br/>
&lt;/poem&gt;
```

**Étapes de nettoyage :**

1. `/<\/?poem>/gi` → Supprime les balises poem
2. `/{{(exp|ère|exp\|ère)}}/gi` → Supprime "{{exp|ère}}"
3. `/&?(nbsp|amp);/gi` → Remplace "&nbsp;" par " "
4. `/{{formatnum:(\d+)}}/gi` → "{{formatnum:100}}" → "100"
5. `/(''|\\)/g` → Supprime les apostrophes doubles
6. `/<\s*br\s*\/?\s*>/gi` → Remplace "<br/>" par " "
7. `/&lt;/gi` et `/&gt;/gi` → Convertit les entités HTML
8. `/\s{2,}/gi` → Normalise les espaces multiples

**Résultat final :** `"C'est pas faux 100 vraiment"`

### Cas edge complexes

#### Citation avec paramètres multiples et formats variés
```wiki
{{Citation
| auteur = [[w:Alexandre Astier|Alexandre Astier]]
| Acteur = [[  Franck Pitiot  ]]
|citation=Une citation avec
des retours ligne
et des    espaces    multiples
| série = [[w:Kaamelott|Kaamelott]]
|ép. = 12/20: Le Titre
}}
```

**Gestion :**
- Case insensitive pour les paramètres
- Trim automatique des espaces
- Gestion des retours ligne dans la citation
- Extraction correcte malgré les liens wiki
- Parse du format épisode complexe

---

## Notes de maintenance

### Tests recommandés

1. **Tests unitaires** pour chaque regex :
   - Cas nominaux
   - Edge cases (espaces, retours ligne, casse)
   - Chaînes vides
   - Caractères spéciaux

2. **Tests d'intégration** :
   - Pages wiki complètes
   - Sections mal formattées
   - Templates imbriqués

3. **Tests de performance** :
   - Gros volumes (>1000 citations)
   - Textes avec beaucoup de backtracking potentiel
   - Mesure du temps d'exécution

### Évolution et monitoring

- **Surveiller** les changements de format sur Wikiquote
- **Versionner** les regex avec changelog
- **Documenter** les nouveaux cas découverts
- **Logger** les échecs de parsing en production

### Compatibilité

Les regex sont écrites pour JavaScript (ES6+) mais devraient être compatibles avec :
- Node.js (toutes versions récentes)
- Navigateurs modernes
- PCRE avec adaptations mineures

### Pièges courants

1. **Oublier le flag `m`** pour `^` et `$` multiligne
2. **Greedy vs Lazy** : Toujours vérifier le comportement
3. **Échappements** : Double-vérifier `\` dans les strings JS
4. **Lookaheads** : Ne consomment pas = position reste identique
5. **Ordre des alternatives** : `(exp|expression)` match "exp" en premier

---

## Références

- [MDN - Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Regex101 - Testeur en ligne](https://regex101.com/)
- [RegExr - Visualiseur](https://regexr.com/)
- [Wikiquote - Format des citations](https://fr.wikiquote.org/wiki/Aide:Citation)