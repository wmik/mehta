import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyzeSession } from '@/lib/ai-service';

// Sample therapy session transcripts (simplified to avoid syntax issues)
const SAMPLE_TRANSCRIPTS = [
  {
    groupId: 'GRP-001',
    transcript: `Fellow: Good morning everyone! Welcome to our session on Growth Mindset. Today we are going to talk about how our abilities can grow stronger with practice, just like muscles.

Student 1: What does that mean exactly?

Fellow: Great question! Growth Mindset is belief that our intelligence and talents are not fixed - they can be developed through dedication and hard work. Think of your brain like a muscle that gets stronger with exercise.

Student 2: But I am just not good at math. Some people are naturally smart.

Fellow: I understand why you might feel that way, but research shows that when we believe we can improve, we actually do better. The brain grows new connections when we learn challenging things. It is not about being naturally smart - it is about effort you put in.

Student 3: Can you give us an example?

Fellow: Absolutely. Think about learning to ride a bike. At first, you might fall many times, but with practice, you get better. Your brain forms new pathways. The same happens with learning new subjects. Each time you struggle with a math problem and keep trying, you are literally building your brain.

Student 1: What happens when we fail? Is not that bad?

Fellow: Failure is actually a crucial part of learning! When we make mistakes, our brain works harder to figure out what went wrong. That is when real growth happens. Instead of thinking I failed, try thinking I learned what does not work.

Student 2: So how can we develop a Growth Mindset?

Fellow: Great question! Here are some strategies: First, pay attention to your self-talk. Replace I can not do this with I can not do this YET. Second, seek challenges instead of avoiding them. Third, learn from criticism instead of getting defensive. And fourth, celebrate effort, not just results.

Student 3: Does this work for everything?

Fellow: Growth Mindset applies to all areas of life - academics, sports, relationships, careers. Remember, most successful people are not necessarily most talented initially, but they are usually most persistent.

Student 1: What if I keep trying and still do not improve?

Fellow: That is a valid concern. Sometimes we need to try different approaches or strategies. Growth Mindset is not just about trying harder - it is about trying smarter. Do not be afraid to ask for help or try new methods.

Student 2: I used to give up easily when things got hard.

Fellow: That is very honest! The good news is that you can start changing that pattern today. What is one area where you would like to apply Growth Mindset thinking?

Student 3: I want to get better at public speaking.

Fellow: That is a great goal! What is one small step you could take this week to work on it?

Student 3: Maybe I could volunteer to answer questions in class more often.

Fellow: Perfect! That is exactly how Growth Mindset works in practice.

Student 1: I will try to stop saying I am bad at math and instead say I am still learning math.

Fellow: Excellent! That shift in language can really change how you approach challenges.

Student 2: I will ask my teacher for help when I do not understand instead of giving up.

Fellow: Wonderful! Remember, asking for help shows strength, not weakness. It shows you are committed to growing.

Thank you all for sharing today. I am really impressed with your insights. Remember, your brain is like a muscle - more you use it and challenge it, stronger it becomes. Keep practicing these strategies, and I promise you will see amazing results in all areas of your life!`
  },
  {
    groupId: 'GRP-002',
    transcript: `Fellow: Hello everyone! Today we are continuing our discussion about Growth Mindset. Last week we talked about what Growth Mindset means. Today, let us dive deeper into how we can apply it in our daily lives.

Student 1: I have been thinking about what you said last week about brain being like a muscle.

Fellow: I am glad to hear that! What thoughts came up for you?

Student 1: I realized I have been saying I am not a creative person for years. Maybe I can change that.

Fellow: That is a huge insight! Creativity is not something you are born with or without. It is a skill that develops with practice. What kind of creative activities interest you?

Student 1: Maybe drawing or writing stories.

Fellow: That is wonderful! The key is to start small and practice regularly, not worry about being perfect at first.

Student 2: I tried I can not do this yet strategy this week in math class.

Fellow: How did that feel?

Student 2: Different! I did not give up as quickly when I got stuck on a problem. I kept trying different approaches.

Fellow: That is exactly what Growth Mindset is about - persistence and strategy. How did it turn out?

Student 2: I actually solved the problem! It took me longer than usual, but I did it.

Fellow: That is fantastic! You experienced firsthand how effort and strategy can lead to success. Did your brain feel different afterward?

Student 2: Tired but good! Like I had really accomplished something.

Fellow: That is your brain growing! When we struggle with something challenging and eventually succeed, that is when new neural pathways form.

Student 3: I have a question. What if I try something new and fail completely?

Fellow: Another great question. First, redefine failure. In Growth Mindset, there is no such thing as failure - only learning opportunities. Each attempt teaches you something, even if it is this approach does not work.

Student 1: But some people seem to succeed easily at everything. Does that mean they have fixed talent?

Fellow: What looks like easy success is often years of hidden practice. Think about athletes who make things look effortless - you are not seeing thousands of hours of training behind that performance.

Student 2: That makes sense. My cousin seems naturally good at everything, but I know he studies a lot.

Fellow: Exactly! We often do not see the effort behind others success. That is why comparing ourselves to others is not helpful - we do not know their full story.

Student 3: How do we stay motivated when progress is slow?

Fellow: Focus on process goals rather than outcome goals. Instead of get an A, focus on study for 30 minutes each day or ask for help when confused. Process goals are within your control.

Student 1: I like that idea. Outcome goals can feel overwhelming.

Fellow: They can! Process goals keep you grounded in what you can actually do each day.

Student 2: What about when other people criticize us or say we are not good at something?

Fellow: That is tough, but remember: feedback is information, not judgment. Constructive criticism helps us identify areas for growth. Unhelpful criticism says more about other person than about you.

Student 3: How do we know the difference?

Fellow: Constructive feedback is specific and actionable: Your presentation would be stronger if you made more eye contact. Unhelpful criticism is vague and personal: You are bad at presentations.

Student 1: I never thought about it that way.

Fellow: Growth Mindset changes how we interpret everything - effort, struggle, feedback, even success. Success is not proof of fixed ability - it is result of effective strategies and hard work.

Student 2: This is changing how I think about school.

Fellow: That is my hope for all of you! When you approach challenges with curiosity instead of fear, learning becomes exciting rather than threatening.

Student 3: Can we share one thing we will practice this week?

Fellow: I would love that! Who wants to start?

Student 1: I am going to try drawing for 10 minutes every day, even if I think my drawings are bad.

Fellow: Perfect! Focus on practice, not product.

Student 2: I will use yet when I catch myself saying I can not.

Fellow: Excellent! That small word can make a huge difference.

Student 3: I will ask questions in class when I do not understand instead of staying quiet.

Fellow: That is brave and smart! Questions show you are engaged and ready to learn.

You are all demonstrating Growth Mindset right now by being open to new ideas and willing to try new approaches. Remember, growth is not always comfortable, but it is always worth it. Keep practicing these strategies, and I promise you will see changes in how you approach challenges and in what you believe you can achieve!`
  }
];

// GET handler to fetch therapy sessions
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await prisma.meeting.findMany({
      where: {
        supervisorId: session.user.id
      },
      include: {
        fellow: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        analyses: {
          select: {
            id: true,
            riskDetection: true,
            supervisorStatus: true,
            contentCoverage: true,
            facilitationQuality: true,
            protocolSafety: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// POST handler to create sessions
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, groupId, date, fellowId, transcript } = body;

    // Check if creating sample sessions (backward compatibility)
    if (action === 'sample') {
      return createSampleSessions(session.user.id);
    }

    // Create a real session
    if (!groupId || !date || !fellowId) {
      return NextResponse.json(
        { error: 'groupId, date, and fellowId are required' },
        { status: 400 }
      );
    }

    // Verify the fellow belongs to this supervisor
    const fellow = await prisma.fellow.findFirst({
      where: {
        id: fellowId,
        supervisorId: session.user.id,
        deletedAt: null
      }
    });

    if (!fellow) {
      return NextResponse.json(
        { error: 'Fellow not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Create the session
    const status = transcript ? 'PROCESSING' : 'PENDING';

    const newSession = await prisma.meeting.create({
      data: {
        groupId,
        date: new Date(date),
        transcript: transcript || '',
        status,
        fellowId,
        supervisorId: session.user.id
      },
      include: {
        fellow: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        analyses: {
          select: {
            id: true,
            riskDetection: true,
            supervisorStatus: true,
            contentCoverage: true,
            facilitationQuality: true,
            protocolSafety: true,
            createdAt: true
          }
        }
      }
    });

    // If transcript provided, trigger AI analysis
    if (transcript) {
      try {
        const analysis = await analyzeSession(transcript);

        await prisma.meetingAnalysis.create({
          data: {
            meetingId: newSession.id,
            summary: analysis.summary,
            contentCoverage: analysis.contentCoverage,
            facilitationQuality: analysis.facilitationQuality,
            protocolSafety: analysis.protocolSafety,
            riskDetection: analysis.riskDetection
          }
        });

        // Update status based on risk detection
        const riskStatus = (analysis.riskDetection as { status?: string })
          ?.status;
        const finalStatus =
          riskStatus === 'RISK' ? 'FLAGGED_FOR_REVIEW' : 'PROCESSED';

        await prisma.meeting.update({
          where: { id: newSession.id },
          data: { status: finalStatus }
        });

        newSession.status = finalStatus;
      } catch (analysisError) {
        console.error('AI Analysis failed:', analysisError);
        await prisma.meeting.update({
          where: { id: newSession.id },
          data: { status: 'PENDING' }
        });
        newSession.status = 'PENDING';
      }
    }

    return NextResponse.json({
      message: 'Session created successfully',
      session: {
        id: newSession.id,
        groupId: newSession.groupId,
        date: newSession.date,
        status: newSession.status,
        transcript: newSession.transcript,
        fellow: newSession.fellow,
        analyses: newSession.analyses.map(a => ({
          id: a.id,
          riskDetection: a.riskDetection,
          supervisorStatus: a.supervisorStatus,
          contentCoverage: a.contentCoverage,
          facilitationQuality: a.facilitationQuality,
          protocolSafety: a.protocolSafety,
          createdAt: a.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

async function createSampleSessions(supervisorId: string) {
  try {
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId }
    });

    const fellows = await prisma.fellow.findMany({
      where: { supervisorId }
    });

    if (!supervisor || fellows.length === 0) {
      return NextResponse.json(
        { error: 'No supervisor or fellows found. Run /api/seed first.' },
        { status: 400 }
      );
    }

    const sessions = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const fellow = fellows[i % fellows.length];
      const sampleData = SAMPLE_TRANSCRIPTS[i % SAMPLE_TRANSCRIPTS.length];

      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() - (9 - i));
      sessionDate.setHours(14 + Math.floor(Math.random() * 4), 0, 0, 0);

      const meeting = await prisma.meeting.create({
        data: {
          groupId: `${sampleData.groupId}-${i + 1}`,
          date: sessionDate,
          transcript: sampleData.transcript,
          status: ['PENDING', 'PROCESSED', 'FLAGGED_FOR_REVIEW', 'SAFE'][
            Math.floor(Math.random() * 4)
          ],
          fellowId: fellow.id,
          supervisorId: supervisor.id
        },
        include: {
          fellow: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          analyses: {
            select: {
              id: true,
              riskDetection: true,
              supervisorStatus: true,
              contentCoverage: true,
              facilitationQuality: true,
              protocolSafety: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      sessions.push(meeting);
    }

    return NextResponse.json({
      message: 'Sample sessions created successfully',
      sessions: sessions.map(s => ({
        id: s.id,
        groupId: s.groupId,
        date: s.date,
        status: s.status,
        fellow: s.fellow,
        analyses: s.analyses.map(a => ({
          id: a.id,
          riskDetection: a.riskDetection,
          supervisorStatus: a.supervisorStatus,
          contentCoverage: a.contentCoverage,
          facilitationQuality: a.facilitationQuality,
          protocolSafety: a.protocolSafety,
          createdAt: a.createdAt
        }))
      }))
    });
  } catch (error) {
    console.error('Sample sessions creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create sample sessions' },
      { status: 500 }
    );
  }
}
