-- Migration: Transform supervisors/fellows/sessions schema to users/fellows/meetings with NextAuth support

-- Step 1: Rename sessions table to meetings and update constraint names
ALTER TABLE "sessions" RENAME TO "meetings";
ALTER INDEX "sessions_pkey" RENAME TO "meetings_pkey";

-- Step 2: Rename session_analyses table to meeting_analyses
ALTER TABLE "session_analyses" RENAME TO "meeting_analyses";
ALTER INDEX "session_analyses_pkey" RENAME TO "meeting_analyses_pkey";

-- Step 3: Rename foreign key column in meeting_analyses
ALTER TABLE "meeting_analyses" RENAME COLUMN "sessionId" TO "meetingId";

-- Step 4: Drop and recreate foreign key constraint with new name
ALTER TABLE "meeting_analyses" DROP CONSTRAINT "session_analyses_sessionId_fkey";
ALTER TABLE "meeting_analyses" ADD CONSTRAINT "meeting_analyses_meetingId_fkey" 
    FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Rename supervisors table to users and update constraints
ALTER TABLE "supervisors" RENAME TO "users";
ALTER INDEX "supervisors_pkey" RENAME TO "users_pkey";
ALTER INDEX "supervisors_email_key" RENAME TO "users_email_key";

-- Step 6: Update foreign key constraints referencing supervisors
ALTER TABLE "fellows" DROP CONSTRAINT "fellows_supervisorId_fkey";
ALTER TABLE "fellows" ADD CONSTRAINT "fellows_supervisorId_fkey" 
    FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meetings" DROP CONSTRAINT "sessions_supervisorId_fkey";
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_supervisorId_fkey" 
    FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meetings" DROP CONSTRAINT "sessions_fellowId_fkey";
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_fellowId_fkey" 
    FOREIGN KEY ("fellowId") REFERENCES "fellows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Add new columns to users table
ALTER TABLE "users" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'supervisor';
ALTER TABLE "users" ADD COLUMN "image" TEXT;
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);
-- ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

-- Step 8: Add deletedAt to all existing tables
ALTER TABLE "fellows" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "meetings" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "meeting_analyses" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Step 9: Create new NextAuth tables
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider", "providerAccountId")
);

CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("sessionToken")
);

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier", "token")
);

CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID")
);

-- Step 10: Create indexes
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- Step 11: Add foreign keys for new tables
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
