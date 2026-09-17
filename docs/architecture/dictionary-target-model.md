# Dictionary target data model

Status: **Accepted target model — implementation is in progress; database application remains unverified.**

This document records the accepted target model and its implementation contract.
“Wikipedia model” in the product discussion is interpreted as **Wikidata's WikibaseLexeme model**, because
Wikipedia articles do not define a lexicographical data model.

## Annotation legend

- `[WIKIDATA]`: directly follows a WikibaseLexeme concept.
- `[WORDSEED]`: product-specific data that WikibaseLexeme does not prescribe.
- `[DIFF]`: intentionally differs from Wikidata for type safety, query cost, or product scope.

## Ownership map

```text
DictionaryLexeme                          [WIKIDATA]
├── DictionaryLemma[]                     [WIKIDATA]
├── DictionaryForm[]                      [WIKIDATA]
│   ├── DictionaryFormRepresentation[]    [WIKIDATA]
│   ├── DictionaryFormFeature[]            [WIKIDATA]
│   └── DictionaryPronunciation[]          [WORDSEED + WIKIDATA statement semantics]
│       └── DictionaryPronunciationSense[] [DIFF: explicit applicable-sense qualifier]
├── DictionarySense[]                     [WIKIDATA]
│   ├── DictionarySenseGloss[]             [WIKIDATA]
│   ├── DictionarySenseRelation[]          [DIFF: typed statements]
│   ├── DictionaryExample[]                [WORDSEED]
│   ├── DictionarySenseNarrative[]         [WORDSEED]
│   └── DictionarySenseUsage[]             [WORDSEED]
└── DictionaryLexemeRelation[]             [DIFF: typed statements]

DictionarySense ── 0..1 DictionarySynset  [WORDSEED / WordNet]
DictionarySynset
├── DictionarySynsetDefinition[]           [WORDSEED / WordNet]
└── DictionarySynsetRelation[]             [WORDSEED / WordNet]

Every imported assertion ── DictionarySource [WORDSEED]
```

## Target Prisma shape

The following is the implementation contract. Names may receive mechanical Prisma
relation annotations during implementation, but ownership and cardinality must not
change without updating this decision first.

```prisma
enum DictionarySenseRelationKind {
  ANTONYM
  SYNONYM
  DERIVED_FROM
  CONFUSABLE
  TRANSLATION
  RELATED
}

enum DictionarySynsetRelationKind {
  HYPERNYM
  HYPONYM
  MERONYM
  HOLONYM
  RELATED
}

enum DictionaryLexemeRelationKind {
  DERIVED_FROM
  ETYMOLOGICALLY_RELATED
  ALTERNATIVE_FORM
}

enum DictionarySourceKind {
  WORDSEED_EDITORIAL
  OEWN
  WIKIDATA
  CORPUS
  AI_GENERATED
  OTHER
}

model DictionaryLanguage {
  id                String                      @id @default(uuid()) @db.Uuid

  // [WIKIDATA] Lexeme language is an identity, not merely display metadata.
  // [DIFF] Wordseed owns the catalog; it does not require a Wikidata QID.
  code              String                      @unique @db.VarChar(35)
  name              String                      @db.VarChar(100)
  defaultScriptCode String?                     @map("default_script_code") @db.VarChar(32)
  lexemes           DictionaryLexeme[]
  categories        DictionaryLexicalCategory[]

  @@map("dictionary_languages")
}

model DictionaryLexicalCategory {
  id          String              @id @default(uuid()) @db.Uuid
  languageId  String              @map("language_id") @db.Uuid
  language    DictionaryLanguage  @relation(fields: [languageId], references: [id], onDelete: Restrict)

  // [WIKIDATA] Lexical category belongs to Lexeme, not Synset.
  // [DIFF] A controlled Wordseed catalog replaces a fixed English-centric enum.
  code        String              @db.VarChar(64)
  displayName String              @map("display_name") @db.VarChar(100)
  lexemes     DictionaryLexeme[]

  @@unique([languageId, code])
  @@map("dictionary_lexical_categories")
}

model DictionaryLexeme {
  id                String                    @id @default(uuid()) @db.Uuid

  // [WIKIDATA] The language and lexical category identify the lexical entity.
  languageId        String                    @map("language_id") @db.Uuid
  lexicalCategoryId String                    @map("lexical_category_id") @db.Uuid
  language          DictionaryLanguage        @relation(fields: [languageId], references: [id], onDelete: Restrict)
  lexicalCategory   DictionaryLexicalCategory @relation(fields: [lexicalCategoryId], references: [id], onDelete: Restrict)

  // [WORDSEED] Stable display/search shortcut. It is copied from the primary lemma.
  // It is deliberately NOT unique: homographs may be different Lexemes.
  canonicalLemma    String                    @map("canonical_lemma") @db.VarChar(255)

  createdAt         DateTime                  @default(now()) @map("created_at")
  updatedAt         DateTime                  @updatedAt @map("updated_at")

  lemmas            DictionaryLemma[]
  forms             DictionaryForm[]
  senses            DictionarySense[]

  @@index([languageId, canonicalLemma])
  @@index([languageId, lexicalCategoryId, canonicalLemma])
  @@map("dictionary_lexemes")
}

model DictionaryLemma {
  id          String            @id @default(uuid()) @db.Uuid
  lexemeId    String            @map("lexeme_id") @db.Uuid
  lexeme      DictionaryLexeme  @relation(fields: [lexemeId], references: [id], onDelete: Cascade)

  // [WIKIDATA] Lemmas are language/script-tagged values, not one headword string.
  languageTag String            @map("language_tag") @db.VarChar(35)
  value       String            @db.VarChar(255)
  isPrimary   Boolean           @default(false) @map("is_primary")

  @@unique([lexemeId, languageTag, value])
  @@index([languageTag, value])
  @@map("dictionary_lemmas")
}

model DictionaryForm {
  id          String                         @id @default(uuid()) @db.Uuid
  lexemeId    String                         @map("lexeme_id") @db.Uuid
  lexeme      DictionaryLexeme               @relation(fields: [lexemeId], references: [id], onDelete: Cascade)
  createdAt   DateTime                       @default(now()) @map("created_at")
  updatedAt   DateTime                       @updatedAt @map("updated_at")

  representations DictionaryFormRepresentation[]
  features        DictionaryFormFeature[]
  pronunciations  DictionaryPronunciation[]

  @@index([lexemeId])
  @@map("dictionary_forms")
}

model DictionaryFormRepresentation {
  id          String          @id @default(uuid()) @db.Uuid
  formId      String          @map("form_id") @db.Uuid
  form        DictionaryForm  @relation(fields: [formId], references: [id], onDelete: Cascade)

  // [WIKIDATA] One form can have multiple script/orthography representations.
  languageTag String          @map("language_tag") @db.VarChar(35)
  value       String          @db.VarChar(255)

  @@unique([formId, languageTag, value])
  @@index([languageTag, value])
  @@map("dictionary_form_representations")
}

model DictionaryGrammaticalFeature {
  id          String                    @id @default(uuid()) @db.Uuid

  // [DIFF] Wikidata references Items. Wordseed keeps a controlled vocabulary
  // such as tense:past, number:plural, person:third, degree:comparative.
  key         String                    @unique @db.VarChar(100)
  label       String                    @db.VarChar(100)
  forms       DictionaryFormFeature[]

  @@map("dictionary_grammatical_features")
}

model DictionaryFormFeature {
  formId      String                       @map("form_id") @db.Uuid
  featureId   String                       @map("feature_id") @db.Uuid
  form        DictionaryForm               @relation(fields: [formId], references: [id], onDelete: Cascade)
  feature     DictionaryGrammaticalFeature @relation(fields: [featureId], references: [id], onDelete: Restrict)

  @@id([formId, featureId])
  @@map("dictionary_form_features")
}

model DictionarySense {
  id              String            @id @default(uuid()) @db.Uuid
  lexemeId        String            @map("lexeme_id") @db.Uuid
  lexeme          DictionaryLexeme  @relation(fields: [lexemeId], references: [id], onDelete: Cascade)

  // [WORDSEED / WordNet] Optional conceptual grouping. A sense remains valid
  // without a synset, and shared synset membership means true synonymy.
  synsetId        String?           @map("synset_id") @db.Uuid
  synset          DictionarySynset? @relation(fields: [synsetId], references: [id], onDelete: SetNull)

  // [WORDSEED] Stable editorial order; it is not part of identity.
  order           Int
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  glosses         DictionarySenseGloss[]
  usages          DictionarySenseUsage[]
  examples        DictionaryExample[]
  narratives      DictionarySenseNarrative[]

  @@unique([lexemeId, order])
  @@index([synsetId])
  @@map("dictionary_senses")
}

model DictionarySenseGloss {
  id          String           @id @default(uuid()) @db.Uuid
  senseId     String           @map("sense_id") @db.Uuid
  sense       DictionarySense  @relation(fields: [senseId], references: [id], onDelete: Cascade)

  // [WIKIDATA] A multilingual, lexeme-specific explanation of this exact sense.
  languageTag String           @map("language_tag") @db.VarChar(35)
  text        String           @db.Text

  @@unique([senseId, languageTag])
  @@map("dictionary_sense_glosses")
}

model DictionarySynset {
  id          String                       @id @default(uuid()) @db.Uuid
  createdAt   DateTime                     @default(now()) @map("created_at")
  updatedAt   DateTime                     @updatedAt @map("updated_at")
  senses      DictionarySense[]
  definitions DictionarySynsetDefinition[]

  // [DIFF] No partOfSpeech here. POS/category belongs to each Lexeme.
  @@map("dictionary_synsets")
}

model DictionarySynsetDefinition {
  id          String            @id @default(uuid()) @db.Uuid
  synsetId    String            @map("synset_id") @db.Uuid
  synset      DictionarySynset  @relation(fields: [synsetId], references: [id], onDelete: Cascade)
  languageTag String            @map("language_tag") @db.VarChar(35)
  text        String            @db.Text

  // [WORDSEED / WordNet] Concept-level definition shared by all member senses.
  @@unique([synsetId, languageTag])
  @@map("dictionary_synset_definitions")
}

model DictionaryPronunciation {
  id            String          @id @default(uuid()) @db.Uuid
  formId        String          @map("form_id") @db.Uuid
  form          DictionaryForm  @relation(fields: [formId], references: [id], onDelete: Cascade)

  // [WORDSEED] IPA and playable audio are first-class product data rather than
  // generic Wikidata statements. At least one of ipa or audioUrl must exist.
  ipa           String?         @db.VarChar(255)
  audioUrl      String?         @map("audio_url") @db.Text
  dialectTag    String?         @map("dialect_tag") @db.VarChar(35)
  syllabification String?       @db.VarChar(255)
  sourceId      String?         @map("source_id") @db.Uuid

  applicableSenses DictionaryPronunciationSense[]

  @@index([formId, dialectTag])
  @@map("dictionary_pronunciations")
}

model DictionaryPronunciationSense {
  pronunciationId String                  @map("pronunciation_id") @db.Uuid
  senseId         String                  @map("sense_id") @db.Uuid
  pronunciation   DictionaryPronunciation @relation(fields: [pronunciationId], references: [id], onDelete: Cascade)
  sense           DictionarySense         @relation(fields: [senseId], references: [id], onDelete: Cascade)

  // [DIFF] Explicit equivalent of a Wikidata “applicable sense” qualifier.
  // No rows means the pronunciation applies to every sense of the Lexeme.
  @@id([pronunciationId, senseId])
  @@map("dictionary_pronunciation_senses")
}

model DictionaryExample {
  id                String           @id @default(uuid()) @db.Uuid
  senseId           String           @map("sense_id") @db.Uuid
  sense             DictionarySense  @relation(fields: [senseId], references: [id], onDelete: Cascade)
  formId            String?          @map("form_id") @db.Uuid
  form              DictionaryForm?  @relation(fields: [formId], references: [id], onDelete: SetNull)
  languageTag       String           @map("language_tag") @db.VarChar(35)
  text              String           @db.Text
  sourceId          String?          @map("source_id") @db.Uuid
  translations      DictionaryExampleTranslation[]

  // [WORDSEED] Example text directly resolves its demonstrated Sense and,
  // when known, Form. This replaces duplicate SenseExample/SynsetExample tables.
  @@index([senseId])
  @@map("dictionary_examples")
}

model DictionaryExampleTranslation {
  id          String             @id @default(uuid()) @db.Uuid
  exampleId   String             @map("example_id") @db.Uuid
  example     DictionaryExample  @relation(fields: [exampleId], references: [id], onDelete: Cascade)
  languageTag String             @map("language_tag") @db.VarChar(35)
  text        String             @db.Text

  @@unique([exampleId, languageTag])
  @@map("dictionary_example_translations")
}

model DictionarySenseUsage {
  id              String           @id @default(uuid()) @db.Uuid
  senseId         String           @map("sense_id") @db.Uuid
  sense           DictionarySense  @relation(fields: [senseId], references: [id], onDelete: Cascade)

  // [WORDSEED] Replaces an unexplained commonnessScore with scoped evidence.
  score           Float?
  rank            Int?
  regionTag       String?          @map("region_tag") @db.VarChar(35)
  register        String?          @db.VarChar(50)
  corpus          String?          @db.VarChar(100)
  sourceId        String?          @map("source_id") @db.Uuid

  @@index([senseId, regionTag, register])
  @@map("dictionary_sense_usages")
}

model DictionarySource {
  id          String                @id @default(uuid()) @db.Uuid
  kind        DictionarySourceKind
  name        String                @db.VarChar(150)
  version     String?               @db.VarChar(100)
  url         String?               @db.Text
  license     String?               @db.VarChar(150)
  retrievedAt DateTime?             @map("retrieved_at")

  // [WORDSEED] Shared provenance record. Concrete imported rows reference it.
  @@map("dictionary_sources")
}

model DictionaryLexemeExternalId {
  lexemeId   String            @map("lexeme_id") @db.Uuid
  sourceId   String            @map("source_id") @db.Uuid
  externalId String            @map("external_id") @db.VarChar(255)

  // [WORDSEED] Typed external mapping keeps database foreign-key integrity.
  @@id([lexemeId, sourceId])
  @@unique([sourceId, externalId])
  @@map("dictionary_lexeme_external_ids")
}

model DictionarySenseExternalId {
  senseId    String            @map("sense_id") @db.Uuid
  sourceId   String            @map("source_id") @db.Uuid
  externalId String            @map("external_id") @db.VarChar(255)

  @@id([senseId, sourceId])
  @@unique([sourceId, externalId])
  @@map("dictionary_sense_external_ids")
}

model DictionarySynsetExternalId {
  synsetId   String            @map("synset_id") @db.Uuid
  sourceId   String            @map("source_id") @db.Uuid
  externalId String            @map("external_id") @db.VarChar(255)

  @@id([synsetId, sourceId])
  @@unique([sourceId, externalId])
  @@map("dictionary_synset_external_ids")
}
```

Typed relation tables follow the same shape:

```text
DictionaryLexemeRelation(sourceLexemeId, targetLexemeId, kind, sourceId?)
DictionarySenseRelation(sourceSenseId, targetSenseId, kind, sourceId?)
DictionarySynsetRelation(sourceSynsetId, targetSynsetId, kind, sourceId?)
```

Each table has a unique constraint on `(source, target, kind)`, an index on the
target, and rejects self-relations. Symmetric relations are stored in one canonical
ID order or maintained bidirectionally by one domain rule, never inconsistently by
individual callers.

`DictionarySenseNarrative` remains sense-owned and gains `sourceId`; its existing
`generatedBy` and `promptVersion` fields remain because they are useful AI-content
audit metadata. Etymology is not stored as an `ORIGIN` narrative alone: structured
lexeme ancestry uses `DictionaryLexemeRelation(… DERIVED_FROM)`, while the narrative
is only the learner-facing explanation.

## Deliberate non-adoptions

- **No generic Statement/Snak/Qualifier engine.** Wikidata needs arbitrary community
  facts. Wordseed has a bounded application domain, so typed relation, pronunciation,
  usage, and source tables preserve foreign keys and GraphQL types.
- **No Wikidata Item/QID dependency for language, category, or grammatical feature.**
  Wordseed remains operational if Wikidata changes; optional external IDs can be
  imported later as provenance.
- **No `DictionaryEntryKind`.** `WORD` versus `EXPRESSION` is mostly presentational and
  is replaced by lexical categories such as `PHRASE` and `IDIOM`.
- **No POS on Synset.** The same concept graph does not own a lexeme's grammatical
  behavior. Lexical category belongs to Lexeme.
- **No hard uniqueness on spelling.** `(languageTag, lemma)` and even
  `(languageTag, lemma, lexicalCategory)` may have legitimate homographs.
- **No Form-to-Sense ownership.** Morphology belongs to Lexeme. Only exceptional
  pronunciation applicability links Form data back to individual Senses.
- **No duplicate Synset examples.** Examples are evidence of an actual lexical Sense;
  concept-level definitions remain on Synset.

## Wordseed-only fields worth keeping

- `DictionarySenseNarrative.kind`, `generatedBy`, `promptVersion`: learner-facing and
  AI-auditable content.
- Sense-scoped recommendation inputs: typed sense/synset relations plus evidence-backed
  usage scores. Recommendation results themselves remain computed, not persisted.
- Translated examples: product display content, distinct from a sense gloss.
- `DictionarySenseUsage`: region/register/corpus-scoped ranking for learning order.
- `DictionarySource`: provenance for imported and generated claims.

## Required invariants

1. A Lexeme has at least one Lemma and exactly one primary Lemma.
2. A Form has at least one Representation.
3. A Sense has at least one Gloss in the learner's supported fallback chain.
4. A Pronunciation has IPA or audio; an applicable Sense must belong to the same Lexeme
   as its Form.
5. An Example's Form, when present, belongs to the same Lexeme as its Sense.
6. Shared Synset membership is the only implicit synonymy. `SYNONYM` is used only when
   an imported source asserts a sense relation without a shared Wordseed Synset.
7. Relation endpoints cannot be identical; hypernym relations must be acyclic.
8. A generated narrative or translation records generator and prompt/model provenance.

## Migration boundary

This is an initial product, so the recommended implementation is a destructive reset,
not a compatibility migration:

1. Rename the domain concept `DictionaryEntry` to `DictionaryLexeme` end-to-end.
2. Rebuild the Prisma tables from the target model.
3. Rewrite seed data as Lexeme → Lemma/Form/Sense → optional Synset.
4. Regenerate GraphQL and Relay artifacts; do not preserve legacy field aliases.
5. Validate polysemy/homography with `converse`, and morphology/pronunciation with at
   least one irregular verb and one dialect-varying example.
