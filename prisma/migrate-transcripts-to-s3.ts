import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { uploadToS3 } from '../src/lib/s3';

async function migrateTranscriptsToS3() {
  console.log('Starting transcript migration to S3...');

  const meetings = await prisma.meeting.findMany({
    where: {
      transcript: {
        not: ''
      },
      NOT: {
        transcript: null
      }
    },
    select: {
      id: true,
      transcript: true
    }
  });

  console.log(`Found ${meetings.length} meetings with transcripts to migrate`);

  let migrated = 0;
  let failed = 0;

  for (const meeting of meetings) {
    if (!meeting.transcript) continue;

    try {
      const key = `transcripts/${meeting.id}/transcript.txt`;
      const buffer = Buffer.from(meeting.transcript, 'utf-8');

      const result = await uploadToS3(buffer, key, 'text/plain');

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { transcript: result.url }
      });

      migrated++;
      console.log(`Migrated meeting ${meeting.id}`);
    } catch (error) {
      failed++;
      console.error(`Failed to migrate meeting ${meeting.id}:`, error);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`- Migrated: ${migrated}`);
  console.log(`- Failed: ${failed}`);
}

migrateTranscriptsToS3()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
