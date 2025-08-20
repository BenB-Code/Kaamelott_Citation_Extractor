# 🛠️ Kaamelott Citation Extractor

Un parseur XML TypeScript sophistiqué pour extraire et structurer les citations de **Kaamelott** depuis les dumps XML de Wikiquote avec un système de regex avancé et une architecture modulaire robuste.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json&logoColor=white)
![XML](https://img.shields.io/badge/XML-FF6600?style=flat-square&logo=xml&logoColor=white)
![RegExp](https://img.shields.io/badge/RegExp-DD0031?style=flat-square&logo=javascript&logoColor=white)

## 🚀 Installation

```bash
git clone https://github.com/dantika/Kaamelott_Citation_Extractor.git
cd Kaamelott_Citation_Extractor
npm install
```

## ⚡ Utilisation

### Commandes disponibles

```bash
# Lancer une prod en premier pour récupérer les xml une première fois
# Mode Production - Télécharge depuis Wikiquote (ATTENTION: charge les serveurs)
npm run start:prod

# Mode Local - Utilise les fichiers XML déjà téléchargés
npm run start:local

# Extraction des variations pour génération d'enums TypeScript
npm run start:citations:variations_extract
```

> ⚠️ **Mode Production** : Utilise les serveurs officiels de Wikiquote. Soyez respectueux !

## 🎯 Fonctionnalités principales

### Extraction multi-sources intelligente
- **28 personnages** extraits individuellement depuis Wikiquote
- **Citations** spécifiques par personnage
- **Parsing contextuel** : série vs film, épisodes vs saisons
- **Détection automatique** des métadonnées (acteur, auteur, épisode, etc.)

### Système de regex sophistiqué
- **16 patterns de nettoyage** pour le XML brut
- **Extraction ciblée** avec regex nommées et contextuelles
- **Normalisation** des caractères spéciaux et entités HTML
- **Détection des liens** vers pages spécifiques de personnages

### Architecture modulaire
- **Services découplés** : parsing, fetching, logging, fichiers
- **Modèles TypeScript** avec Builder pattern
- **Gestion d'erreurs** robuste avec fallbacks
- **Logging structuré** avec contexte et niveaux

## 📊 Structure des données extraites

### Modèle de citation
```typescript
interface CitationModel {
  character_name: string;      // "Arthur", "Perceval", etc.
  author: string[];           // ["Alexandre Astier"]
  actor: string[];            // ["Alexandre Astier", "Franck Pitiot"]
  description: string;        // Le texte de la citation
  media: string;             // "série" ou "film"
  
  // Pour les séries
  show: string;              // "Kaamelott"
  season: string;            // "Livre I", "Livre II", etc.
  episode: {
    name: string;            // "La Tarte aux myrtilles"
    number: string | number; // "12" ou 12
  };
  
  // Pour les films
  title: string;             // Titre du film
  date: string;              // Date de sortie
}
```

### Sources traitées
Le système extrait depuis **28 pages Wikiquote** :
- `Global.xml` - Citations générales issue de personnages n'ayant pas leur propre page personnalisée sur WikiQuote
- `Arthur.xml`, `Perceval.xml`, `Karadoc.xml` - Citations  issue de personnages ayant leur propre page personnalisée sur WikiQuote

## 🗂️ Architecture du projet

```
src/
├── constants/
│   ├── citations-extract.constant.ts    # 12 regex d'extraction ciblées
│   ├── cleaning-regexp.constant.ts      # 16 patterns de nettoyage
│   ├── episodes-names.constant.ts       # 200+ noms d'épisodes mappés
│   ├── movies-names.constant.ts         # noms de films mappés
│   ├── xml-urls.constant.ts             # URLs des 28 sources Wikiquote
│   └── *.enum.ts                        # Enums pour extensions et types
├── models/
│   ├── citation.model.ts               # Interface + Builder + Metadata
│   ├── episode.model.ts                # Structure épisode
│   └── *.model.ts                      # Modèles auxiliaires
├── services/
│   ├── parser.service.ts               # Logique d'extraction
│   ├── fetching.service.ts             # Téléchargement XML + lecture locale
│   ├── file.service.ts                 # Gestion fichiers + JSON append
│   ├── logger.service.ts               # Système de logs avec contexte
│   └── common.service.ts               # Utilitaires + nettoyage texte
├── tools/
│   └── citations-variation-extractor.ts # Génération d'enums TypeScript pour vérifier la cohérence des valeurs
├── citations.parser.ts                 # Orchestrateur principal
└── index.ts                            # Point d'entrée + détection de mode
```

### Dossiers générés
```
dist/
├── fetched_extract/citations/          # Fichiers XML téléchargés (28 fichiers)
├── parsed_extract/
│   ├── citations/                      # JSON par personnage (28 fichiers)
│   ├── global/citations.json           # Toutes les citations consolidées dans un JSON unique
│   └── variations/citations.variations.enum.ts # Enums auto-générés listant unitairement toute les valeurs
└── *.js                                # Code compilé
```

## 🔧 Fonctionnalités avancées

### Regex d'extraction
```typescript
// Exemples de patterns utilisés
const CITATIONS_EXTRACT = {
  global: /<title>Kaamelott<\/title>/g,
  citations_divider: /\{\{\s*[Cc]itation\b[\s\S]*?(?=(\{\{\s*[Cc]itation\b|^===|\[\[\s*Catégorie\s*:\s*Kaamelott|$))/gmi,
  global_character_name: /===( |)\[\[w:Personnages de Kaamelott#([\s\S]*?)\|/g,
  episode: /\|\s*(?:[eéE]p(?:isode)?\.?)\s*=\s*(?:(\d+)(?:\/\d+)?\s*[:;\-]?\s*)?(.+?)\s*\}\}/g,
  // ... 8 autres patterns spécialisés
};
```

### Nettoyage XML
- **Entités HTML** : `&lt;`, `&gt;`, `&nbsp;` → caractères normaux
- **Balises MediaWiki** : `{{e}}`, `{{personnage|...}}` → suppression/conversion
- **Caractères spéciaux** : `æ` → `ae`, `œ` → `oe`
- **Espacement** : normalisation des espaces multiples

### Détection contextuelle
- **Citations globales** vs **spécifiques par personnage**
- **Série** vs **Film** (différents champs de métadonnées)
- **Liens vers pages spécifiques** (évite la duplication)
- **Épisodes numérotés** avec mapping des noms complets

## 🛠️ Outils inclus

### Extracteur de variations
```bash
npm run start:citations:variations_extract
```
Génère automatiquement des enums TypeScript depuis les données extraites :
- Analyse tous les champs des citations
- Crée des enums pour chaque propriété unique
- Gère les doublons avec suffixes numériques
- Normalise les noms (accents → ASCII, caractères spéciaux → `_`)

### Système de logging
```typescript
logger.info("Message", "ContexteService");        // Info normale
logger.warn("Attention", "Context", true);        // Overwrite ligne
logger.error(new Error("Erreur"), "Context");     // Stack trace complète
```

## 📈 Statistiques du projet

- **28 sources XML** traitées simultanément
- **200+ épisodes** référencés avec noms complets
- **16 patterns** de nettoyage regex
- **12 extracteurs** spécialisés par type de données
- **Milliers de citations** structurées et déduplication automatique

## 🔄 Workflow d'extraction

1. **Détection du mode** : Local vs Production via `NODE_ENV`
2. **Téléchargement conditionnel** : Skip si mode local
3. **Nettoyage XML** : Application des 16 patterns de nettoyage
4. **Parsing contexuel** : Global vs spécifique, série vs film
5. **Extraction métadonnées** : Regex ciblées pour chaque champ
6. **Déduplication** : Vérification JSON pour éviter les doublons
7. **Export structuré** : JSON par personnage + consolidé global

## 🚦 Gestion d'erreurs

- **Safe execution** : Wrapper try/catch avec fallbacks
- **Validation des chemins** : Création automatique des dossiers
- **Gestion des fichiers manquants** : Logs explicites
- **Regex failsafe** : Valeurs par défaut si pas de match
- **Logging contextuel** : Identification précise des erreurs

## 🗺️ Roadmap

- [ ] **Tests unitaires** Jest avec coverage > 80%
- [ ] **Documenter** les regexp
- [ ] **Terminal** interactif pour choisir local/prod, cleanse les anciens fichiers, etc
- [ ] **Parsing des Dialogues** depuis Wikiquote
- [ ] **Parsing des Bandes Dessinées** Kaamelott
- [x] _WIP_ **[API REST](https://github.com/dantika/Kaamelott_Citation_API)** pour consultation des citations
- [ ] _WIP_ **[Interface web](https://github.com/dantika)** de recherche et filtrage

## 🤝 Contribution

Les contributions sont bienvenues !

1. **Fork** et créer une branche feature
2. **Respecter l'architecture** en services
3. **Ajouter des tests** pour le nouveau code
4. **Suivre les conventions** TypeScript du projet
5. **Documenter** les nouvelles regex/constantes

## 📧 Contact

**Benjamin Bats** - [bats.benjamin.dev@gmail.com](mailto:bats.benjamin.dev@gmail.com)

## 📄 Licence
[License - Custom Non-Commercial](LICENSE.txt)

---

**Développé avec beaucoup de regex, trop de regex**

*"C'est pas faux !" - Perceval de Galles* 🏰⚔️