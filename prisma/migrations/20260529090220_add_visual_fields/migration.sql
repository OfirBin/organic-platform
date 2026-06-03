-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "answer" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "sourceExam" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "distractors" TEXT,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "visualDescription" TEXT,
    "smiles" TEXT
);
INSERT INTO "new_Question" ("answer", "createdAt", "distractors", "id", "imageUrl", "sourceExam", "text", "topic", "updatedAt") SELECT "answer", "createdAt", "distractors", "id", "imageUrl", "sourceExam", "text", "topic", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
