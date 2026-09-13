export interface User {
  id: string;
  nativeLanguageTag: string | null;
  onboardingCompletedAt: Date | null;
  timeZone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
