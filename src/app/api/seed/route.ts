import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const TRANSCRIPTS = [
  {
    groupId: 'GRP-001',
    transcript: `Fellow: Good morning everyone! Welcome to our session on Growth Mindset. Today we are going to talk about how our abilities can grow stronger with practice, just like muscles do in the gym.

Student 1: What does that mean exactly? I've always thought some people are just born smart.

Fellow: That's a really common belief, and I used to think the same way too. But here's what research shows: when we believe our abilities can grow, they actually do! Scientists call this a Growth Mindset. Think of your brain like a muscle - the more you exercise it with challenging problems, the stronger it becomes.

Student 2: But I've tried really hard in math and I still struggle. Doesn't that mean I'm just not good at it?

Fellow: That's such an important question. Struggle is actually a sign that your brain is growing! When you work through a difficult problem, your brain forms new connections. It's not about giving up easily - it's about keeping going even when it's hard. Have you heard the phrase "I can't do this yet"?

Student 3: Oh! Like adding "yet" to the end of what you can't do?

Fellow: Exactly! Instead of saying "I'm bad at math," try saying "I'm bad at math... yet." That small word changes everything. It means you believe you can learn, you just haven't learned it yet. Who wants to share one thing they've been struggling with, and then add "yet" to the end?

Student 1: I'm not good at public speaking... yet.

Fellow: Beautiful! And think about it - every great speaker started somewhere. They weren't born being good at it. They practiced, they got nervous, they learned from each experience. The question isn't whether you can do it - it's how long you're willing to work at it.

Student 2: What if we try really hard and still fail?

Fellow: Failure is not the opposite of success - it's part of success! Every time you fail and try again, your brain learns something new. Thomas Edison failed over a thousand times before creating the lightbulb. When asked about it, he said he didn't fail - he just found ways that didn't work. Let's try an exercise. Think of something you gave up on. What would happen if you tried again with a Growth Mindset?

Student 3: I stopped learning guitar because my fingers hurt.

Fellow: That's a perfect example! Your fingers hurt because you're building calluses and muscle memory. That's literally your body adapting and growing. Keep going through that discomfort and you'll be playing songs before you know it. Remember: abilities are not fixed. They're waiting to be developed through dedication and hard work. That's what Growth Mindset is all about.`
  },
  {
    groupId: 'GRP-002',
    transcript: `Fellow: Hello everyone! Welcome back. Last week we introduced the concept of Growth Mindset - the idea that our abilities can grow through effort. Today I want to go deeper into how exactly this works in our brains.

Student 1: I found it really interesting when you said the brain is like a muscle. How does that work exactly?

Fellow: Great question! Your brain is made up of billions of cells called neurons. When you learn something new or practice a skill, these neurons actually form new connections. It's called neuroplasticity - your brain's ability to change and adapt. The more you challenge yourself, the more of these connections you build.

Student 2: So does that mean I can get smarter by just trying hard?

Fellow: It's not quite that simple, but you're on the right track. It's about the kind of effort you put in. Working hard on easy tasks won't grow your brain much. But working hard on challenging tasks - ones that push you just outside your comfort zone - that's when the magic happens. This is called "desirable difficulty."

Student 3: That sounds like when my teacher gives us problems that are a little too hard.

Fellow: Exactly! Those problems feel frustrating, but that's your brain growing. The key is to stay in that challenging zone - not so easy that you're bored, but not so hard that you give up. We call this the "learning zone." Who can think of a time when they were in their learning zone?

Student 1: When I started playing video games. At first everything was confusing, but now I'm really good.

Fellow: That's a perfect example! You didn't become good at video games overnight. You struggled through the early levels, you died a lot, you learned the controls. Each challenge made your skills sharper. Now think about applying that same patience and persistence to something academic or physical.

Student 2: But with video games it's fun. School is boring.

Fellow: That's a fair point. Here's something to think about: you can make any learning more engaging. What if you turned your homework into a game? Could you race yourself to finish problems? Could you create a reward system? The key is to find ways to stay motivated through the challenging parts.

Student 3: My brother says I'm not smart enough for advanced classes. It makes me want to give up.

Fellow: Oh, I really want to address that. Your brother's statement has no scientific basis. There's no such thing as being "not smart enough" for something. What there is, is needing more time or different strategies. Would you tell a baby they're not smart enough to walk because they keep falling down? No! You'd encourage them to keep trying. The same applies to you.

Student 1: So I should just ignore people who say I can't do something?

Fellow: I wouldn't say ignore them exactly. But you can choose whose voices you listen to. Instead of listening to fixed mindset voices - like "you're not naturally good at this" - try listening to growth mindset voices: "you haven't figured it out yet" or "what strategy could you try next?" Your brain is capable of amazing growth. The question is: are you willing to put in the time and effort?

Student 2: I am. I want to try harder in my classes this semester.

Fellow: That's the spirit! Let's make a commitment. Think of one subject or skill where you want to develop a Growth Mindset. At our next session, share one way you're going to challenge yourself in that area. Remember: growth happens when we step outside our comfort zones. Let's do this!`
  },
  {
    groupId: 'GRP-003',
    transcript: `Fellow: Good afternoon everyone! Today we're going to talk about something that can be really scary: failure. We'll explore how failure is actually one of the most important parts of learning and growing.

Student 1: I hate failing at things. It makes me feel terrible about myself.

Fellow: I completely understand that feeling. When we fail, our first instinct is often to think something is wrong with us - that we're not good enough. But what if I told you that failure is actually necessary for success?

Student 2: That doesn't make sense. Shouldn't we try to avoid failing?

Fellow: Think about learning to ride a bike. If you never fell off, you'd never learn, right? Each fall teaches your brain and body what doesn't work. The same is true for everything in life. Every time you "fail" at something, you're actually learning what doesn't work, which brings you closer to what does.

Student 3: But what if I keep failing over and over? Doesn't that mean I'm just not meant to do it?

Fellow: That's the fixed mindset talking! Let me share some examples. Michael Jordan was cut from his high school basketball team. J.K. Rowling was rejected by 12 publishers before Harry Potter became a bestseller. Thomas Edison failed over a thousand times before creating the lightbulb. Did these people just give up? No! They saw each failure as feedback, not a verdict on their abilities.

Student 1: They must have been special though. They had talent.

Fellow: Here's the secret: talent is just the starting point. What matters more is what you do with that talent. People with Growth Mindset don't just rely on their natural abilities - they develop them through effort, strategies, and learning from mistakes. The effort is where the real magic happens.

Student 2: So I should just keep trying the same thing over and over?

Fellow: Not exactly! There's something called "deliberate practice." It's not just doing the same thing repeatedly. It's about pushing yourself to improve, getting feedback, and adjusting your strategies. If you keep doing the same thing and expecting different results, that's not Growth Mindset - that's just stubbornness!

Student 3: What should I do when I fail at something?

Fellow: Great question! Here's a simple formula: First, acknowledge the feeling. It's okay to feel disappointed. Second, ask yourself: what can I learn from this? Third, ask: what strategy can I try differently? Fourth, get back up and try again! Remember, the only real failure is giving up altogether.

Student 1: What if other people make fun of me for failing?

Fellow: That's a real concern, and it's not easy. But here's something to remember: people who mock others for trying are often scared to try themselves. The bravest thing you can do is to try, fail, learn, and try again. That's what Growth Mindset is all about. Would anyone like to share a time they failed at something but then eventually succeeded?

Student 2: I couldn't swim for a long time. I was scared of the water. But I kept taking lessons and now I'm one of the best swimmers in my class!

Fellow: That's beautiful! You pushed through fear and discomfort to develop a new skill. That's exactly what we're talking about. Failure is not the end of the story - it's just part of the journey. Let's commit to seeing failure as a teacher, not a judge. Who else has a story like that?`
  },
  {
    groupId: 'GRP-004',
    transcript: `Fellow: Welcome everyone! Today we're going to challenge a really common belief - the idea that some people are naturally talented while others just aren't. We'll explore where this belief comes from and how it holds us back.

Student 1: I definitely believe some people are born talented. Like my cousin - he's amazing at football without even trying.

Fellow: I hear that a lot, and I used to believe it too. But here's what most people don't see: those "natural" athletes spend hours practicing. They might make it look easy, but there's usually years of hard work behind it. The difference is we don't see the effort - we only see the result.

Student 2: But my friend barely studies and gets good grades. Doesn't that mean she's smart?

Fellow: Here's something interesting to consider: maybe your friend is studying in ways you don't see? Or maybe she's using strategies that work well for her. Also, "smart" isn't a fixed thing. There are many different types of intelligence. Someone might be great at math but struggle with writing, or vice versa.

Student 3: So nobody is actually smarter than anyone else?

Fellow: It's not about being smarter - it's about having different strengths and putting in different amounts of effort. The most important thing to remember is this: everyone can grow. Everyone! There's no ceiling on what you can learn or develop with the right strategies and effort.

Student 1: But what about people who are really good at music or art? Some people just seem to have that gift.

Fellow: Here's a story about Picasso. He was considered a prodigy, but he created thousands of works of art over his lifetime. Was it all masterpieces? No! He destroyed many of his own paintings. The point is, even "geniuses" produce lots of work that doesn't work out. The difference between successful people and others isn't lack of failure - it's that they keep going despite failures.

Student 2: My parents always tell me I'm not trying hard enough. It makes me feel bad.

Fellow: That can be really frustrating. Here's the thing though - your parents might be right about the effort, but the way they say it matters. Instead of thinking "I'm not good enough," try thinking "I'm not putting in the right effort yet." There's a big difference. Can you talk to your parents about how their words make you feel?

Student 3: What if I try really hard and still can't do something?

Fellow: Then you try a different approach! There's always another way to learn something. Maybe the way you're studying doesn't match how you learn best. Maybe you need a different teacher or tutor. Maybe you need to break the problem into smaller pieces. The answer is almost never "I just can't do it." The answer is usually "I haven't found the right way yet."

Student 1: This is making me think differently about things I gave up on.

Fellow: That's exactly what I hoped would happen! Let's try something. Think of something you gave up on because you thought you weren't good at it. Now think: what would happen if you tried again with a Growth Mindset? What different strategies might help? Who could support you? Remember: effort + good strategies = growth. That's the Growth Mindset formula.`
  },
  {
    groupId: 'GRP-005',
    transcript: `Fellow: Hello everyone! Today I want to share one of the most powerful words in the Growth Mindset vocabulary: YET. This little word can change everything about how you approach challenges.

Student 1: Yet? How can one word make such a big difference?

Fellow: Great question! The word "yet" implies that your current situation is temporary. Instead of saying "I can't do this" (which sounds permanent), you say "I can't do this... yet" (which implies change is possible). It's a small shift, but it changes your entire relationship with challenges.

Student 2: So it's like lying to yourself? Pretending you can do something you can't?

Fellow: Not at all! It's not about pretending. It's about recognizing that your abilities are not fixed. When you say "I can't do this... yet," you're acknowledging the current reality while also believing in future possibility. There's a big difference between "I'm not good at math" and "I'm not good at math... yet."

Student 3: Can you give us some examples?

Fellow: Absolutely! Instead of "I don't understand this," try "I don't understand this... yet." Instead of "I can't run that fast," try "I can't run that fast... yet." Instead of "I'm not a good writer," try "I'm not a good writer... yet." See how the meaning shifts?

Student 1: That actually does feel different. It sounds more hopeful.

Fellow: That's exactly the point! And here's what's fascinating: when you use "yet," you're more likely to actually put in the effort to get there. Because you believe growth is possible. Students who use Growth Mindset language like "yet" tend to persist longer and achieve more.

Student 2: My teacher gets annoyed when I say "I can't" even with yet. She says I'm making excuses.

Fellow: That's frustrating. There's a difference between using "yet" as a genuine belief versus using it as an excuse to not try. The key is to actually follow up "yet" with action. "I can't do this... yet, so let me try a different approach." That's the power combination!

Student 3: How do I remember to use yet instead of just giving up?

Fellow: Practice! It becomes a habit. You could even put a reminder somewhere - maybe on your mirror or in your notebook. Every time you catch yourself saying "I can't," pause and add "yet." Then ask yourself: what could I do to get to "yes"?

Student 1: I'm going to try this in my next math test.

Fellow: I love that! Here's a challenge for all of you: this week, try to notice every time you say "I can't" and add "yet" to the end. Then think of one step you could take to move from "can't" to "can." Remember: the story of your abilities is still being written. You haven't reached your full potential yet!`
  },
  {
    groupId: 'GRP-006',
    transcript: `Fellow: Good afternoon! Today we're going to talk about how Growth Mindset applies not just to school or sports, but to something we all experience: relationships. Yes, our ability to connect with others can grow too!

Student 1: Relationships? I thought Growth Mindset was just about being smarter or better at stuff.

Fellow: That's a common misconception! Growth Mindset actually applies to every area of life, including how we interact with family, friends, and even people we don't know well. Think about it - are some people just naturally "good with people" while others are not?

Student 2: Yeah, some of my friends are just popular and everyone likes them. I'm not like that.

Fellow: Here's the thing: popularity isn't a fixed trait. Some people seem naturally outgoing, but they might have worked on their social skills over years. The good news is, anyone can develop better relationship skills with practice and effort. It's exactly like learning any other skill.

Student 3: What relationship skills can we actually develop?

Fellow: Great question! Things like: active listening - really paying attention when someone speaks. Empathy - trying to understand how others feel. Communication - expressing your thoughts clearly without being mean. Conflict resolution - working through disagreements respectfully. These are all skills that get better with practice.

Student 1: But what if I say the wrong thing and people think I'm weird?

Fellow: That's the fear that holds most people back! Here's a secret: everyone feels awkward sometimes. The people who are "good at relationships" aren't perfect - they've just learned from their mistakes. Each conversation that goes awkwardly is practice! What did you learn? What might you try differently next time?

Student 2: My family fights a lot. Is there a Growth Mindset for that?

Fellow: There absolutely is! Instead of thinking "we're just a fighting family" (fixed), try thinking "we haven't learned how to communicate well yet" (growth). Then actually work on it! There are books, videos, and even counselors who can teach conflict resolution skills. The key is believing things can improve.

Student 3: What if someone just doesn't like me? Can I grow to make them like me?

Fellow: That's a tricky one. Here's the honest answer: you can't make everyone like you, no matter how hard you try. And that's okay! But you can grow to be more confident, kind, and easy to talk to. The right people will appreciate those qualities. Focus on becoming the best version of yourself, and the relationships will follow.

Student 1: This is different than what I expected to talk about.

Fellow: I hope it's a pleasant surprise! Growth Mindset isn't just about academic or physical skills. It's about believing you can improve in every area of life. And relationships are one of the most important areas! Who wants to pick one relationship skill they want to work on this week?`
  },
  {
    groupId: 'GRP-007',
    transcript: `Fellow: Welcome back! Today we're going to tackle something many students struggle with: academic challenges. We'll talk about how to use Growth Mindset when school gets tough.

Student 1: I really need this. I'm failing my chemistry class and I feel like giving up.

Fellow: I'm so glad you're here to talk about this. First, I want you to know that struggling in a subject doesn't mean you're not smart - it means you're learning! The brain grows most when we're challenged, not when things are easy.

Student 2: But I've been struggling for months. At some point, doesn't it mean I'm just not cut out for this?

Fellow: Let me ask you something: when you struggle, what do you typically do? Do you keep trying different approaches, or do you assume you can't do it and stop?

Student 1: I usually just feel bad about myself and then procrastinate.

Fellow: That's very common, but that's the fixed mindset trap! Here's a better approach: when you struggle, that's information. It tells you that your current strategy isn't working. What if you tried a different strategy? Maybe a tutor, different study methods, asking more questions, or breaking the material into smaller pieces?

Student 3: I try studying but I still fail the tests.

Fellow: Here's something important: studying isn't just about time - it's about strategy. How you study matters as much as how long you study. Are you doing practice problems? Teaching the material to someone else? Testing yourself? These active strategies work better than just re-reading notes.

Student 1: I mostly just re-read my textbook.

Fellow: That's one of the least effective study methods! Here's what works better: practice testing - quiz yourself. Interleaving - mix different types of problems. Elaborative interrogation - ask yourself why things work. These strategies feel harder in the moment, but they lead to much better learning.

Student 2: What if I don't have time for all that? I'm already so busy.

Fellow: Time management is part of the growth process! Can you look at your schedule and find 15 minutes for focused study? Quality matters more than quantity. Even 25 minutes of focused, strategic studying can be more helpful than an hour of unfocused reading.

Student 3: My parents keep yelling at me about my grades. It makes me want to give up even more.

Fellow: That sounds really hard. Here's something you could try: have a conversation with your parents about Growth Mindset. Explain that you're working on improving, and that their support matters more than their criticism. Everyone makes mistakes, and grades are just one measure of learning - not a measure of your worth or potential.

Student 1: I think I need to change how I think about all this.

Fellow: That's the first step! Remember: struggle is not failure - it's growth happening. Your brain is literally building new connections when you work through difficult material. The question isn't whether you can do it - it's how you're going to approach it. Will you try some new strategies this week?`
  },
  {
    groupId: 'GRP-008',
    transcript: `Fellow: Hello everyone! Today we're going to explore one of the most important Growth Mindset skills: resilience. Resilience is the ability to bounce back from challenges and keep going even when things are hard.

Student 1: I think I'm not a resilient person. When things go wrong, I just fall apart.

Fellow: Here's something important: resilience isn't a personality trait you're born with - it's a skill you can develop! Everyone can become more resilient with practice. Some people have just had more practice dealing with challenges.

Student 2: How do I become more resilient?

Fellow: Great question! Let's talk about some strategies. First, reframe failures as learning opportunities. When something goes wrong, ask yourself: what can I learn from this? Second, focus on what you can control. You can't control what happens to you, but you can control how you respond. Third, build your support system. Who can you talk to when things get tough?

Student 3: What if nothing ever goes right for me? It feels like I'm always failing.

Fellow: I want you to try something: for one week, keep a "wins" journal. Every day, write down three things that went well or three things you're grateful for. They can be small - "I got to school on time" or "my friend smiled at me." This trains your brain to notice positive things, which builds resilience over time.

Student 1: That sounds too simple. Will it actually help?

Fellow: It might seem simple, but it works! Our brains naturally focus on threats and problems - that's evolution. But we can train our brains to notice positives too. This is called "cognitive restructuring," and it's a real psychological technique used by therapists.

Student 2: What about when something really bad happens? Like failing a really important exam.

Fellow: That's when resilience really matters. Here's a process: First, allow yourself to feel the emotions. It's okay to be upset! Second, don't catastrophize - one bad thing doesn't mean everything is ruined. Third, ask: what can I do now? What's my next step? Fourth, take action, even if it's small. Each step forward builds momentum.

Student 3: Sometimes I just feel like giving up on everything.

Fellow: I've been there too. When those feelings come, it helps to talk to someone - a friend, family member, counselor, or even me. You don't have to go through hard times alone. And remember: feelings are not facts. Just because you feel like giving up doesn't mean you have to.

Student 1: This is making me think about things differently.

Fellow: That's what I hope! Resilience is one of the most important skills you can develop. It's not about avoiding challenges - it's about facing them and growing through them. Every time you bounce back from a setback, you become stronger. Who wants to share one challenge they're currently facing and one step they could take?`
  },
  {
    groupId: 'GRP-009',
    transcript: `Fellow: Good afternoon! Today we're going to explore how Growth Mindset applies to something everyone cares about: success in sports and life. We'll talk about how the way we think about effort affects our results.

Student 1: I'm really into sports. How does Growth Mindset apply to athletics?

Fellow: Awesome! Let me ask you something: have you ever watched an athlete and thought they were just "naturally" gifted?

Student 1: Yeah, like professional athletes. They make everything look so easy.

Fellow: Here's what most people don't see: those athletes have usually spent thousands of hours training. Michael Jordan was cut from his high school team before becoming one of the greatest players ever. Serena Williams lost countless matches before becoming a champion. Their "talent" is actually years of hard work that we don't see.

Student 2: But some people definitely have natural advantages, right? Like height in basketball?

Fellow: You're right that physical attributes matter in some sports. But here's the growth mindset perspective: even with natural advantages, those athletes still had to work incredibly hard to develop their skills. And many athletes with fewer "natural" advantages have succeeded through determination and strategy. Height helps in basketball, but it's not the only thing that matters.

Student 3: What about when you get injured? That's out of your control.

Fellow: That's a great point, and it happens to many athletes. Here's where Growth Mindset really matters: when you can't control what happens to you, focus on what you can control. Can you train other skills? Can you study the game differently? Can you work on your mental game? Some athletes come back from injuries even stronger because they used the time to grow in other ways.

Student 1: What about when you lose a big game? That feels terrible.

Fellow: It does feel terrible! But losing is part of every athlete's journey. The question is: what do you do after a loss? Do you beat yourself up and give up? Or do you analyze what went wrong, learn from it, and come back stronger? The second approach is the Growth Mindset approach.

Student 2: My coach just yells at us when we mess up. It makes me want to quit.

Fellow: That's really hard. Here's the thing: negative feedback, even when it's delivered badly, can still contain useful information. Can you separate the emotion from the message? Is there something actually useful you can learn? Also, remember that your worth isn't tied to your performance. You're more than an athlete!

Student 3: How do I stay motivated when I'm not seeing improvement?

Fellow: That's a common challenge! First, remember that improvement isn't always linear. Sometimes you work hard and don't see results immediately, but then one day it clicks. Second, focus on process goals instead of just outcome goals. Instead of "I want to win," try "I want to practice my free throws for 30 minutes every day." Process goals are more within your control.

Student 1: This is really helpful. I'm going to apply this to my training.

Fellow: That's exactly what I want to hear! Remember: success in sports and life comes from effort, strategies, and learning from setbacks. Not from being "naturally" gifted. The moment you believe you can grow, you start on the path to growth. Who else has a goal they want to work on?`
  },
  {
    groupId: 'GRP-010',
    transcript: `Fellow: Welcome everyone! Today is our final session, and I want to bring everything together. We'll talk about how to apply Growth Mindset in your daily life and make a plan for continued growth.

Student 1: I can't believe this is our last session! I've learned so much.

Fellow: I've really enjoyed our time together too! Let's make sure we leave with a clear plan. Who wants to share one thing they've learned about Growth Mindset over these past weeks?

Student 1: I learned that my brain can actually grow and change. That's crazy to think about!

Student 2: I learned about the word "yet" - it's so simple but really powerful.

Student 3: I learned that failure isn't the end. It's actually part of learning.

Fellow: Those are all such important lessons! Now let's talk about how to keep this going. Here's my challenge to you: I want each of you to choose one area of your life where you want to apply Growth Mindset. It could be academics, relationships, sports, or anything else.

Student 1: I want to improve in math. I'm really struggling.

Fellow: Perfect! Now let's make a specific plan. Instead of "I want to get better at math," try "I will practice math problems for 20 minutes every day after school, and I will ask my teacher for help once a week." See how much more specific that is?

Student 2: I want to be better with people. I'm really shy.

Fellow: That's a great goal! How might you break that down? Maybe: "I will say hi to one new person each day" or "I will practice active listening in conversations." Small steps add up to big changes over time!

Student 3: I want to stop giving up when things get hard.

Fellow: That's a powerful goal! Here's a strategy: when you feel like giving up, pause and ask yourself: "What strategy could I try differently?" Then try one more time. Even if you don't succeed, you're training your brain to persist. Each time you push through difficulty, you get stronger.

Student 1: What if I fail? Won't that feel bad?

Fellow: Failure will feel bad sometimes - that's normal! But here's the key: don't let failure stop you. Instead, ask: "What did this teach me?" and "What will I do differently next time?" Then try again. The only way to truly fail is to stop trying altogether.

Student 2: I'm going to miss this group. Can we stay in touch?

Fellow: I would love that! Let's exchange contact information if you're comfortable. And remember - you can always come back and talk to me if you need support. Growth doesn't happen alone. We need people to encourage us and hold us accountable.

Student 3: Thank you for teaching us all this. It's really changed how I think about myself.

Fellow: That means so much to me! You all have the power to grow and change. That's not just something I hope for you - it's scientifically true! Your brains are literally capable of amazing growth. The question is: what will you do with that power?

Student 1: I'm going to work hard and never give up!

Fellow: I love that spirit! Remember: growth happens when we step outside our comfort zones, try new strategies, and persist through challenges. You're all capable of incredible things. I'm so proud of the growth I've seen in each of you these past weeks. Keep believing in yourselves, keep working hard, and keep growing!`
  }
];

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supervisor = await prisma.user.findUnique({
      where: { email: session.user.email ?? undefined }
    });

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    const fellows = await prisma.fellow.findMany({
      where: { supervisorId: supervisor.id }
    });

    if (fellows.length === 0) {
      return NextResponse.json(
        { error: 'No fellows found. Please ensure fellows are seeded first.' },
        { status: 400 }
      );
    }

    const existingMeetings = await prisma.meeting.count({
      where: { supervisorId: supervisor.id }
    });

    if (existingMeetings >= 10) {
      return NextResponse.json({
        message: 'Data already seeded',
        meetingsCount: existingMeetings,
        fellowsCount: fellows.length
      });
    }

    const meetings = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const fellow = fellows[i % fellows.length];
      const transcriptData = TRANSCRIPTS[i];

      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() - (9 - i));
      sessionDate.setHours(14 + Math.floor(Math.random() * 4), 0, 0, 0);

      const statuses = ['PENDING', 'PROCESSED', 'FLAGGED_FOR_REVIEW', 'SAFE'];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      const meeting = await prisma.meeting.create({
        data: {
          groupId: transcriptData.groupId,
          date: sessionDate,
          transcript: transcriptData.transcript,
          status: randomStatus,
          fellowId: fellow.id,
          supervisorId: supervisor.id
        },
        include: {
          fellow: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      meetings.push(meeting);
    }

    return NextResponse.json({
      message: 'Database seeded successfully with 10 unique therapy sessions',
      meetingsCreated: meetings.length,
      sessions: meetings.map(m => ({
        id: m.id,
        groupId: m.groupId,
        date: m.date.toISOString(),
        status: m.status,
        fellow: m.fellow.name
      }))
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
