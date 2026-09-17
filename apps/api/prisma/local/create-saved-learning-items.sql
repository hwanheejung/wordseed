-- Extracted from prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script.
-- Local development only; apply once when saved_learning_items is absent.
BEGIN;

-- CreateTable
CREATE TABLE "saved_learning_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sense_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_learning_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_learning_items_user_id_added_at_id_idx" ON "saved_learning_items"("user_id", "added_at" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "saved_learning_items_user_id_sense_id_key" ON "saved_learning_items"("user_id", "sense_id");

-- AddForeignKey
ALTER TABLE "saved_learning_items" ADD CONSTRAINT "saved_learning_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_learning_items" ADD CONSTRAINT "saved_learning_items_sense_id_fkey" FOREIGN KEY ("sense_id") REFERENCES "dictionary_senses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
