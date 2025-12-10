<div align="center">

# Kaamelott Citation Extractor

Un parseur XML TypeScript sophistiqué pour extraire et structurer les citations de **Kaamelott** depuis les dumps XML de
Wikiquote avec un système de regex avancé et une architecture modulaire robuste.

---

### Technologies

<img src="https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/-Node.js-43853D?style=flat-square&logo=node.js&logoColor=white"> 

<img src="https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white"> <img src="https://img.shields.io/badge/-Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black"> <img src="https://img.shields.io/badge/-Husky-00C7B7?style=flat-square&logo=git&logoColor=white"> <img src="https://img.shields.io/badge/-lint--staged-FF6B6B?style=flat-square&logo=git&logoColor=white">

<img src="https://img.shields.io/badge/-JSON-000000?style=flat-square&logo=json&logoColor=white"> <img src="https://img.shields.io/badge/-XML-FF6600?style=flat-square&logo=xml&logoColor=white"> <img src="https://img.shields.io/badge/-RegExp-DD0031?style=flat-square&logo=javascript&logoColor=white">

### Status

![Version](https://img.shields.io/github/package-json/v/BenB-Code/Kaamelott_Citation_Extractor?style=flat-square&logo=github)
![Release CI](https://img.shields.io/github/actions/workflow/status/BenB-Code/Kaamelott_Citation_Extractor/release.yml?style=flat-square&logo=github-actions&label=Release)
![Citations extract](https://img.shields.io/github/actions/workflow/status/BenB-Code/Kaamelott_Citation_Extractor/update-citations.yml?style=flat-square&logo=github-actions&label=Citations)

</div>

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Structure des données](#-structure-des-données-extraites)
- [Architecture du projet](#️-architecture-du-projet)
- [Documentation technique](#-documentation-technique)
- [Contribution](#-contribution)

## 🔧 Prérequis

- **Node.js** : Version 16 ou supérieure (recommandé : v22)
- **npm** : Installé avec Node.js
- **Git** : Pour cloner le repository

## 🚀 Installation

```bash
# 1. Cloner le repository
git clone https://github.com/BenB-Code/Kaamelott_Citation_Extractor.git
cd Kaamelott_Citation_Extractor

# 2. Installer les dépendances
npm install

# 3. (Optionnel) Vérifier la configuration
npm run lint
npm run format:check
```

## ⚡ Utilisation

### 🎯 Démarrage rapide

**Premier lancement (obligatoire)** : Récupérer les données depuis Wikiquote

```bash
npm run start:prod
```

**Lancements suivants** : Utiliser les données locales

```bash
npm run start:local
```

### 📝 Commandes disponibles

| Commande                                     | Description                                                | Quand l'utiliser ?                           |
|----------------------------------------------|------------------------------------------------------------|----------------------------------------------|
| `npm run start:prod`                         | **Mode Production** - Télécharge les XML depuis Wikiquote  | Premier lancement ou mise à jour des données |
| `npm run start:local`                        | **Mode Local** - Utilise les fichiers XML déjà téléchargés | Développement et tests                       |
| `npm run start:citations:variations_extract` | Génère les enums TypeScript depuis les données extraites   | Après extraction pour analyse des valeurs    |
| `npm run build`                              | Compile le TypeScript en JavaScript                        | Avant déploiement ou test                    |
| `npm run lint`                               | Vérifie le code avec ESLint                                | Avant commit                                 |
| `npm run lint:fix`                           | Corrige automatiquement les erreurs ESLint                 | Nettoyage du code                            |
| `npm run format`                             | Formate le code avec Prettier                              | Avant commit                                 |
| `npm run format:check`                       | Vérifie le formatage sans modifier                         | CI/CD                                        |

### ⚠️ Avertissements importants

- **Mode Production** : Sollicite les serveurs officiels de Wikiquote. À utiliser avec modération.
- **Pre-commit hooks** : ESLint et Prettier s'exécutent automatiquement avant chaque commit (via Husky).
- **Données générées** : Les fichiers dans `dist/` sont ignorés par Git et doivent être régénérés après chaque
  `git clone`.

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

### 📄 Modèle de citation

Chaque citation est structurée selon le modèle TypeScript suivant :

```typescript
interface CitationModel {
    character_name: string;      // Nom du personnage : "Arthur", "Perceval", etc.
    author: string[];            // Auteur(s) : ["Alexandre Astier"]
    actor: string[];             // Acteur(s) : ["Alexandre Astier", "Franck Pitiot"]
    description: string;         // Le texte complet de la citation
    media: string;               // Type de média : "série", "film", "court métrage"

    // 📺 Métadonnées pour les séries
    show: string;                // Nom de la série : "Kaamelott"
    season: string;              // Saison : "Livre I", "Livre II", "Livre III", etc.
    episode: {
        name: string;              // Titre : "La Tarte aux myrtilles"
        number: string | number;   // Numéro : "12" ou 12
    };

    // 🎬 Métadonnées pour les films
    title: string;               // Titre du film
    date: string;                // Date de sortie
}
```

### 💡 Exemple concret

**Input Wikiquote** :

```wiki
{{citation
|citation=C'est pas faux
|auteur=[[Perceval]]
|acteur=Franck Pitiot
|série=Kaamelott
|saison=Livre II
|épisode=12: Les Exploités
}}
```

**Output JSON** :

```json
{
  "character_name": "Perceval",
  "author": [
    "Perceval"
  ],
  "actor": [
    "Franck Pitiot"
  ],
  "description": "C'est pas faux",
  "media": "série",
  "show": "Kaamelott",
  "season": "Livre II",
  "episode": {
    "name": "Les Exploités",
    "number": "12"
  },
  "title": "",
  "date": ""
}
```

### 📚 Sources traitées

Le système extrait depuis **28 pages Wikiquote** organisées en deux catégories :

| Type              | Nombre | Exemples                                          | Description                                            |
|-------------------|--------|---------------------------------------------------|--------------------------------------------------------|
| **Page Globale**  | 1      | `Global.xml`                                      | Citations de tous les personnages                      |
| **Pages Dédiées** | 27     | `Arthur.xml`, `Perceval.xml`, `Karadoc.xml`, etc. | Citations ciblées par personnages |

**Liste complète des personnages** : Arthur, Perceval, Karadoc, Léodagan, Bohort, Gauvain, Lancelot, Merlin, Guenièvre,
Père Blaise, Caius Camillus, et 16 autres.

## 🗂️ Architecture du projet

### 📁 Structure des sources (`src/`)

```
src/
├── 📂 constants/              # Configuration et patterns
│   ├── citations-extract.constant.ts    # 12 regex d'extraction ciblées
│   ├── cleaning-regexp.constant.ts      # 16 patterns de nettoyage
│   ├── episodes-names.constant.ts       # 200+ noms d'épisodes mappés
│   ├── movies-names.constant.ts         # Noms de films mappés
│   ├── xml-urls.constant.ts             # URLs des 28 sources Wikiquote
│   └── *.enum.ts                        # Enums (extensions, types média)
│
├── 📂 models/                 # Types et structures de données
│   ├── citation.model.ts                # Interface CitationModel
│   ├── citation-metadata.model.ts       # Classe avec getters/setters
│   ├── citation-metadata.builder.ts     # Builder pattern pour citations
│   ├── episode.model.ts                 # Type Episode
│   └── *.model.ts                       # Autres types (Author, etc.)
│
├── 📂 services/               # Logique métier découplée
│   ├── parser.service.ts                # Extraction regex et parsing
│   ├── fetching.service.ts              # Téléchargement + lecture locale
│   ├── file.service.ts                  # Gestion fichiers + JSON
│   ├── logger.service.ts                # Système de logs structuré
│   └── common.service.ts                # Utilitaires + nettoyage texte
│
├── 📂 tools/                  # Outils auxiliaires
│   └── citations-variation-extractor.ts # Génère enums depuis données
│
├── 📄 citations.parser.ts     # Orchestrateur principal
└── 📄 index.ts                # Point d'entrée + mode detection
```

### 🏗️ Dossiers générés (`dist/`)

Les fichiers générés après compilation et extraction :

```
dist/
├── 📂 fetched_extract/        # Données brutes téléchargées
│   └── citations/                       # 28 fichiers XML depuis Wikiquote
│       ├── Global.xml
│       ├── Arthur.xml
│       ├── Perceval.xml
│       └── ... (25 autres fichiers)
│
├── 📂 parsed_extract/         # Données structurées et extraites
│   ├── citations/                       # 28 JSON (un par personnage)
│   │   ├── Global.json
│   │   ├── Arthur.json
│   │   └── ...
│   ├── global/
│   │   └── citations.json               # ⭐ Fichier consolidé (toutes les citations)
│   └── variations/
│       └── citations.variations.enum.ts # Enums générés pour analyse
│
└── 📂 *.js                    # Code TypeScript compilé
    ├── index.js
    ├── citations.parser.js
    └── services/*.js
```

### 🔄 Flux de traitement

```
┌─────────────────┐
│  Wikiquote XML  │ ──┐
└─────────────────┘   │
                      ↓
          ┌───────────────────────┐
          │  FetchingService      │  Téléchargement ou lecture locale
          └───────────────────────┘
                      ↓
          ┌───────────────────────┐
          │  CommonService        │  Nettoyage (16 regex)
          └───────────────────────┘
                      ↓
          ┌───────────────────────┐
          │  ParserService        │  Extraction (12 regex)
          └───────────────────────┘
                      ↓
          ┌───────────────────────┐
          │  CitationBuilder      │  Construction objet
          └───────────────────────┘
                      ↓
          ┌───────────────────────┐
          │  FileService          │  Écriture JSON + déduplication
          └───────────────────────┘
                      ↓
          ┌───────────────────────┐
          │  Citations JSON       │  ✅ Données structurées
          └───────────────────────┘
```

## 🔧 Fonctionnalités avancées

### 🎯 Extraction intelligente par regex

Le projet utilise **12 expressions régulières spécialisées** pour extraire les données :

| Regex                                | Cible                                        | Complexité |
|--------------------------------------|----------------------------------------------|------------|
| `citations_divider`                  | Sépare les blocs de citations                | ⭐⭐⭐        |
| `global_character_isolation`         | Isole les sections de personnages            | ⭐⭐⭐        |
| `description`                        | Extrait le texte de la citation              | ⭐⭐         |
| `author` / `actor`                   | Extrait auteurs et acteurs (avec liens wiki) | ⭐⭐         |
| `episode`                            | Parse numéro + titre d'épisode               | ⭐⭐⭐        |
| `season` / `show` / `title` / `date` | Métadonnées diverses                         | ⭐          |

**Exemple de regex complexe** :

```typescript
// Séparateur de citations avec lookahead
const citations_divider = /\{\{\s*[Cc]itation\b[\s\S]*?(?=(\{\{\s*[Cc]itation\b|^===|\[\[\s*Catégorie\s*:\s*Kaamelott|$))/gmi
```

👉 **[Voir la documentation complète des regex](REGEXP.md)** pour tous les détails techniques.

### 🧹 Nettoyage XML (16 patterns)

Transformation automatique des formats Wikiquote :

| Type               | Avant                    | Après                    |
|--------------------|--------------------------|--------------------------|
| **Entités HTML**   | `&lt;citation&gt;`       | `<citation>`             |
| **Espaces**        | `&nbsp;`                 | ` ` (espace normal)      |
| **Templates Wiki** | `{{personnage\|Arthur}}` | `Arthur`                 |
| **Ligatures**      | `æ`, `œ`                 | `ae`, `oe`               |
| **Balises HTML**   | `<br/>`, `<poem>`        | Supprimées ou converties |
| **Espacement**     | Espaces multiples        | Normalisés               |

### 🎭 Détection contextuelle

Le parseur s'adapte automatiquement selon le contexte :

- ✅ **Citations globales** vs **pages dédiées** (détection automatique)
- ✅ **Série** vs **Film** (champs différents selon le média)
- ✅ **Liens de redirection** détectés et ignorés (évite les doublons)
- ✅ **Mapping épisodes** : 200+ titres d'épisodes pré-mappés

## 📚 Documentation technique

### 📖 Guides disponibles

| Document                       | Description                                                                   | Audience     |
|--------------------------------|-------------------------------------------------------------------------------|--------------|
| **[REGEXP.md](REGEXP.md)**     | Documentation complète des regex (12 patterns d'extraction + 16 de nettoyage) | Développeurs |
| **README.md** (ce fichier)     | Vue d'ensemble et guide d'utilisation                                         | Tous         |
| **[LICENSE.txt](LICENSE.txt)** | Licence Custom Non-Commercial                                                 | Tous         |

### 🛠️ Outils inclus

**Extracteur de variations** :

```bash
npm run start:citations:variations_extract
```

Génère des enums TypeScript depuis les données extraites pour analyse et validation.

**Système de logging** :

```typescript
logger.info("Message", "ContexteService");        // Log standard
logger.warn("Attention", "Context", true);        // Overwrite (progress bar)
logger.error(new Error("Erreur"), "Context");     // Stack trace complète
```

> **Note** : Le logger détecte automatiquement l'environnement TTY (GitHub Actions vs local) et s'adapte.

## 📈 Statistiques du projet

| Métrique                | Valeur       | Description                        |
|-------------------------|--------------|------------------------------------|
| **Sources Wikiquote**   | 28 pages XML | Citations de 28 personnages        |
| **Épisodes mappés**     | 200+         | Noms complets des épisodes         |
| **Regex de nettoyage**  | 16 patterns  | Normalisation XML → texte          |
| **Regex d'extraction**  | 12 patterns  | Extraction métadonnées structurées |
| **Citations extraites** | Milliers     | Déduplication automatique          |
| **Fichiers générés**    | 60+          | XML + JSON + TypeScript            |

## 🔄 Workflow d'extraction

```
1️⃣ Détection mode (NODE_ENV)  →  Local ou Production
2️⃣ Téléchargement            →  Skip si mode local
3️⃣ Nettoyage XML             →  16 regex de normalisation
4️⃣ Parsing contextuel         →  Détection série/film, global/dédié
5️⃣ Extraction métadonnées     →  12 regex ciblées
6️⃣ Construction objet         →  Builder pattern + validation
7️⃣ Déduplication             →  Comparaison JSON stricte
8️⃣ Export structuré           →  JSON par personnage + consolidé
```

## 🚦 Gestion d'erreurs robuste

| Mécanisme              | Description                          | Exemple                                                         |
|------------------------|--------------------------------------|-----------------------------------------------------------------|
| **Safe execution**     | Wrapper try/catch avec fallbacks     | `safeExecute(() => readFile(), "Error", context, defaultValue)` |
| **Validation chemins** | Création auto des dossiers manquants | `ensureDirectory(path)`                                         |
| **Logging contextuel** | Chaque service a son contexte        | `[FileService] File created: ...`                               |
| **Regex failsafe**     | Valeurs par défaut si pas de match   | `[...text.matchAll(regex)][0] \|\| ''`                          |
| **TTY detection**      | Adaptation logs selon environnement  | GitHub Actions vs terminal local                                |

## 🗺️ Roadmap

| Statut | Fonctionnalité                                                    | 
|--------|-------------------------------------------------------------------|
| [ ]    | **Tests unitaires** (Jest, coverage > 80%)                        |
| [x]    | **Documentation regex complète** → [REGEXP.md](REGEXP.md)         |
| [ ]    | **Terminal interactif** (mode, nettoyage, etc.)                   |
| [ ]    | **Parsing des Dialogues** Wikiquote                               |
| [ ]    | **Parsing des BD** Kaamelott                                      |
| [x]    | **[API REST](https://github.com/dantika/Kaamelott_Citation_API)** |
| [x]    | **Interface web**|

## 🤝 Contribution

Les contributions sont bienvenues ! Voici comment participer :

### 1️⃣ Setup du projet

```bash
git clone https://github.com/BenB-Code/Kaamelott_Citation_Extractor.git
cd Kaamelott_Citation_Extractor
npm install
```

### 2️⃣ Créer une branche feature

```bash
git checkout -b feature/ma-fonctionnalite
```

### 3️⃣ Développer avec qualité

- ✅ Respecter l'architecture en **services**
- ✅ Suivre les **conventions TypeScript** (ESLint + Prettier)
- ✅ Ajouter des **tests** pour le nouveau code
- ✅ Documenter les **nouvelles regex** dans [REGEXP.md](REGEXP.md)
- ✅ Les **pre-commit hooks** valident automatiquement

### 4️⃣ Soumettre une Pull Request

```bash
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/ma-fonctionnalite
```

### 📋 Checklist PR

- [ ] Code lint sans erreurs (`npm run lint`)
- [ ] Code formatté (`npm run format`)
- [ ] Build réussi (`npm run build`)
- [ ] Documentation mise à jour si nécessaire
- [ ] Commit message descriptif

## 📧 Contact & Support

**Développeur** : Benjamin Bats
**Email** : [bats.benjamin.dev@gmail.com](mailto:bats.benjamin.dev@gmail.com)
**Issues** : [GitHub Issues](https://github.com/BenB-Code/Kaamelott_Citation_Extractor/issues)

## 📄 Licence

Ce projet est sous licence **Custom Non-Commercial**.
Voir [LICENSE.txt](LICENSE.txt) pour plus de détails.

---

<div align="center">

**Développé avec beaucoup de regex, trop de regex** 🔍

*"C'est pas faux !" - Perceval de Galles* 🏰⚔️

**[⭐ Star ce projet](https://github.com/BenB-Code/Kaamelott_Citation_Extractor)** si vous l'appréciez !

</div>