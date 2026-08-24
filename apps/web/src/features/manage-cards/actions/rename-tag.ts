import { renameTag } from "@/entities/card";

export async function renameLibraryTag(
  currentTag: string,
  nextTag: string,
): Promise<void> {
  await renameTag(currentTag, nextTag);
}
