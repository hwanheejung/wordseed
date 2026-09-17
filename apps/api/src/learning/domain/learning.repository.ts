export interface SavedLearningItemRecord {
  id: string;
  userId: string;
  senseId: string;
  lexemeId: string;
  addedAt: Date;
}

export interface SavedLearningItemPosition {
  id: string;
  addedAt: Date;
}

export interface ListSavedLearningItemsCriteria {
  userId: string;
  first: number;
  after: SavedLearningItemPosition | null;
}

export interface SavedLearningItemsResult {
  items: readonly SavedLearningItemRecord[];
  totalCount: number;
  hasNextPage: boolean;
}

export abstract class LearningRepository {
  abstract save(userId: string, senseId: string): Promise<SavedLearningItemRecord | null>;
  abstract list(criteria: ListSavedLearningItemsCriteria): Promise<SavedLearningItemsResult>;
}
