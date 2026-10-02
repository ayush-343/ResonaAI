-- Additive change: preserve legacy records and enum storage values.
ALTER TABLE "Generation"
  ALTER COLUMN "temperature" DROP NOT NULL,
  ALTER COLUMN "topP" DROP NOT NULL,
  ALTER COLUMN "topK" DROP NOT NULL,
  ALTER COLUMN "repetitionPenalty" DROP NOT NULL,
  ADD COLUMN "modelId" TEXT,
  ADD COLUMN "modelRevision" TEXT,
  ADD COLUMN "engineVersion" TEXT,
  ADD COLUMN "languageMode" TEXT,
  ADD COLUMN "settings" JSONB,
  ADD COLUMN "audioDuration" DOUBLE PRECISION,
  ADD COLUMN "sampleRate" INTEGER,
  ADD COLUMN "elapsedMs" DOUBLE PRECISION,
  ADD COLUMN "firstAudioMs" DOUBLE PRECISION,
  ADD COLUMN "payloadDigest" TEXT;

CREATE INDEX "Generation_orgId_createdAt_idx" ON "Generation"("orgId", "createdAt");
