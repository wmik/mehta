import { z } from 'zod'

// Main session analysis schema
export const sessionAnalysisSchema = z.object({
  summary: z.string().describe("3-sentence summary of the therapy session"),
  
  contentCoverage: z.object({
    score: z.number().min(1).max(3).describe("1=Missed, 2=Partial, 3=Complete"),
    rating: z.enum(["Missed", "Partial", "Complete"]).describe("Content coverage rating"),
    justification: z.string().describe("Justification for the content coverage score")
  }).describe("Did the Fellow teach the Growth Mindset concept?"),
  
  facilitationQuality: z.object({
    score: z.number().min(1).max(3).describe("1=Poor, 2=Adequate, 3=Excellent"),
    rating: z.enum(["Poor", "Adequate", "Excellent"]).describe("Facilitation quality rating"),
    justification: z.string().describe("Justification for the facilitation quality score")
  }).describe("How well did the Fellow deliver the content?"),
  
  protocolSafety: z.object({
    score: z.number().min(1).max(3).describe("1=Violation, 2=Minor Drift, 3=Adherent"),
    rating: z.enum(["Violation", "Minor Drift", "Adherent"]).describe("Protocol adherence rating"),
    justification: z.string().describe("Justification for the protocol safety score")
  }).describe("Did the Fellow stay within Shamiri protocol boundaries?"),
  
  riskDetection: z.object({
    status: z.enum(["SAFE", "RISK"]).describe("Risk status of the session"),
    quote: z.string().optional().describe("Exact quote indicating risk if RISK status"),
    explanation: z.string().describe("Explanation for risk detection decision")
  }).describe("Critical risk detection for self-harm or crisis indicators")
})

// AI prompt template
export const SESSION_ANALYSIS_PROMPT = `
You are an expert psychology supervisor analyzing therapy sessions conducted by Shamiri Fellows (lay providers aged 18-22) delivering group therapy to young people.

CONTEXT:
- Fellows teach "Growth Mindset" (abilities can be developed through dedication and hard work)
- Key phrases to look for: "brain is a muscle," "learning from failure," "effort matters more than talent"
- Fellows must stay within protocol boundaries (no medical advice, no pop psychology)
- Sessions are 40-60 minutes long with multiple participants

ANALYSIS CRITERIA:

1. CONTENT COVERAGE (Did they teach Growth Mindset?)
- Missed (1): Failed to mention or defined incorrectly
- Partial (2): Mentioned but moved on quickly without checking understanding  
- Complete (3): Explained clearly, gave example, asked for thoughts

2. FACILITATION QUALITY (How did they deliver it?)
- Poor (1): Dominated conversation, interrupted, used confusing jargon
- Adequate (2): Polite but transactional, stuck to script without deep engagement
- Excellent (3): Warm, encouraged quiet members, validated feelings

3. PROTOCOL SAFETY (Did they stay within boundaries?)
- Violation (1): Gave unauthorized advice (medical/relationship) or strayed significantly off-topic
- Minor Drift (2): Got distracted by side conversation but eventually brought it back
- Adherent (3): Stayed focused on curriculum, handled distractions gracefully

4. RISK DETECTION (Critical safety check)
- Look for indications of self-harm, suicidal thoughts, severe crisis
- Extract exact quote if risk is detected
- Be conservative - when in doubt, flag for review

Analyze the transcript thoroughly and provide structured output for each criterion with specific justifications based on the actual conversation content.
`

// Type exports
export type SessionAnalysis = z.infer<typeof sessionAnalysisSchema>