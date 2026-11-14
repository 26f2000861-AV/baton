-- ============================================================================
-- Baton PostgreSQL Row Level Security (RLS) Policies — Remediation for SEC-07
-- Provider: PostgreSQL (Neon production)
-- ============================================================================
-- Apply this script directly in the Neon SQL Console to enforce storage-level
-- tenant isolation as defense-in-depth behind application guards.

-- 1. Enable Row Level Security on all tenant-specific tables
ALTER TABLE "Handover" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Claim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SourceRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArchitecturalDecision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UnfinishedWorkItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OwnershipAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contradiction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaverInterviewQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SuccessorQuery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SectionState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkUpdate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportJob" ENABLE ROW LEVEL SECURITY;

-- 2. Handover access policy
-- Accessible if the user is a registered member or if it is a public template.
CREATE POLICY "handover_tenant_isolation" ON "Handover"
FOR ALL
USING (
  "isTemplate" = true OR
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "Handover"."id"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  )
);

-- 3. Membership access policy
-- Users can see memberships for handovers they participate in.
CREATE POLICY "membership_tenant_isolation" ON "Membership"
FOR ALL
USING (
  "userId" = NULLIF(current_setting('app.current_user_id', true), '') OR
  EXISTS (
    SELECT 1 FROM "Membership" AS m
    WHERE m."handoverId" = "Membership"."handoverId"
    AND m."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  )
);

-- 4. Reusable macro helper pattern for child tables
-- Child tables must belong to a handover the user belongs to (or template)

CREATE POLICY "claim_tenant_isolation" ON "Claim"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "Claim"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  ) OR
  EXISTS (
    SELECT 1 FROM "Handover"
    WHERE "Handover"."id" = "Claim"."handoverId" AND "Handover"."isTemplate" = true
  )
);

CREATE POLICY "sourcerecord_tenant_isolation" ON "SourceRecord"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "SourceRecord"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  ) OR
  EXISTS (
    SELECT 1 FROM "Handover"
    WHERE "Handover"."id" = "SourceRecord"."handoverId" AND "Handover"."isTemplate" = true
  )
);

CREATE POLICY "decision_tenant_isolation" ON "ArchitecturalDecision"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "ArchitecturalDecision"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  ) OR
  EXISTS (
    SELECT 1 FROM "Handover"
    WHERE "Handover"."id" = "ArchitecturalDecision"."handoverId" AND "Handover"."isTemplate" = true
  )
);

CREATE POLICY "unfinished_tenant_isolation" ON "UnfinishedWorkItem"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "UnfinishedWorkItem"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  ) OR
  EXISTS (
    SELECT 1 FROM "Handover"
    WHERE "Handover"."id" = "UnfinishedWorkItem"."handoverId" AND "Handover"."isTemplate" = true
  )
);

CREATE POLICY "ownership_tenant_isolation" ON "OwnershipAsset"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "OwnershipAsset"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  ) OR
  EXISTS (
    SELECT 1 FROM "Handover"
    WHERE "Handover"."id" = "OwnershipAsset"."handoverId" AND "Handover"."isTemplate" = true
  )
);

CREATE POLICY "contradiction_tenant_isolation" ON "Contradiction"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "Contradiction"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  ) OR
  EXISTS (
    SELECT 1 FROM "Handover"
    WHERE "Handover"."id" = "Contradiction"."handoverId" AND "Handover"."isTemplate" = true
  )
);

CREATE POLICY "workupdate_tenant_isolation" ON "WorkUpdate"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "WorkUpdate"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  )
);

CREATE POLICY "importjob_tenant_isolation" ON "ImportJob"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "Membership"."handoverId" = "ImportJob"."handoverId"
    AND "Membership"."userId" = NULLIF(current_setting('app.current_user_id', true), '')
  )
);
