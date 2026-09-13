import type {
  DictionaryFormKind,
  DictionarySenseNarrativeKind,
} from "../../domain/dictionary-content";
import type {
  DictionaryEntryKind,
  DictionaryPartOfSpeech,
} from "../../domain/dictionary-entry";

export interface DictionarySeedDefinition {
  languageTag: string;
  text: string;
}

export interface DictionarySeedExample {
  id: string;
  sourceLanguageTag: string;
  sourceText: string;
  translations: readonly {
    id: string;
    languageTag: string;
    text: string;
    generatedBy?: string;
  }[];
}

export interface DictionarySeedSynset {
  id: string;
  partOfSpeech: DictionaryPartOfSpeech | null;
  definitions: readonly DictionarySeedDefinition[];
  examples: readonly DictionarySeedExample[];
}

export interface DictionarySeedNarrative {
  id: string;
  kind: DictionarySenseNarrativeKind;
  languageTag: string;
  markdown: string;
  generatedBy?: string;
  promptVersion?: string;
}

export interface DictionarySeedForm {
  id: string;
  surface: string;
  kind: DictionaryFormKind;
}

export interface DictionarySeedSense {
  id: string;
  synsetId: string;
  commonnessScore: number;
  narratives?: readonly DictionarySeedNarrative[];
  examples?: readonly DictionarySeedExample[];
  forms?: readonly DictionarySeedForm[];
}

export interface DictionarySeedEntry {
  id: string;
  headword: string;
  languageTag: string;
  kind: DictionaryEntryKind;
  senses: readonly DictionarySeedSense[];
}

export interface DictionarySeedSenseRelation {
  sourceSenseId: string;
  targetSenseId: string;
  kind: "DERIVED_FROM" | "ANTONYM" | "CONFUSABLE";
}

export interface DictionarySeedSynsetRelation {
  sourceSynsetId: string;
  targetSynsetId: string;
  kind: "HYPERNYM" | "RELATED";
}

export const dictionarySeedSynsets: readonly DictionarySeedSynset[] = [
  {
    "id": "20000000-0000-4000-8000-000000000101",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "재료를 잘게 갈거나 빻다."
      },
      {
        "languageTag": "en",
        "text": "To crush or reduce something into small particles."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000102",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "힘들고 반복적인 일을 끈질기게 계속하다."
      },
      {
        "languageTag": "en",
        "text": "To keep working steadily at something difficult."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000103",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "지치도록 반복되는 고된 일이나 일상."
      },
      {
        "languageTag": "en",
        "text": "A difficult, repetitive routine or workload."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000104",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "마찰을 일으키며 힘겹거나 느리게 움직이다."
      },
      {
        "languageTag": "en",
        "text": "To move slowly or laboriously with friction or resistance."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000201",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "속도가 느려지다가 움직임이나 작동이 완전히 멈추다."
      },
      {
        "languageTag": "en",
        "text": "To slow down and stop moving or operating completely."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000004",
        "sourceLanguageTag": "en",
        "sourceText": "Traffic ground to a halt after the accident.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000004",
            "languageTag": "ko",
            "text": "사고 뒤 교통이 완전히 멈췄다."
          }
        ]
      }
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000301",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "현재 상황이나 최신 정보를 충분히 파악한."
      },
      {
        "languageTag": "en",
        "text": "Fully informed about the current situation."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000302",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "기대되는 수준으로 제대로 작동하거나 수행하는."
      },
      {
        "languageTag": "en",
        "text": "Operating or performing at the expected level."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000401",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "시간이 지나면서 사람이나 대상에 심각한 손상이나 부담을 주다."
      },
      {
        "languageTag": "en",
        "text": "To cause serious harm or strain over time."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000601",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "기대되거나 요구되는 수준보다 더 많은 노력을 기울이다."
      },
      {
        "languageTag": "en",
        "text": "To make more effort than is expected or required."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000701",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "제안에 동의하거나 함께할 의향이 있다."
      },
      {
        "languageTag": "en",
        "text": "To be willing to join or agree to a suggestion."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000801",
    "partOfSpeech": "ADVERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "사람들의 눈에 쉽게 띄는 환한 대낮에."
      },
      {
        "languageTag": "en",
        "text": "In full daylight, where an action can easily be seen."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000901",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "더 이상 이어지지 않는 막다른 길."
      },
      {
        "languageTag": "en",
        "text": "A road or passage with no exit."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000000902",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "더 이상의 진전이나 가능성이 없는 상황."
      },
      {
        "languageTag": "en",
        "text": "A situation with no prospect of progress."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001001",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "나중에 어떤 주제나 사람에게 다시 돌아가 논의하거나 확인하다."
      },
      {
        "languageTag": "en",
        "text": "To return to a topic or person later for further discussion."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001101",
    "partOfSpeech": null,
    "definitions": [
      {
        "languageTag": "ko",
        "text": "상대방에게 정중하게 허락을 구하다."
      },
      {
        "languageTag": "en",
        "text": "Used to ask for permission politely."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001201",
    "partOfSpeech": null,
    "definitions": [
      {
        "languageTag": "ko",
        "text": "말보다 실제 행동이 사람의 의도나 진심을 더 잘 보여준다."
      },
      {
        "languageTag": "en",
        "text": "What people do reveals more than what they say."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001301",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "어떤 선택이나 사안의 장점과 단점."
      },
      {
        "languageTag": "en",
        "text": "The advantages and disadvantages of something."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001401",
    "partOfSpeech": "ADVERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "앞의 내용을 인정하면서 대조되거나 제한적인 내용을 덧붙일 때 쓰는 말."
      },
      {
        "languageTag": "en",
        "text": "Used to introduce a contrast or qualification to what was just said."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001501",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "쉽게 변하거나 무너지지 않고 안정적인."
      },
      {
        "languageTag": "en",
        "text": "Not likely to change, fail, or become unsafe."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001502",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "말을 기르고 보호하는 건물인 마구간."
      },
      {
        "languageTag": "en",
        "text": "A building in which horses are kept."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001601",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "쉽게 변하거나 무너지지 않는 안정된 상태."
      },
      {
        "languageTag": "en",
        "text": "The state of being steady and unlikely to change or fail."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001701",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "대상을 안정되게 하거나 더 이상 변하지 않게 하다."
      },
      {
        "languageTag": "en",
        "text": "To make something steady or prevent it from changing further."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001801",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "누군가와 대화를 나누다."
      },
      {
        "languageTag": "en",
        "text": "To speak with someone in conversation."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000001",
        "sourceLanguageTag": "en",
        "sourceText": "We talked for an hour after lunch.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000001",
            "languageTag": "ko",
            "text": "우리는 점심 뒤 한 시간 동안 대화했다."
          }
        ]
      }
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000001802",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "어떤 대상과 교류하거나 그 대상에 익숙해지다. 현재는 고어적이다."
      },
      {
        "languageTag": "en",
        "text": "Archaic: to have acquaintance or familiarity with something."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001803",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "순서나 관계가 뒤바뀐 반대의 것 또는 역."
      },
      {
        "languageTag": "en",
        "text": "Something reversed in order, relation, or action."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001804",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "순서나 관계 또는 작용이 반대인."
      },
      {
        "languageTag": "en",
        "text": "Reversed in order, relation, or action."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000001901",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "말로 생각이나 정보를 주고받는 비격식 대화."
      },
      {
        "languageTag": "en",
        "text": "An informal exchange of ideas or information through speech."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000002",
        "sourceLanguageTag": "en",
        "sourceText": "Their conversation continued over coffee.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000002",
            "languageTag": "ko",
            "text": "그들의 대화는 커피를 마시는 동안 계속됐다."
          }
        ]
      }
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000002001",
    "partOfSpeech": "ADVERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "앞에서 말한 것과 반대되는 방식으로 또는 반대로."
      },
      {
        "languageTag": "en",
        "text": "In an opposite or reversed way."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000002101",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "상대의 실수나 문제를 지적하다."
      },
      {
        "languageTag": "en",
        "text": "To draw attention to an error or problem."
      }
    ],
    "examples": []
  },
  {
    "id": "20000000-0000-4000-8000-000000002201",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "잘못을 한 사람을 강하게 꾸짖다."
      },
      {
        "languageTag": "en",
        "text": "To express strong disapproval of someone for wrongdoing."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000003",
        "sourceLanguageTag": "en",
        "sourceText": "The coach scolded the player for ignoring the rules.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000003",
            "languageTag": "ko",
            "text": "코치는 규칙을 무시한 선수를 꾸짖었다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000001",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "단단히 고정되거나 균형이 잡혀 움직이지 않을 것 같은."
      },
      {
        "languageTag": "en",
        "text": "Firmly fixed or balanced and not likely to move."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000005",
        "sourceLanguageTag": "en",
        "sourceText": "Keep the ladder steady while I climb.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000005",
            "languageTag": "ko",
            "text": "내가 올라가는 동안 사다리를 단단히 잡아 줘."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000002",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "보통 엔진으로 움직이는 네 바퀴 도로 차량."
      },
      {
        "languageTag": "en",
        "text": "A road vehicle with four wheels, usually powered by an engine."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000006",
        "sourceLanguageTag": "en",
        "sourceText": "They bought a small car for commuting.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000006",
            "languageTag": "ko",
            "text": "그들은 통근용 소형 자동차를 샀다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000003",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "잘못된 행동, 판단 또는 결과."
      },
      {
        "languageTag": "en",
        "text": "An action, judgment, or result that is incorrect."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000007",
        "sourceLanguageTag": "en",
        "sourceText": "I made a mistake in the final calculation.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000007",
            "languageTag": "ko",
            "text": "나는 최종 계산에서 실수했다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000004",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "활동이나 상태가 계속되지 않도록 멈추다."
      },
      {
        "languageTag": "en",
        "text": "To stop an activity or condition from continuing."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000008",
        "sourceLanguageTag": "en",
        "sourceText": "The noise finally ceased at midnight.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000008",
            "languageTag": "ko",
            "text": "소음은 자정에 마침내 멈췄다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000005",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "멈추는 행위나 경우."
      },
      {
        "languageTag": "en",
        "text": "An act or instance of stopping."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000009",
        "sourceLanguageTag": "en",
        "sourceText": "The bus came to a sudden stop.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000009",
            "languageTag": "ko",
            "text": "버스가 갑자기 멈췄다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000006",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "성공을 더 어렵게 만드는 특징이나 조건."
      },
      {
        "languageTag": "en",
        "text": "A feature or condition that makes success more difficult."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000010",
        "sourceLanguageTag": "en",
        "sourceText": "The long commute is a major drawback.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000010",
            "languageTag": "ko",
            "text": "긴 통근 시간은 큰 단점이다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000007",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "사람이나 집단 사이의 진지하거나 공식적인 논의."
      },
      {
        "languageTag": "en",
        "text": "A serious or organized discussion between people or groups."
      }
    ],
    "examples": [
      {
        "id": "50000000-0000-4000-8000-000000000011",
        "sourceLanguageTag": "en",
        "sourceText": "The two teams held talks about the launch.",
        "translations": [
          {
            "id": "60000000-0000-4000-8000-000000000011",
            "languageTag": "ko",
            "text": "두 팀은 출시를 두고 논의했다."
          }
        ]
      }
    ]
  },
  {
    "id": "40000000-0000-4000-8000-000000000008",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "규칙적이고 일정한 속도로 계속되는."
      },
      {
        "languageTag": "en",
        "text": "Continuing at a regular and consistent rate."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000009",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "압박 속에서도 침착하고 통제력이 있으며 믿을 만한."
      },
      {
        "languageTag": "en",
        "text": "Calm, controlled, and dependable under pressure."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000010",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "예기치 않게 변하거나 실패하거나 위험해질 가능성이 있는."
      },
      {
        "languageTag": "en",
        "text": "Likely to change, fail, or become unsafe unexpectedly."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000011",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "불안정하거나 갑자기 변할 가능성이 있는 상태."
      },
      {
        "languageTag": "en",
        "text": "The state of being unstable or likely to change suddenly."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000012",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "체계나 상황을 덜 안정적으로 만들다."
      },
      {
        "languageTag": "en",
        "text": "To make a system or situation less stable."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000013",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "정보, 생각 또는 감정을 주고받는 일."
      },
      {
        "languageTag": "en",
        "text": "The exchange of information, ideas, or feelings."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000014",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "어떤 주제를 집단이 자세히 검토하는 일."
      },
      {
        "languageTag": "en",
        "text": "Detailed consideration of a subject by a group."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000015",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "공식적이거나 엄중한 질책."
      },
      {
        "languageTag": "en",
        "text": "An official or serious expression of disapproval."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000016",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "사람이나 사물에 대한 인정이나 감탄을 표현하다."
      },
      {
        "languageTag": "en",
        "text": "To express approval or admiration for someone or something."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000017",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "인정이나 감탄을 나타내는 표현."
      },
      {
        "languageTag": "en",
        "text": "An expression of approval or admiration."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000018",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "사람이나 물건을 운송하는 데 쓰는 기계."
      },
      {
        "languageTag": "en",
        "text": "A machine used to transport people or goods."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000019",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "승객이나 화물을 싣는 철도 차량."
      },
      {
        "languageTag": "en",
        "text": "A railway carriage for passengers or freight."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000020",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "페달로 움직이는 두 바퀴 차량."
      },
      {
        "languageTag": "en",
        "text": "A two-wheeled vehicle moved by pedals."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000021",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "화물을 운반하는 대형 도로 차량."
      },
      {
        "languageTag": "en",
        "text": "A large road vehicle used to carry goods."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000022",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "무거운 물건을 손으로 옮기는 데 쓰는 작은 바퀴 달린 틀."
      },
      {
        "languageTag": "en",
        "text": "A small wheeled frame used to move heavy objects by hand."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000023",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "행동이나 사건이 일어나지 못하게 하다."
      },
      {
        "languageTag": "en",
        "text": "To cause an action or event not to happen."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000024",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "성공 가능성을 높이는 유리한 조건."
      },
      {
        "languageTag": "en",
        "text": "A favorable condition that improves the chance of success."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000025",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "무언가로부터 얻는 유익하거나 긍정적인 결과."
      },
      {
        "languageTag": "en",
        "text": "A helpful or positive result obtained from something."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000026",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "무언가로부터 도움이나 이익을 얻다."
      },
      {
        "languageTag": "en",
        "text": "To receive help or an advantage from something."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000027",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "무언가에 영향을 주거나 변화를 일으키다."
      },
      {
        "languageTag": "en",
        "text": "To influence or cause a change in something."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000028",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "특히 심리학에서 관찰되는 감정 표현."
      },
      {
        "languageTag": "en",
        "text": "The observable expression of emotion, especially in psychology."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000029",
    "partOfSpeech": "NOUN",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "행동이나 사건으로 인해 생긴 변화나 결과."
      },
      {
        "languageTag": "en",
        "text": "A change or result caused by an action or event."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000030",
    "partOfSpeech": "VERB",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "어떤 일이 일어나게 하거나 성사시키다."
      },
      {
        "languageTag": "en",
        "text": "To cause something to happen or bring it about."
      }
    ],
    "examples": []
  },
  {
    "id": "40000000-0000-4000-8000-000000000031",
    "partOfSpeech": "ADJECTIVE",
    "definitions": [
      {
        "languageTag": "ko",
        "text": "의도한 결과를 만들어 내는 데 성공적인."
      },
      {
        "languageTag": "en",
        "text": "Successful in producing the intended result."
      }
    ],
    "examples": []
  }
];

export const dictionarySeedEntries: readonly DictionarySeedEntry[] = [
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "headword": "grind",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000101",
        "synsetId": "20000000-0000-4000-8000-000000000101",
        "commonnessScore": 0.96,
        "forms": [
          {
            "id": "41000000-0000-4000-8000-000000000101",
            "surface": "grinds",
            "kind": "THIRD_PERSON_SINGULAR"
          },
          {
            "id": "42000000-0000-4000-8000-000000000101",
            "surface": "ground",
            "kind": "PAST"
          },
          {
            "id": "43000000-0000-4000-8000-000000000101",
            "surface": "ground",
            "kind": "PAST_PARTICIPLE"
          },
          {
            "id": "44000000-0000-4000-8000-000000000101",
            "surface": "grinding",
            "kind": "PRESENT_PARTICIPLE"
          }
        ]
      },
      {
        "id": "10000000-0000-4000-8000-000000000102",
        "synsetId": "20000000-0000-4000-8000-000000000102",
        "commonnessScore": 0.72,
        "forms": [
          {
            "id": "41000000-0000-4000-8000-000000000102",
            "surface": "grinds",
            "kind": "THIRD_PERSON_SINGULAR"
          },
          {
            "id": "42000000-0000-4000-8000-000000000102",
            "surface": "ground",
            "kind": "PAST"
          },
          {
            "id": "43000000-0000-4000-8000-000000000102",
            "surface": "ground",
            "kind": "PAST_PARTICIPLE"
          },
          {
            "id": "44000000-0000-4000-8000-000000000102",
            "surface": "grinding",
            "kind": "PRESENT_PARTICIPLE"
          }
        ]
      },
      {
        "id": "10000000-0000-4000-8000-000000000103",
        "synsetId": "20000000-0000-4000-8000-000000000103",
        "commonnessScore": 0.68
      },
      {
        "id": "10000000-0000-4000-8000-000000000104",
        "synsetId": "20000000-0000-4000-8000-000000000104",
        "commonnessScore": 0.35,
        "forms": [
          {
            "id": "41000000-0000-4000-8000-000000000104",
            "surface": "grinds",
            "kind": "THIRD_PERSON_SINGULAR"
          },
          {
            "id": "42000000-0000-4000-8000-000000000104",
            "surface": "ground",
            "kind": "PAST"
          },
          {
            "id": "43000000-0000-4000-8000-000000000104",
            "surface": "ground",
            "kind": "PAST_PARTICIPLE"
          },
          {
            "id": "44000000-0000-4000-8000-000000000104",
            "surface": "grinding",
            "kind": "PRESENT_PARTICIPLE"
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000002",
    "headword": "grind to a halt",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000201",
        "synsetId": "20000000-0000-4000-8000-000000000201",
        "commonnessScore": 0.74,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000201",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "**grind**에는 두 표면이 맞물려 힘겹게 갈리는 마찰감이 있습니다. 그 움직임이 **halt**에 닿으면 속도가 줄어드는 데서 끝나지 않고, 진행하던 일이 완전히 멈춥니다. 그래서 **grind to a halt**는 버튼을 눌러 갑자기 멈추는 장면보다 협상·교통·시스템이 저항을 받으며 끝내 멎는 장면에 잘 어울립니다.\n\n가장 자주 보게 될 형태는 **[무언가] ground to a halt**입니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000201",
            "sourceLanguageTag": "en",
            "sourceText": "Negotiations ground to a halt after the dispute.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000201",
                "languageTag": "ko",
                "text": "분쟁 이후 협상이 완전히 중단됐다."
              }
            ]
          }
        ],
        "forms": [
          {
            "id": "41000000-0000-4000-8000-000000000201",
            "surface": "ground to a halt",
            "kind": "PAST"
          },
          {
            "id": "42000000-0000-4000-8000-000000000201",
            "surface": "ground to a halt",
            "kind": "PAST_PARTICIPLE"
          },
          {
            "id": "43000000-0000-4000-8000-000000000201",
            "surface": "grinding to a halt",
            "kind": "PRESENT_PARTICIPLE"
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000003",
    "headword": "up to speed",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000301",
        "synsetId": "20000000-0000-4000-8000-000000000301",
        "commonnessScore": 0.89,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000301",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "달리는 차가 주변 차와 같은 **speed**에 올라오면 흐름을 따라갈 수 있습니다. 사람도 마찬가지입니다. **be up to speed on [주제]**는 그 주제의 최신 상황을 충분히 파악한 상태이고, **bring [사람] up to speed**는 그 사람이 흐름에 합류하도록 필요한 정보를 알려주는 말입니다.\n\n**up-to-date**는 정보나 대상 자체가 최신이라는 데 초점이 있고, **in the loop**는 정보가 오가는 사람들의 범위 안에 있다는 데 초점이 있습니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000301",
            "sourceLanguageTag": "en",
            "sourceText": "Can you bring me up to speed on the client meeting?",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000301",
                "languageTag": "ko",
                "text": "고객 미팅이 어떻게 됐는지 내가 따라잡을 수 있게 알려줄래?"
              }
            ]
          },
          {
            "id": "30000000-0000-4000-8000-000000000302",
            "sourceLanguageTag": "en",
            "sourceText": "I'm not fully up to speed on the new policy yet.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000302",
                "languageTag": "ko",
                "text": "나는 아직 새 정책을 완전히 파악하지 못했어."
              }
            ]
          }
        ]
      },
      {
        "id": "10000000-0000-4000-8000-000000000302",
        "synsetId": "20000000-0000-4000-8000-000000000302",
        "commonnessScore": 0.55
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000004",
    "headword": "take a toll on",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000401",
        "synsetId": "20000000-0000-4000-8000-000000000401",
        "commonnessScore": 0.86,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000401",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "**toll**은 원래 통행료처럼 지나갈 때 치르는 대가를 떠올리게 합니다. **take a toll on [대상]**은 스트레스·시간·질병처럼 보이지 않는 비용이 계속 빠져나가 결국 대상에 손상이나 피로가 드러나는 장면입니다. 한 번의 강한 충격보다 **누적되는 부담**에 잘 어울립니다.\n\n영향이 이미 쌓여 결과가 드러났다면 **take its toll on**도 자주 씁니다."
          },
          {
            "id": "22000000-0000-4000-8000-000000000401",
            "kind": "ORIGIN",
            "languageTag": "ko",
            "markdown": "toll은 통행료나 어떤 사건으로 치르는 희생을 뜻합니다. 여기서는 시간이 지나며 계속 지불하게 되는 손실이라는 이미지로 확장됩니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000401",
            "sourceLanguageTag": "en",
            "sourceText": "Months of overtime took a toll on her health.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000401",
                "languageTag": "ko",
                "text": "몇 달간의 야근은 그녀의 건강을 크게 해쳤다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000005",
    "headword": "rip someone a new one",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000501",
        "synsetId": "20000000-0000-4000-8000-000000002201",
        "commonnessScore": 0.42,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000501",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "**rip someone a new one**은 누군가를 심하게 꾸짖는다는 뜻의 매우 거친 미국식 구어 표현입니다. 단순히 지적하는 수준이 아니라 상대를 말로 갈기갈기 찢는 듯한 공격성이 느껴집니다. 친한 사이에서 과장된 이야기로 들을 수는 있지만, 일반적인 업무 대화에서 직접 쓰기에는 위험합니다.\n\n업무에서는 **give someone a stern warning**이나 **reprimand someone**이 훨씬 안전합니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000501",
            "sourceLanguageTag": "en",
            "sourceText": "My boss ripped me a new one for missing the deadline.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000501",
                "languageTag": "ko",
                "text": "상사는 마감일을 놓친 나를 아주 심하게 질책했다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000006",
    "headword": "go the extra mile",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000601",
        "synsetId": "20000000-0000-4000-8000-000000000601",
        "commonnessScore": 0.84,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000601",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "해야 할 만큼만 가고 멈추지 않고 **한 마일을 더 간다**고 상상해보세요. **go the extra mile**은 요청받은 기준을 겨우 채우는 것이 아니라, 상대를 돕거나 결과를 더 좋게 만들기 위해 기대 이상의 노력을 보태는 말입니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000601",
            "sourceLanguageTag": "en",
            "sourceText": "She went the extra mile to help the new hire settle in.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000601",
                "languageTag": "ko",
                "text": "그녀는 신입 사원이 적응하도록 기대 이상으로 도왔다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000007",
    "headword": "I'm down",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000701",
        "synsetId": "20000000-0000-4000-8000-000000000701",
        "commonnessScore": 0.88,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000701",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "친구가 계획을 제안했을 때 **I'm down**이라고 하면 ‘아래에 있다’가 아니라 **나도 할래, 좋아**라는 뜻입니다. 활동을 말할 때는 **I'm down for [명사]**, 행동을 말할 때는 **I'm down to [동사]**가 자연스럽습니다. 친근한 구어 표현이므로 공식적인 이메일에서는 **I'd be happy to**가 더 안전합니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000701",
            "sourceLanguageTag": "en",
            "sourceText": "We're getting tacos after work. Are you down?",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000701",
                "languageTag": "ko",
                "text": "우리 퇴근하고 타코 먹으러 갈 건데, 너도 갈래?"
              }
            ]
          },
          {
            "id": "30000000-0000-4000-8000-000000000702",
            "sourceLanguageTag": "en",
            "sourceText": "I'm down to try the new place.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000702",
                "languageTag": "ko",
                "text": "그 새 가게 한번 가보는 거 좋아."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000008",
    "headword": "in broad daylight",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000801",
        "synsetId": "20000000-0000-4000-8000-000000000801",
        "commonnessScore": 0.76,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000801",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "**in broad daylight**는 단순히 ‘낮에’라는 시간 정보만 주지 않습니다. 모두가 볼 수 있을 만큼 환한데도 일이 벌어졌다는 놀라움과 뻔뻔함을 강조합니다. 그래서 범죄나 믿기 힘든 행동을 말할 때 특히 자주 쓰입니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000801",
            "sourceLanguageTag": "en",
            "sourceText": "The bike was stolen in broad daylight.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000801",
                "languageTag": "ko",
                "text": "그 자전거는 사람들이 다 보는 대낮에 도난당했다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000009",
    "headword": "dead end",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000000901",
        "synsetId": "20000000-0000-4000-8000-000000000901",
        "commonnessScore": 0.82
      },
      {
        "id": "10000000-0000-4000-8000-000000000902",
        "synsetId": "20000000-0000-4000-8000-000000000902",
        "commonnessScore": 0.91,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000000902",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "길을 따라가다 더 이상 나아갈 곳이 없는 **막다른 길**을 떠올려보세요. 그 물리적인 장면이 조사·협상·경력처럼 더 진행할 방법이 없는 상황으로 확장된 것이 **dead end**입니다.\n\n진행하다 막혔다면 **reach/hit a dead end**, 발전 가능성이 없는 직업이라면 **a dead-end job**이라고 합니다."
          },
          {
            "id": "22000000-0000-4000-8000-000000000902",
            "kind": "ORIGIN",
            "languageTag": "ko",
            "markdown": "출구가 없는 실제 도로를 가리키는 표현에서, 가능성이나 진전이 없는 추상적인 상황으로 의미가 확장됐습니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000000902",
            "sourceLanguageTag": "en",
            "sourceText": "The investigation hit a dead end.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000000902",
                "languageTag": "ko",
                "text": "수사는 더 진행할 방법이 없는 막다른 지점에 이르렀다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000010",
    "headword": "circle back",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001001",
        "synsetId": "20000000-0000-4000-8000-000000001001",
        "commonnessScore": 0.8,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000001001",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "원을 그리며 돌다가 원래 지점으로 돌아오는 모습을 떠올리면 쉽습니다. **circle back to [주제]**는 지금 결론내리지 않고 나중에 그 주제로 돌아오는 말이고, **circle back with [사람]**은 그 사람에게 다시 연락하거나 확인하겠다는 뜻입니다.\n\n업무에서 흔하지만 반복하면 상투적인 기업 표현처럼 들릴 수 있습니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000001001",
            "sourceLanguageTag": "en",
            "sourceText": "Let's circle back to pricing after we review the proposal.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000001001",
                "languageTag": "ko",
                "text": "제안서를 검토한 뒤 가격 문제를 다시 논의하죠."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000011",
    "headword": "Would you mind if …?",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001101",
        "synsetId": "20000000-0000-4000-8000-000000001101",
        "commonnessScore": 0.9,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000001101",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "**Would you mind if …?**는 상대가 불편할지를 먼저 묻는 방식으로 허락을 구합니다. 그래서 **Can I …?**보다 한층 조심스럽고 정중하게 들립니다. 전통적으로는 **Would you mind if I opened the window?**처럼 if절에 과거형을 쓰지만, 일상 대화에서는 현재형도 들을 수 있습니다.\n\n대답할 때는 질문의 방향에 주의하세요. **No, not at all**은 ‘괜찮아요’라는 허락이고, **Yes**는 ‘불편해요’에 가깝습니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000001101",
            "sourceLanguageTag": "en",
            "sourceText": "Would you mind if I opened the window?",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000001101",
                "languageTag": "ko",
                "text": "제가 창문을 열어도 괜찮을까요?"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000012",
    "headword": "Actions speak louder than words",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001201",
        "synsetId": "20000000-0000-4000-8000-000000001201",
        "commonnessScore": 0.79,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000001201",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "말은 얼마든지 할 수 있지만, 실제 행동에는 시간과 비용이 듭니다. **Actions speak louder than words**는 약속이나 설명보다 무엇을 실제로 했는지가 의도와 진심을 더 분명하게 보여준다는 말입니다. 누군가의 말을 믿지 않겠다는 공격이라기보다, 이제는 결과를 보겠다는 태도를 강조할 때 씁니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000001201",
            "sourceLanguageTag": "en",
            "sourceText": "He keeps promising to help, but actions speak louder than words.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000001201",
                "languageTag": "ko",
                "text": "그는 계속 돕겠다고 약속하지만, 말보다 행동이 중요하다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000013",
    "headword": "pros and cons",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001301",
        "synsetId": "20000000-0000-4000-8000-000000001301",
        "commonnessScore": 0.88,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000001301",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "**pros and cons**는 선택의 좋은 점과 나쁜 점을 한 쌍으로 묶은 표현입니다. 결정을 내리기 전에 양쪽을 저울질한다는 느낌으로 **weigh the pros and cons of [선택지]**라고 자주 씁니다. 두 단어의 순서가 굳어져 있으므로 보통 **cons and pros**라고 뒤집지 않습니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000001301",
            "sourceLanguageTag": "en",
            "sourceText": "Let's weigh the pros and cons before we commit.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000001301",
                "languageTag": "ko",
                "text": "결정하기 전에 장단점을 따져보자."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000014",
    "headword": "that said",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001401",
        "synsetId": "20000000-0000-4000-8000-000000001401",
        "commonnessScore": 0.86,
        "narratives": [
          {
            "id": "20000000-0000-4000-8000-000000001401",
            "kind": "STORY",
            "languageTag": "ko",
            "markdown": "앞에서 한 말을 지우지 않고 그대로 인정한 채, 시선을 반대쪽으로 돌릴 때 **that said**를 씁니다. **[앞의 판단]. That said, [예외·제약].**의 흐름입니다.\n\n**however**가 논리적인 대조를 넓게 연결한다면, **that said**는 ‘방금 그렇게 말하긴 했지만’이라는 대화적인 연결감이 더 강합니다."
          }
        ],
        "examples": [
          {
            "id": "30000000-0000-4000-8000-000000001401",
            "sourceLanguageTag": "en",
            "sourceText": "The plan is risky. That said, it could pay off.",
            "translations": [
              {
                "id": "31000000-0000-4000-8000-000000001401",
                "languageTag": "ko",
                "text": "그 계획은 위험하다. 그렇기는 하지만, 큰 성과를 낼 수도 있다."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000015",
    "headword": "stable",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001501",
        "synsetId": "20000000-0000-4000-8000-000000001501",
        "commonnessScore": 0.96
      },
      {
        "id": "10000000-0000-4000-8000-000000001502",
        "synsetId": "20000000-0000-4000-8000-000000001502",
        "commonnessScore": 0.55
      },
      {
        "id": "30000000-0000-4000-8000-000000000001",
        "synsetId": "40000000-0000-4000-8000-000000000001",
        "commonnessScore": 0.62
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000016",
    "headword": "stability",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001601",
        "synsetId": "20000000-0000-4000-8000-000000001601",
        "commonnessScore": 0.88
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000017",
    "headword": "stabilize",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001701",
        "synsetId": "20000000-0000-4000-8000-000000001701",
        "commonnessScore": 0.84
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000018",
    "headword": "converse",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001801",
        "synsetId": "20000000-0000-4000-8000-000000001801",
        "commonnessScore": 0.48
      },
      {
        "id": "10000000-0000-4000-8000-000000001802",
        "synsetId": "20000000-0000-4000-8000-000000001802",
        "commonnessScore": 0.04
      },
      {
        "id": "10000000-0000-4000-8000-000000001803",
        "synsetId": "20000000-0000-4000-8000-000000001803",
        "commonnessScore": 0.36
      },
      {
        "id": "10000000-0000-4000-8000-000000001804",
        "synsetId": "20000000-0000-4000-8000-000000001804",
        "commonnessScore": 0.3
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000019",
    "headword": "conversation",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000001901",
        "synsetId": "20000000-0000-4000-8000-000000001901",
        "commonnessScore": 0.98
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000020",
    "headword": "conversely",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000002001",
        "synsetId": "20000000-0000-4000-8000-000000002001",
        "commonnessScore": 0.58
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000021",
    "headword": "point out a mistake",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000002101",
        "synsetId": "20000000-0000-4000-8000-000000002101",
        "commonnessScore": 0.82,
        "examples": [
          {
            "id": "70000000-0000-4000-8000-000000002101",
            "sourceLanguageTag": "en",
            "sourceText": "She politely pointed out a mistake in the report.",
            "translations": [
              {
                "id": "71000000-0000-4000-8000-000000002101",
                "languageTag": "ko",
                "text": "그녀는 보고서의 실수를 정중하게 지적했다."
              }
            ]
          }
        ],
        "forms": [
          {
            "id": "41000000-0000-4000-8000-000000002101",
            "surface": "pointed out a mistake",
            "kind": "PAST"
          },
          {
            "id": "42000000-0000-4000-8000-000000002101",
            "surface": "pointed out a mistake",
            "kind": "PAST_PARTICIPLE"
          },
          {
            "id": "43000000-0000-4000-8000-000000002101",
            "surface": "pointing out a mistake",
            "kind": "PRESENT_PARTICIPLE"
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000022",
    "headword": "tell someone off",
    "languageTag": "en",
    "kind": "EXPRESSION",
    "senses": [
      {
        "id": "10000000-0000-4000-8000-000000002201",
        "synsetId": "20000000-0000-4000-8000-000000002201",
        "commonnessScore": 0.71,
        "examples": [
          {
            "id": "70000000-0000-4000-8000-000000002201",
            "sourceLanguageTag": "en",
            "sourceText": "The manager told him off for ignoring the safety rule.",
            "translations": [
              {
                "id": "71000000-0000-4000-8000-000000002201",
                "languageTag": "ko",
                "text": "관리자는 안전 규칙을 무시한 그를 꾸짖었다."
              }
            ]
          }
        ],
        "forms": [
          {
            "id": "41000000-0000-4000-8000-000000002201",
            "surface": "told someone off",
            "kind": "PAST"
          },
          {
            "id": "42000000-0000-4000-8000-000000002201",
            "surface": "told someone off",
            "kind": "PAST_PARTICIPLE"
          },
          {
            "id": "43000000-0000-4000-8000-000000002201",
            "surface": "telling someone off",
            "kind": "PRESENT_PARTICIPLE"
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000023",
    "headword": "steady",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000002",
        "synsetId": "40000000-0000-4000-8000-000000000001",
        "commonnessScore": 0.88
      },
      {
        "id": "30000000-0000-4000-8000-000000000003",
        "synsetId": "40000000-0000-4000-8000-000000000008",
        "commonnessScore": 0.86
      },
      {
        "id": "30000000-0000-4000-8000-000000000004",
        "synsetId": "40000000-0000-4000-8000-000000000009",
        "commonnessScore": 0.65
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000024",
    "headword": "unstable",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000005",
        "synsetId": "40000000-0000-4000-8000-000000000010",
        "commonnessScore": 0.82
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000025",
    "headword": "instability",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000006",
        "synsetId": "40000000-0000-4000-8000-000000000011",
        "commonnessScore": 0.72
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000026",
    "headword": "destabilize",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000007",
        "synsetId": "40000000-0000-4000-8000-000000000012",
        "commonnessScore": 0.62
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000027",
    "headword": "chat",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000008",
        "synsetId": "20000000-0000-4000-8000-000000001801",
        "commonnessScore": 0.9
      },
      {
        "id": "30000000-0000-4000-8000-000000000009",
        "synsetId": "20000000-0000-4000-8000-000000001901",
        "commonnessScore": 0.86
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000028",
    "headword": "talk",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000010",
        "synsetId": "20000000-0000-4000-8000-000000001801",
        "commonnessScore": 0.96
      },
      {
        "id": "30000000-0000-4000-8000-000000000011",
        "synsetId": "20000000-0000-4000-8000-000000001901",
        "commonnessScore": 0.9
      },
      {
        "id": "30000000-0000-4000-8000-000000000012",
        "synsetId": "40000000-0000-4000-8000-000000000007",
        "commonnessScore": 0.78
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000029",
    "headword": "communication",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000013",
        "synsetId": "40000000-0000-4000-8000-000000000013",
        "commonnessScore": 0.92
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000030",
    "headword": "discussion",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000014",
        "synsetId": "40000000-0000-4000-8000-000000000007",
        "commonnessScore": 0.9
      },
      {
        "id": "30000000-0000-4000-8000-000000000015",
        "synsetId": "40000000-0000-4000-8000-000000000014",
        "commonnessScore": 0.84
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000031",
    "headword": "reprimand",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000016",
        "synsetId": "20000000-0000-4000-8000-000000002201",
        "commonnessScore": 0.72
      },
      {
        "id": "30000000-0000-4000-8000-000000000017",
        "synsetId": "40000000-0000-4000-8000-000000000015",
        "commonnessScore": 0.64
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000032",
    "headword": "scold",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000018",
        "synsetId": "20000000-0000-4000-8000-000000002201",
        "commonnessScore": 0.8
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000033",
    "headword": "praise",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000019",
        "synsetId": "40000000-0000-4000-8000-000000000016",
        "commonnessScore": 0.86
      },
      {
        "id": "30000000-0000-4000-8000-000000000020",
        "synsetId": "40000000-0000-4000-8000-000000000017",
        "commonnessScore": 0.8
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000034",
    "headword": "mistake",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000021",
        "synsetId": "40000000-0000-4000-8000-000000000003",
        "commonnessScore": 0.94
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000035",
    "headword": "error",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000022",
        "synsetId": "40000000-0000-4000-8000-000000000003",
        "commonnessScore": 0.94
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000036",
    "headword": "vehicle",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000023",
        "synsetId": "40000000-0000-4000-8000-000000000018",
        "commonnessScore": 0.9
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000037",
    "headword": "car",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000024",
        "synsetId": "40000000-0000-4000-8000-000000000002",
        "commonnessScore": 0.97
      },
      {
        "id": "30000000-0000-4000-8000-000000000025",
        "synsetId": "40000000-0000-4000-8000-000000000019",
        "commonnessScore": 0.55
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000038",
    "headword": "automobile",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000026",
        "synsetId": "40000000-0000-4000-8000-000000000002",
        "commonnessScore": 0.8
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000039",
    "headword": "bicycle",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000027",
        "synsetId": "40000000-0000-4000-8000-000000000020",
        "commonnessScore": 0.9
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000040",
    "headword": "truck",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000028",
        "synsetId": "40000000-0000-4000-8000-000000000021",
        "commonnessScore": 0.92
      },
      {
        "id": "30000000-0000-4000-8000-000000000029",
        "synsetId": "40000000-0000-4000-8000-000000000022",
        "commonnessScore": 0.58
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000041",
    "headword": "stop",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000030",
        "synsetId": "40000000-0000-4000-8000-000000000004",
        "commonnessScore": 0.98
      },
      {
        "id": "30000000-0000-4000-8000-000000000031",
        "synsetId": "40000000-0000-4000-8000-000000000005",
        "commonnessScore": 0.92
      },
      {
        "id": "30000000-0000-4000-8000-000000000032",
        "synsetId": "40000000-0000-4000-8000-000000000023",
        "commonnessScore": 0.9
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000042",
    "headword": "cease",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000033",
        "synsetId": "40000000-0000-4000-8000-000000000004",
        "commonnessScore": 0.72
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000043",
    "headword": "halt",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000034",
        "synsetId": "40000000-0000-4000-8000-000000000004",
        "commonnessScore": 0.78
      },
      {
        "id": "30000000-0000-4000-8000-000000000035",
        "synsetId": "40000000-0000-4000-8000-000000000005",
        "commonnessScore": 0.72
      },
      {
        "id": "30000000-0000-4000-8000-000000000036",
        "synsetId": "20000000-0000-4000-8000-000000000201",
        "commonnessScore": 0.7
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000044",
    "headword": "advantage",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000037",
        "synsetId": "40000000-0000-4000-8000-000000000024",
        "commonnessScore": 0.9
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000045",
    "headword": "benefit",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000038",
        "synsetId": "40000000-0000-4000-8000-000000000025",
        "commonnessScore": 0.92
      },
      {
        "id": "30000000-0000-4000-8000-000000000039",
        "synsetId": "40000000-0000-4000-8000-000000000026",
        "commonnessScore": 0.88
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000046",
    "headword": "disadvantage",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000040",
        "synsetId": "40000000-0000-4000-8000-000000000006",
        "commonnessScore": 0.88
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000047",
    "headword": "drawback",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000041",
        "synsetId": "40000000-0000-4000-8000-000000000006",
        "commonnessScore": 0.82
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000048",
    "headword": "affect",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000042",
        "synsetId": "40000000-0000-4000-8000-000000000027",
        "commonnessScore": 0.94
      },
      {
        "id": "30000000-0000-4000-8000-000000000043",
        "synsetId": "40000000-0000-4000-8000-000000000028",
        "commonnessScore": 0.35
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000049",
    "headword": "effect",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000044",
        "synsetId": "40000000-0000-4000-8000-000000000029",
        "commonnessScore": 0.96
      },
      {
        "id": "30000000-0000-4000-8000-000000000045",
        "synsetId": "40000000-0000-4000-8000-000000000030",
        "commonnessScore": 0.52
      }
    ]
  },
  {
    "id": "00000000-0000-4000-8000-000000000050",
    "headword": "effective",
    "languageTag": "en",
    "kind": "WORD",
    "senses": [
      {
        "id": "30000000-0000-4000-8000-000000000046",
        "synsetId": "40000000-0000-4000-8000-000000000031",
        "commonnessScore": 0.9
      }
    ]
  }
];

export const dictionarySeedSenseRelations: readonly DictionarySeedSenseRelation[] = [
  {
    "sourceSenseId": "10000000-0000-4000-8000-000000001601",
    "targetSenseId": "10000000-0000-4000-8000-000000001501",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "10000000-0000-4000-8000-000000001701",
    "targetSenseId": "10000000-0000-4000-8000-000000001501",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "10000000-0000-4000-8000-000000002001",
    "targetSenseId": "10000000-0000-4000-8000-000000001804",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "10000000-0000-4000-8000-000000001801",
    "targetSenseId": "10000000-0000-4000-8000-000000001804",
    "kind": "CONFUSABLE"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000005",
    "targetSenseId": "10000000-0000-4000-8000-000000001501",
    "kind": "ANTONYM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000006",
    "targetSenseId": "10000000-0000-4000-8000-000000001601",
    "kind": "ANTONYM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000007",
    "targetSenseId": "10000000-0000-4000-8000-000000001701",
    "kind": "ANTONYM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000019",
    "targetSenseId": "30000000-0000-4000-8000-000000000016",
    "kind": "ANTONYM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000037",
    "targetSenseId": "30000000-0000-4000-8000-000000000040",
    "kind": "ANTONYM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000038",
    "targetSenseId": "30000000-0000-4000-8000-000000000041",
    "kind": "ANTONYM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000005",
    "targetSenseId": "10000000-0000-4000-8000-000000001501",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000006",
    "targetSenseId": "30000000-0000-4000-8000-000000000005",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000007",
    "targetSenseId": "10000000-0000-4000-8000-000000001501",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000046",
    "targetSenseId": "30000000-0000-4000-8000-000000000044",
    "kind": "DERIVED_FROM"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000042",
    "targetSenseId": "30000000-0000-4000-8000-000000000044",
    "kind": "CONFUSABLE"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000043",
    "targetSenseId": "30000000-0000-4000-8000-000000000044",
    "kind": "CONFUSABLE"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000045",
    "targetSenseId": "30000000-0000-4000-8000-000000000042",
    "kind": "CONFUSABLE"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000046",
    "targetSenseId": "30000000-0000-4000-8000-000000000044",
    "kind": "CONFUSABLE"
  },
  {
    "sourceSenseId": "30000000-0000-4000-8000-000000000003",
    "targetSenseId": "10000000-0000-4000-8000-000000001501",
    "kind": "CONFUSABLE"
  }
];

export const dictionarySeedSynsetRelations: readonly DictionarySeedSynsetRelation[] = [
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000000201",
    "targetSynsetId": "20000000-0000-4000-8000-000000000104",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000001901",
    "targetSynsetId": "20000000-0000-4000-8000-000000001801",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000002",
    "targetSynsetId": "40000000-0000-4000-8000-000000000018",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000019",
    "targetSynsetId": "40000000-0000-4000-8000-000000000018",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000020",
    "targetSynsetId": "40000000-0000-4000-8000-000000000018",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000021",
    "targetSynsetId": "40000000-0000-4000-8000-000000000018",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000022",
    "targetSynsetId": "40000000-0000-4000-8000-000000000018",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000001901",
    "targetSynsetId": "40000000-0000-4000-8000-000000000013",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000007",
    "targetSynsetId": "40000000-0000-4000-8000-000000000013",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000014",
    "targetSynsetId": "40000000-0000-4000-8000-000000000013",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000017",
    "targetSynsetId": "40000000-0000-4000-8000-000000000013",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000015",
    "targetSynsetId": "40000000-0000-4000-8000-000000000013",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000025",
    "targetSynsetId": "40000000-0000-4000-8000-000000000029",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000000201",
    "targetSynsetId": "40000000-0000-4000-8000-000000000004",
    "kind": "HYPERNYM"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000001501",
    "targetSynsetId": "20000000-0000-4000-8000-000000001601",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000001901",
    "targetSynsetId": "20000000-0000-4000-8000-000000001001",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000003",
    "targetSynsetId": "20000000-0000-4000-8000-000000002101",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000002201",
    "targetSynsetId": "40000000-0000-4000-8000-000000000016",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000024",
    "targetSynsetId": "20000000-0000-4000-8000-000000001301",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000006",
    "targetSynsetId": "20000000-0000-4000-8000-000000001301",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000027",
    "targetSynsetId": "40000000-0000-4000-8000-000000000029",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000000201",
    "targetSynsetId": "20000000-0000-4000-8000-000000000902",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000007",
    "targetSynsetId": "20000000-0000-4000-8000-000000001001",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000025",
    "targetSynsetId": "20000000-0000-4000-8000-000000000601",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000027",
    "targetSynsetId": "20000000-0000-4000-8000-000000000401",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000013",
    "targetSynsetId": "20000000-0000-4000-8000-000000001201",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000007",
    "targetSynsetId": "20000000-0000-4000-8000-000000001401",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000001901",
    "targetSynsetId": "20000000-0000-4000-8000-000000001101",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "20000000-0000-4000-8000-000000001901",
    "targetSynsetId": "20000000-0000-4000-8000-000000000701",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000008",
    "targetSynsetId": "20000000-0000-4000-8000-000000000102",
    "kind": "RELATED"
  },
  {
    "sourceSynsetId": "40000000-0000-4000-8000-000000000024",
    "targetSynsetId": "40000000-0000-4000-8000-000000000025",
    "kind": "RELATED"
  }
];
