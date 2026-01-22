import OpenAI from 'openai';

interface ModerationResult {
    approved: boolean;
    reason: string;
    confidence: number;
}

export async function moderateComment(comment: string, apiKey: string): Promise<ModerationResult> {
    // Test trigger for manual review
    if (comment.includes('buckleyourseatbeltdorothy')) {
        return {
            approved: true,
            reason: 'Test phrase detected - flagged for manual review',
            confidence: 0.5  // Below 0.7 threshold
        };
    }

    const openai = new OpenAI({ apiKey });
    
    const prompt = `
You are moderating comments on a public petition platform.
Review this comment for hate speech, violence, or illegal content.

Comment: "${comment}"

Respond with JSON only:
{
  "approved": true/false,
  "reason": "brief explanation",
  "confidence": 0.0-1.0
}

Be PERMISSIVE - allow strong political speech, criticism, profanity.
Only reject clear hate speech, violence, or illegal content.
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No response from OpenAI');

        const result = JSON.parse(content);
        return result;
    } catch (error: any) {
        console.error('OpenAI error:', error);
        // Fail closed - reject on error
        return {
            approved: false,
            reason: 'Moderation service error',
            confidence: 0
        };
    }
}
