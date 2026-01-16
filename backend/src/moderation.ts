import OpenAI from 'openai';

interface ModerationResult {
    approved: boolean;
    reason: string;
    confidence: number;
}

export async function moderateComment(comment: string, apiKey: string): Promise<ModerationResult> {
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
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { approved: false, reason: 'No response from AI', confidence: 0 };
        }
        const result = JSON.parse(content);
        return {
            approved: result.approved || false,
            reason: result.reason || 'Unknown',
            confidence: result.confidence || 0
        };
    } catch (error) {
        console.error('Moderation error:', error);
        return {
            approved: false,
            reason: 'Error - needs manual review',
            confidence: 0
        };
    }
}