# Documentation des Expressions Régulières

Documentation technique complète des expressions régulières utilisées dans le projet d'extraction de citations Kaamelott.

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Quickstart](#-quickstart-pour-débutants)
- [Regex principales](#-regex-principales)
  - [Citations](#citations)
  - [Personnages](#personnages)
  - [Métadonnées](#métadonnées)
  - [Médias et références](#médias-et-références)
- [Regex de nettoyage](#-regex-de-nettoyage)
- [Guide technique](#-guide-technique)
- [Exemples pratiques](#-exemples-pratiques)
- [Références](#-références)

---

## 🎯 Vue d'ensemble

### Objectif

Transformer le **format Wikiquote** (XML avec syntaxe MediaWiki) en **données JSON structurées**.

### Organisation

Les regex sont organisées en **deux catégories** distinctes :

| Fichier | Rôle | Nombre | Complexité |
|---------|------|--------|-----------|
| [`citations-extract.constant.ts`](./src/constants/citations-extract.constant.ts) | **Extraction** des données structurées | 12 regex | ⭐⭐⭐ |
| [`cleaning-regexp.constant.ts`](./src/constants/cleaning-regexp.constant.ts) | **Nettoyage** et normalisation du texte | 16 regex | ⭐⭐ |

### Workflow de traitement

```
XML Wikiquote
    ↓
┌───────────────────┐
│ NETTOYAGE (16)    │  Normalise le format
└───────────────────┘
    ↓
┌───────────────────┐
│ EXTRACTION (12)   │  Extrait les métadonnées
└───────────────────┘
    ↓
JSON structuré
```

---

## 🚀 Quickstart pour débutants

### Exemple simple : Extraire un auteur

**Input Wikiquote** :
```wiki
|auteur=[[Alexandre Astier]]|
```

**Regex utilisée** :
```regex
/\|[aA]uteur=\s*(?:\[\[)?\s*([^\|\]\n\r]+?)\s*(?:\]\])?(?=\s*\|)/g
```

**Résultat extrait** :
```
"Alexandre Astier"
```

### Comment la lire ?

```
\|              # Pipe littéral (début du paramètre)
[aA]uteur=      # "auteur" ou "Auteur" + égale
\s*             # Espaces optionnels
(?:\[\[)?       # Lien wiki "[[" optionnel (non capturé)
\s*             # Espaces
(               # DÉBUT CAPTURE (ce qu'on veut)
  [^\|\]\n\r]+? # Tout sauf |, ], retours ligne
)               # FIN CAPTURE
\s*             # Espaces
(?:\]\])?       # Fermeture lien "]]" optionnelle
(?=\s*\|)       # Lookahead : doit être suivi d'un pipe
```

### Concepts clés

| Syntaxe | Nom | Rôle |
|---------|-----|------|
| `(...)` | **Capture group** | Ce qui est extrait et retourné |
| `(?:...)` | **Non-capturing** | Groupe logique mais pas capturé |
| `(?=...)` | **Lookahead** | Condition sans consommer les caractères |
| `\s*` | **Quantifieur** | 0 ou plus espaces |
| `[^\|]` | **Classe négative** | Tout sauf le pipe |

---

## 📖 Regex principales

### Citations

#### `citations_divider` - Séparateur de blocs de citations

**Objectif** : Découper le texte en blocs individuels de citations.

**Complexité** : ⭐⭐⭐ (Utilise lookahead et alternatives)

```regex
/\{\{\s*[Cc]itation\b[\s\S]*?(?=(\{\{\s*[Cc]itation\b|^===|\[\[\s*Catégorie\s*:\s*Kaamelott|$))/gmi
```

**Décomposition étape par étape** :

```
┌─────────────────────────────────────────────────────────────┐
│ PARTIE 1 : Début du match                                  │
└─────────────────────────────────────────────────────────────┘
\{\{                    # Accolades ouvrantes {{ (échappées)
\s*                     # 0+ espaces/tabs/retours ligne
[Cc]itation             # "Citation" ou "citation"
\b                      # Frontière de mot (évite "citationnel")

┌─────────────────────────────────────────────────────────────┐
│ PARTIE 2 : Contenu capturé                                 │
└─────────────────────────────────────────────────────────────┘
[\s\S]*?                # Tout caractère (incluant \n)
                        # *? = lazy (s'arrête au plus tôt)

┌─────────────────────────────────────────────────────────────┐
│ PARTIE 3 : Conditions d'arrêt (lookahead)                  │
└─────────────────────────────────────────────────────────────┘
(?=                     # Lookahead (ne consomme pas)
  (                     # Groupe d'alternatives
    \{\{\s*[Cc]itation\b      # Prochaine citation
    |                         # OU
    ^===                      # Section wiki (début de ligne)
    |                         # OU
    \[\[\s*Catégorie\s*:\s*Kaamelott  # Catégorie
    |                         # OU
    $                         # Fin du document
  )
)
```

**Flags importants** :

| Flag | Nom | Effet |
|------|-----|-------|
| `g` | Global | Trouve **toutes** les occurrences |
| `m` | Multiline | `^` et `$` matchent débuts/fins de **ligne** |
| `i` | Case-insensitive | Ignore la casse |

**Exemple visuel** :

```wiki
{{citation|citation=Première citation|auteur=Arthur}}
         ↑                                          ↑
      Début                                    Fin (avant {{)

{{citation|citation=Deuxième citation|auteur=Perceval}}
         ↑                                            ↑
      Début                                      Fin (avant ===)

=== Section suivante ===
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

## 💡 Exemples pratiques

### Cas d'usage 1 : Extraction complète d'une citation

**Scénario** : Parser une citation complète depuis Wikiquote.

**Input Wikiquote** :
```wiki
{{citation
|citation=C'est pas faux
|auteur=[[Perceval]]
|acteur=Franck Pitiot
|série=Kaamelott
|saison=Livre II
|épisode=3: Les Exploités
}}
```

**Process d'extraction** :

| Étape | Regex | Input | Output |
|-------|-------|-------|--------|
| 1️⃣ | `citations_divider` | Texte complet | Bloc isolé de la citation |
| 2️⃣ | `description` | `\|citation=C'est pas faux` | `"C'est pas faux"` |
| 3️⃣ | `author` | `\|auteur=[[Perceval]]` | `"Perceval"` |
| 4️⃣ | `actor` | `\|acteur=Franck Pitiot` | `"Franck Pitiot"` |
| 5️⃣ | `show` | `\|série=Kaamelott` | `"Kaamelott"` |
| 6️⃣ | `season` | `\|saison=Livre II` | `"Livre II"` |
| 7️⃣ | `episode` | `\|épisode=3: Les Exploités` | G1: `"3"`, G2: `"Les Exploités"` |

**JSON final** :
```json
{
  "character_name": "Perceval",
  "description": "C'est pas faux",
  "author": ["Perceval"],
  "actor": ["Franck Pitiot"],
  "show": "Kaamelott",
  "season": "Livre II",
  "episode": {
    "number": "3",
    "name": "Les Exploités"
  }
}
```

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

### Cas d'usage 3 : Nettoyage de texte complexe

**Scénario** : Nettoyer un texte avec entités HTML, templates Wiki et formatage.

**Input brut Wikiquote** :
```wiki
&lt;poem&gt;
C'est {{exp|ère}} pas&nbsp;faux{{formatnum:100}}
''vraiment''<br/>
&lt;/poem&gt;
```

**Pipeline de nettoyage (ordre important)** :

| Étape | Regex | Action | Résultat intermédiaire |
|-------|-------|--------|----------------------|
| 0️⃣ | — | État initial | `&lt;poem&gt;C'est {{exp\|ère}} pas&nbsp;faux{{formatnum:100}}''vraiment''<br/>&lt;/poem&gt;` |
| 1️⃣ | `/<\/?poem>/gi` | Supprime `<poem>` et `</poem>` | `&lt;&gt;C'est {{exp\|ère}} pas&nbsp;faux{{formatnum:100}}''vraiment''<br/>&lt;&gt;` |
| 2️⃣ | `/&lt;/gi` → `<` | Convertit entités HTML | `<>C'est {{exp\|ère}} pas&nbsp;faux{{formatnum:100}}''vraiment''<br/><>` |
| 3️⃣ | `/&gt;/gi` → `>` | Convertit entités HTML | `<>C'est {{exp\|ère}} pas faux{{formatnum:100}}''vraiment''<br/><>` |
| 4️⃣ | `/&?(nbsp\|amp);/gi` → ` ` | Remplace `&nbsp;` par espace | `<>C'est {{exp\|ère}} pas faux{{formatnum:100}}''vraiment''<br/><>` |
| 5️⃣ | `/{{(exp\|ère\|exp\\|ère)}}/gi` → ` ` | Supprime `{{exp\|ère}}` | `<>C'est  pas faux{{formatnum:100}}''vraiment''<br/><>` |
| 6️⃣ | `/{{formatnum:(\d+)}}/gi` → `$1` | `{{formatnum:100}}` → `100` | `<>C'est  pas faux 100''vraiment''<br/><>` |
| 7️⃣ | `/(''\\)/g` → ` ` | Supprime `''` | `<>C'est  pas faux 100 vraiment <br/><>` |
| 8️⃣ | `/<\s*br\s*\/?\s*>/gi` → ` ` | `<br/>` → espace | `<>C'est  pas faux 100 vraiment  <>` |
| 9️⃣ | `/\s{2,}/gi` → ` ` | Normalise espaces multiples | `<>C'est pas faux 100 vraiment <>` |
| 🔟 | Trim + clean | Supprime `<>` vides | `C'est pas faux 100 vraiment` |

**Résultat final** :
```
"C'est pas faux 100 vraiment"
```

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

## 🔧 Notes de maintenance

### ✅ Tests recommandés

Pour garantir la fiabilité des regex :

| Type de test | Cas à couvrir | Outils |
|--------------|---------------|--------|
| **Unitaires** | - Cas nominaux<br>- Edge cases (espaces, casse)<br>- Chaînes vides<br>- Caractères spéciaux | Jest |
| **Intégration** | - Pages wiki complètes<br>- Sections mal formattées<br>- Templates imbriqués | Tests E2E |
| **Performance** | - Volumes > 1000 citations<br>- Backtracking potentiel<br>- Mesure temps d'exécution | Benchmark |

### 📊 Monitoring en production

- ✅ Surveiller les **changements de format** sur Wikiquote
- ✅ **Versionner** les regex avec changelog
- ✅ **Logger** les échecs de parsing (voir `logger.service.ts`)
- ✅ **Documenter** les nouveaux edge cases découverts

### 🔄 Compatibilité

Les regex de ce projet sont écrites pour **JavaScript (ES2020+)** :

| Environnement | Compatibilité | Notes |
|---------------|---------------|-------|
| Node.js v16+ | ✅ Complète | Environnement principal |
| Node.js v22 | ✅ Complète | Utilisé en CI/CD |
| Navigateurs modernes | ✅ Complète | Chrome, Firefox, Safari |
| PCRE (PHP, etc.) | ⚠️ Adaptations mineures | Syntaxe légèrement différente |

### ⚠️ Pièges courants à éviter

| Piège | Problème | Solution |
|-------|----------|----------|
| **Flag `m` oublié** | `^` et `$` ne matchent pas les lignes | Toujours ajouter `m` pour multiligne |
| **Greedy vs Lazy** | `.*` capture trop | Utiliser `.*?` (lazy) |
| **Échappements JS** | `\` dans strings | Utiliser `\\` ou regex literals `/.../ ` |
| **Lookaheads** | Ne consomment pas les caractères | Position reste identique après match |
| **Ordre alternatives** | `(exp\|expression)` match "exp" d'abord | Ordre du plus spécifique au plus général |

### 🛠️ Outils de développement

Pour tester et débugger les regex :

| Outil | URL | Usage |
|-------|-----|-------|
| **Regex101** | [regex101.com](https://regex101.com/) | Test interactif + explications |
| **RegExr** | [regexr.com](https://regexr.com/) | Visualiseur avec highlighting |
| **MDN Docs** | [MDN Regex Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | Documentation de référence |
| **Wikiquote** | [Aide:Citation](https://fr.wikiquote.org/wiki/Aide:Citation) | Format officiel des citations |

---

## 📚 Références

### Documentation officielle

- 📖 [MDN - Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) - Guide JavaScript complet
- 📖 [Wikiquote - Format des citations](https://fr.wikiquote.org/wiki/Aide:Citation) - Syntaxe MediaWiki

### Outils interactifs

- 🔧 [Regex101](https://regex101.com/) - Testeur en ligne avec explications détaillées
- 🔧 [RegExr](https://regexr.com/) - Visualiseur et cheatsheet
- 🔧 [RegexBuddy](https://www.regexbuddy.com/) - Outil desktop (payant)

### Ressources complémentaires

- 📚 [Mastering Regular Expressions](https://www.oreilly.com/library/view/mastering-regular-expressions/0596528124/) - Livre de référence (O'Reilly)
- 📚 [Regular-Expressions.info](https://www.regular-expressions.info/) - Tutoriels et exemples
- 📚 [Regex Crossword](https://regexcrossword.com/) - Apprendre en jouant

---

<div align="center">

**[← Retour au README](README.md)** | **[Voir le code source →](src/constants/)**

*Documentation mise à jour pour Kaamelott Citation Extractor v1.0.1*

</div>